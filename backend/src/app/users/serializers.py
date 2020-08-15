from django.shortcuts import reverse

from rest_framework import serializers

from .models import User, CommonMeeting
from .handlers import get_match


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
    creator = serializers.SerializerMethodField()
    participant = serializers.SerializerMethodField()

    class Meta:
        model = CommonMeeting
        fields = ('id', 'title', 'creator', 'participant')
        read_only_fields = ('id', 'creator')

    def get_creator(self, common_meeting):
        return str(common_meeting.creator.email)

    def get_participant(self, common_meeting):
        return list(common_meeting.participant.values_list('email', flat=True))


class CreateCommonMeetingSerializer(CommonMeetingSerializer):
    emails = serializers.ListSerializer(
        child=serializers.EmailField(),
        write_only=True,
        required=True,
    )

    class Meta:
        model = CommonMeeting
        fields = ('id', 'title', 'creator', 'participant', 'emails')
        read_only_fields = ('id', 'creator', 'participant')

    def create(self, validated_data):
        emails = validated_data.pop('emails')
        common_meeting = CommonMeeting.objects.create(**validated_data)
        for email in emails:
            if get_match(email) is not None:
                username, domain = email.split('@')
                user, created = User.objects \
                    .get_or_create(
                        username=username,
                        email=email,
                    )
                common_meeting.participant.add(user)
        return common_meeting
