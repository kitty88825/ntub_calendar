from django.contrib.auth.models import AbstractUser
from django.db import models

import uuid


class User(AbstractUser):
    email = models.EmailField(unique=True)
    code = models.UUIDField(default=uuid.uuid4, editable=False)
