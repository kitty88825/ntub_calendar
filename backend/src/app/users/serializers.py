from django.shortcuts import reverse

from rest_framework import serializers

from .models import User, CommonParticipant


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


class CommonParticipantSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    participant = serializers.SerializerMethodField()

    class Meta:
        model = CommonParticipant
        fields = ('id', 'title', 'creator', 'participant')
        read_only_fields = ('id', 'creator')

    def get_creator(self, common):
        return common.creator.email

    def get_participant(self, common):
        return common.participant.values_list('email', flat=True)
