from rest_framework import authentication
from rest_framework import exceptions
from .models import AuthToken


class TokenAuthentication(authentication.BaseAuthentication):
    """
    Custom token-based authentication.
    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string "Token ". For example:
        Authorization: Token 401f7ac837da42b97f613d789819ff93537bee6a
    """

    keyword = 'Token'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None

        parts = auth_header.split()

        if len(parts) == 0:
            return None

        if parts[0].lower() != self.keyword.lower():
            return None

        if len(parts) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(parts) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        try:
            token = parts[1]
        except UnicodeError:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain invalid characters.')

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, key):
        try:
            token = AuthToken.objects.select_related('member').get(key=key)
        except AuthToken.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')

        return (token.member, token)

    def authenticate_header(self, request):
        return self.keyword
