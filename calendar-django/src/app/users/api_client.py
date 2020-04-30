import logging
import requests

from django.conf import settings
from djangorestframework_camel_case.settings import api_settings
from djangorestframework_camel_case.util import underscoreize


class BaseAPIClient:
    _base_url = 'https://example.com/api'
    _headers = {
        'Content-Type': 'application/json',
    }
    _json_underscoreize = api_settings.JSON_UNDERSCOREIZE

    _debug = settings.DEBUG
    _session = requests.Session()

    def _log(self, msg: str):
        if self._debug:
            print(msg)
        else:
            logging.info(msg)

    def _handle_response(self, response: 'requests.Response'):
        if response.ok:
            return underscoreize(response.json(), **self._json_underscoreize)
        self._log(response.text)
        response.raise_for_status()

    def setup_auth_header(self, token: str, auth_type: str):
        self._headers.update({
            'Authorization': f'{auth_type} {token}',
        })

    def get(self, path, params=None):
        res = self._session.get(f'{self._base_url}{path}', params=params, headers=self._headers)  # noqa: E501
        return self._handle_response(res)

    def post(self, path, payload):
        res = self._session.post(f'{self._base_url}{path}', json=payload, headers=self._headers)  # noqa: E501
        return self._handle_response(res)
