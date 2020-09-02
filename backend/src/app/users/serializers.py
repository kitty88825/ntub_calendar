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


class CreateCommonParticipantSerializer(CommonParticipantSerializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=True,
    )

    class Meta(CommonParticipantSerializer.Meta):
        fields = ('id', 'title', 'creator', 'participant', 'emails')
        read_only_fields = ('id', 'creator', 'participant')

    def create_participant_for_common(self, common, emails):
        for email in emails:
            username, domin = email.split('@')
            if domin == 'ntub.edu.tw':
                user, created = User.objects. \
                    get_or_create(
                        username=username,
                        email=email,
                    )
                common.participant.add(user)

    def create(self, validated_data):
        emails = validated_data.pop('emails')
        common_participant = CommonParticipant.objects.create(**validated_data)
        self.create_participant_for_common(common_participant, emails)
        return common_participant


class UpdateCommonParticipantSerializer(CreateCommonParticipantSerializer):
    def update(self, instance, validated_data):
        emails = validated_data.pop('emails')
        CommonParticipant.participant.through \
            .objects.filter(commonparticipant=instance) \
            .delete()

        common_participant = super().update(instance, validated_data)
        self.create_participant_for_common(common_participant, emails)
        return common_participant
