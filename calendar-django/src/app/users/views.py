from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from requests.exceptions import HTTPError

from .serializers import LoginSerializer
from .inc_auth_api import IncAuthClient
from .handlers import update_user


class AccountView(GenericViewSet):
    serializer_class = LoginSerializer
    api_client = IncAuthClient

    @action(['POST'], detail=False)
    def login(self, request: Request) -> Response:
        # 取得 token
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            access_token = serializer.data.get('access_token')
            response = self.inc_auth.login(access_token)

        except HTTPError as e:
            return Response(e.response, status=e.response.status_code)

        # 取得使用者資訊
        token = response['access']
        user_data = self.inc_auth.current_user(token)
        user = update_user(user_data)

        # 取得所有群組資料
        # group_data = self.inc_auth.group_list(token)
        # grous = filter_group(group_data)
        # print(grous)

        return Response(dict(email=user.email), status=status.HTTP_200_OK)

    def get_api_client(self):
        # 如果需要可以複寫或是餵入客製化參數
        return self.api_client()

    @property
    def inc_auth(self):
        return self.api_client()
