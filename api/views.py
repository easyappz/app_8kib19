from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from .models import Member, AuthToken, Message
from .serializers import (
    MemberRegisterSerializer,
    MemberLoginSerializer,
    MemberProfileSerializer,
    MessageSerializer
)
from .authentication import TokenAuthentication


class RegisterView(APIView):
    """
    Register a new user account.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=MemberRegisterSerializer,
        responses={201: MemberRegisterSerializer},
        description="Create a new user account"
    )
    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            
            # Create authentication token
            token = AuthToken.objects.create(member=member)
            
            return Response({
                'id': member.id,
                'username': member.username,
                'email': member.email,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticate user and return token.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=MemberLoginSerializer,
        responses={200: dict},
        description="Authenticate user and return token"
    )
    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                member = Member.objects.get(username=username)
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not member.check_password(password):
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new token or get existing
            token, created = AuthToken.objects.get_or_create(member=member)
            if not created:
                # Optionally, delete old token and create new one
                token.delete()
                token = AuthToken.objects.create(member=member)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': member.id,
                    'username': member.username,
                    'email': member.email
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout user by invalidating token.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: dict},
        description="Invalidate user authentication token"
    )
    def post(self, request):
        # Delete the token used for authentication
        if hasattr(request, 'auth') and request.auth:
            request.auth.delete()
        
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):
    """
    Get or update user profile.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MemberProfileSerializer},
        description="Retrieve current user profile information"
    )
    def get(self, request):
        serializer = MemberProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=MemberProfileSerializer,
        responses={200: MemberProfileSerializer},
        description="Update current user profile information"
    )
    def put(self, request):
        serializer = MemberProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageListCreateView(APIView):
    """
    List all messages or create a new message.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: dict},
        description="Retrieve list of all chat messages"
    )
    def get(self, request):
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        
        messages = Message.objects.all()
        total_count = messages.count()
        
        messages = messages[offset:offset + limit]
        serializer = MessageSerializer(messages, many=True)
        
        return Response({
            'count': total_count,
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        request=MessageSerializer,
        responses={201: MessageSerializer},
        description="Create a new chat message"
    )
    def post(self, request):
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
