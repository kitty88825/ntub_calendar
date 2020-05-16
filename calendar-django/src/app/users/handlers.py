import re

from django.contrib.auth.models import Group
from django.db.transaction import atomic

from .models import User

from typing import List


@atomic
def update_user(data: dict) -> User:

    fields = ['username',
              'email',
              'last_name',
              'first_name',
              'is_active',
              'last_login',
              'role']
    snake_res = {key: value for key, value in data.items() if key in fields}
    user, created = User.objects.update_or_create(username=snake_res.pop('username'), defaults=snake_res)  # noqa: E501

    update_group(user, data['groups'])
    group_add_role(user, snake_res.get('role'))

    return user


def group_add_role(user: User, role: str):
    group_role = Group.objects.get(name=role)
    group_role.user_set.add(user)


def update_group(user: User, data: dict) -> None:
    if not data:
        return None

    for d in data:
        group = Group.objects.get(name=d['display'])
        group.user_set.add(user)


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


def filter_group(data: List[dict]) -> dict:
    group_list = {d['name']: d['display'] for d in data}

    return group_list
