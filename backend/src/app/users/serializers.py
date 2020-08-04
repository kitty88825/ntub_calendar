from django.shortcuts import reverse

from rest_framework import serializers

from .models import User, CommonMeeting


class LoginSerializer(serializers.Serializer):
    access_token = serializers.CharField(help_text='Google OAuth2 AccessToken')


class UserSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'code', 'groups', 'url')

    def get_url(self, user):
        return self.context['request'] \
            .build_absolute_uri(reverse('ical', kwargs=dict(code=user.code)))


class CommonMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonMeeting
        fields = ('id', 'title', 'creator', 'participant')
        read_only_fields = ('id', 'creator')
