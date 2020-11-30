import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

from .choices import RoleChoice


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given email, and password.
        """
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    code = models.UUIDField(default=uuid.uuid4, editable=True)
    verification_code = models.UUIDField(default=uuid.uuid4, editable=True)
    role = models.CharField(
        max_length=15,
        choices=RoleChoice.choices,
        default=RoleChoice.unknow,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def username(self):
        return self.email.split('@')[0]


class CommonParticipant(models.Model):
    title = models.CharField('會議名稱', max_length=255)
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='common_participant_creators',
    )
    participant = models.ManyToManyField(
        User,
        related_name='common_participant_participants',
    )

    def __str__(self):
        return self.title
