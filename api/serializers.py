from rest_framework import serializers
from .models import Member, Message


class MemberRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        member = Member(
            username=validated_data['username'],
            email=validated_data['email']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class MemberLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class MemberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_username(self, value):
        if Member.objects.filter(username=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if Member.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username']


class MessageSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'text', 'author', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']

    def validate_text(self, value):
        if len(value) < 1:
            raise serializers.ValidationError("This field may not be blank.")
        if len(value) > 5000:
            raise serializers.ValidationError("Ensure this field has no more than 5000 characters.")
        return value
