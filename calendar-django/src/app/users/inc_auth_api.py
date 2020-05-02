from typing import Optional, List

from django.conf import settings

from .api_client import BaseAPIClient


class IncAuthClient(BaseAPIClient):
    """
    NTUB INC Auth API Client
    """
    _base_url = f'{settings.NTUB_AUTH_API_URL}/api'

    def setup_auth_header(self, token, auth_type='JWT'):
        super().setup_auth_header(token, auth_type)

    def login(self, access_token: str) -> dict:
        payload = {
            'accessToken': access_token,
            'domain': settings.NTUB_AUTH_API_DOMAIN,
        }
        return self.post('/auth/login/', payload)

    def refresh(self, refresh: str) -> dict:
        payload = {
            'refresh': refresh,
        }
        return self.post('/auth/refresh/', payload)

    def verify(self, token: str) -> dict:
        payload = {
            'token': token,
        }
        return self.post('/auth/verify/', payload)

    def current_user(self, token: Optional[str] = None) -> dict:
        if token:
            self.setup_auth_header(token)
        return self.get('/users/me/')

    def current_group(self, token: Optional[str] = None) -> List[dict]:
        if token:
            self.setup_auth_header(token)
        return self.get('/groups/me/')

    def user_get_by(self, id: int, token: Optional[str] = None):
        if token:
            self.setup_auth_header(token)
        return self.get(f'/users/{id}/')

    def group_list(self, token: Optional[str] = None) -> List[dict]:
        if token:
            self.setup_auth_header(token)
        return self.get('/groups/')

    def group_choices(self) -> List[dict]:
        return self.get('/groups/choice/')

    def group_get_by(self, id: int, token: Optional[str] = None) -> dict:
        if token:
            self.setup_auth_header(token)
        return self.get(f'/groups/{id}/')
