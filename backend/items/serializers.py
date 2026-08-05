from rest_framework import serializers
from items.models import Items

class ItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Items
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']