from rest_framework import serializers
from .models import PopupTemplate, PopupCampaign, PopupView, PopupClick


class PopupTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopupTemplate
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'created_by')


class PopupCampaignSerializer(serializers.ModelSerializer):
    clickThroughRate = serializers.SerializerMethodField()
    isCurrentlyValid = serializers.SerializerMethodField()

    class Meta:
        model = PopupCampaign
        fields = '__all__'

    def get_clickThroughRate(self, obj):
        return obj.click_through_rate

    def get_isCurrentlyValid(self, obj):
        return obj.is_currently_valid


class PopupCampaignPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopupCampaign
        exclude = ('views_count', 'clicks_count', 'created_by', 'priority')


class PopupViewSerializer(serializers.ModelSerializer):
    campaignTitle = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = PopupView
        fields = '__all__'


class PopupClickSerializer(serializers.ModelSerializer):
    campaignTitle = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = PopupClick
        fields = '__all__'