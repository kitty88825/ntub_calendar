from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from requests.exceptions import HTTPError

from .serializers import (
    LoginSerializer,
    UserSerializer,
    CommonMeetingSerializer,
)
from .inc_auth_api import IncAuthClient
from .handlers import update_user
from .models import CommonMeeting

from rest_framework.authtoken.models import Token


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

        user_token, created = Token.objects.get_or_create(user=user)

        return Response(dict(email=user.email, token=user_token.key), status=status.HTTP_200_OK)  # noqa: E501

    @property
    def inc_auth(self):
        return self.api_client()

    @action(['GET'], detail=False, permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(instance=request.user)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'me':
            return UserSerializer
        return super().get_serializer_class()


class CommonMeetingView(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CommonMeeting.objects.all()
    serializer_class = CommonMeetingSerializer

    def perform_create(self, serializers):
        serializers.save(creator=self.request.user)
