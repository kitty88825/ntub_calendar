from django.shortcuts import reverse

from rest_framework import serializers

from .models import User, CommonParticipant


def validate_ntub_email(email: str):
    if not email.endswith('@ntub.edu.tw'):
        raise serializers.ValidationError('This is not a ntub email.')


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
    creator = serializers.CharField(source='creator.email', read_only=True)
    participant = serializers.SerializerMethodField()
    emails = serializers.ListField(
        child=serializers.EmailField(validators=[validate_ntub_email]),
        write_only=True,
        required=True,
    )

    class Meta:
        model = CommonParticipant
        fields = ('id', 'title', 'creator', 'participant', 'emails')
        read_only_fields = ('id', 'creator', 'participant')

    def get_participant(self, common):
        return common.participant.values_list('email', flat=True)

    def create_participant_from_common(self, common_participant, emails):
        in_db_emails = User.objects \
            .filter(email__in=emails) \
            .values_list('email', flat=True)

        new_emails = set(emails) - set(in_db_emails)
        User.objects.bulk_create([User(email=email) for email in new_emails])
        common_participant.participant.add(
            *User.objects.filter(email__in=emails),
        )

    def create(self, validated_data):
        emails = validated_data.pop('emails')
        common_participant = CommonParticipant.objects.create(**validated_data)
        self.create_participant_for_common(common_participant, emails)

        return common_participant

    def update(self, instance, validated_data):
        emails = validated_data.pop('emails', None)
        common_participant = super().update(instance, validated_data)

        if emails is None:
            return common_participant

        CommonParticipant.participant.through \
            .objects \
            .filter(commonparticipant=instance) \
            .exclude(user__email__in=emails) \
            .delete()

        self.create_participant_from_common(common_participant, emails)

        return common_participant
