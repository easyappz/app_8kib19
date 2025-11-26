import secrets
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    """User model for authentication and authorization"""
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=254, blank=True, null=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_member'
        ordering = ['-created_at']

    def __str__(self):
        return self.username

    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password is correct"""
        return check_password(raw_password, self.password)

    # Properties for DRF compatibility
    @property
    def is_authenticated(self):
        """Always return True for authenticated users"""
        return True

    @property
    def is_anonymous(self):
        """Always return False for authenticated users"""
        return False

    # Methods for permission system compatibility
    def has_perm(self, perm, obj=None):
        """Check if user has a specific permission"""
        return True

    def has_module_perms(self, app_label):
        """Check if user has permissions to view the app"""
        return True


class AuthToken(models.Model):
    """Authentication token model"""
    key = models.CharField(max_length=64, unique=True, db_index=True)
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='auth_tokens'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_authtoken'
        ordering = ['-created_at']

    def __str__(self):
        return f"Token for {self.member.username}"

    @classmethod
    def generate_key(cls):
        """Generate a random token key"""
        return secrets.token_hex(32)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)


class Message(models.Model):
    """Chat message model"""
    text = models.TextField()
    author = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_message'
        ordering = ['created_at']

    def __str__(self):
        return f"Message by {self.author.username} at {self.created_at}"