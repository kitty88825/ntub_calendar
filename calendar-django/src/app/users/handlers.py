import re

from django.contrib.auth.models import User, Group
from django.db.transaction import atomic


@atomic
def update_user(data: dict) -> User:

    fields = ['email',
              'first_name',
              'is_active',
              'is_staff',
              'is_superuser',
              'last_login',
              'last_name',
              'username']
    snake_res = {key: value for key, value in data.items() if key in fields}
    user, created = User.objects.update_or_create(username=snake_res.pop('username'), defaults=snake_res)  # noqa: E501

    update_group(user, data['groups'])

    return user


def update_group(user: User, data: dict) -> None:
    if not data:
        return None

    for d in data:
        group, created = Group.objects.update_or_create(id=d['id'], name=d['name'])  # noqa: E501
        user.groups.add(group)


def get_match(email):
    username, domain = email.split('@')
    pattern = r'^[0-9A-Z][0-9]{3}[0-9A-Z]{1}[0-9]{3}[0-9]?'
    match_username = re.fullmatch(pattern, username)
    match_domain = re.fullmatch(r'ntub.edu.tw', domain)

    if match_domain is None:
        # Not a NTUB account
        return None
    elif match_username is None:
        # Teacher
        return False
    else:
        # Student
        return True
