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
    emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=True,
    )

    class Meta:
        model = CommonMeeting
        fields = ('id', 'title', 'creator', 'participant', 'emails')
        read_only_fields = ('id', 'creator', 'participant')

    def create_participant_for_common(self, common_meeting, emails):
        for email in emails:
            if get_match(email) is not None:
                username, domain = email.split('@')
                user, created = User.objects \
                    .get_or_create(
                        username=username,
                        email=email,
                    )
                common_meeting.participant.add(user)

    def create(self, validated_data):
        emails = validated_data.pop('emails')
        common_meeting = CommonMeeting.objects.create(**validated_data)
        self.create_participant_for_common(common_meeting, emails)
        return common_meeting


class UpdateCommonMeetingSerializer(CreateCommonMeetingSerializer):
    remove_emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = CommonMeeting
        fields = (
            'id',
            'title',
            'creator',
            'participant',
            'emails',
            'remove_emails',
        )
        read_only_fields = ('id', 'creator', 'participant')

    def update(self, instance, validated_data):
        emails = validated_data.pop('emails', None)
        remove_emails = validated_data.pop('remove_emails', None)
        common_meeting = super().update(instance, validated_data)
        if emails:
            self.create_participant_for_common(common_meeting, emails)

        if remove_emails:
            for email in remove_emails:
                common_meeting.participant \
                    .remove(
                        User.objects.get(email=email).id)

        return common_meeting
