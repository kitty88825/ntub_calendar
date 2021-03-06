import uuid

from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from requests.exceptions import HTTPError

from .serializers import (
    LoginSerializer,
    UserSerializer,
    CommonParticipantSerializer,
)
from .models import CommonParticipant
from .inc_auth_api import IncAuthClient
from .handlers import update_user


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


class AccountView(GenericViewSet):
    serializer_class = LoginSerializer
    api_client = IncAuthClient

    def get_serializer_class(self):
        if self.action == 'me' or self.action == 'update_code':
            return UserSerializer

        return super().get_serializer_class()

    @property
    def inc_auth(self):
        return self.api_client()

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
        access_token = get_tokens_for_user(user)

        return Response(
            dict(
                email=user.email,
                staff=user.is_staff,
                token=access_token,
            ), status=status.HTTP_200_OK,
        )

    @action(['GET'], detail=False, permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(instance=request.user)

        return Response(serializer.data)

    @action(['POST'], detail=False, permission_classes=[IsAuthenticated])
    def update_code(self, request):
        request.user.code = uuid.uuid4()
        request.user.save()
        serializer = self.get_serializer(request.user)

        return Response(serializer.data)


class CommonParticipantViewSet(ModelViewSet):
    queryset = CommonParticipant.objects.all()
    serializer_class = CommonParticipantSerializer
    permission_classes = [IsAuthenticated]

    # 只回傳使用者建立的 CommonParticipant
    def get_queryset(self):
        creator = self.request.user
        if creator:
            return CommonParticipant.objects.filter(creator=creator.id)

    def perform_create(self, serializers):
        serializers.save(creator=self.request.user)
