from rest_framework import serializers
from .models import Category, Plant, StockMovement


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ['id', 'name']


class PlantSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    image = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = Plant
        fields = [
            'id',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'stock',
            'image',
            'sunlight',
            'watering',
            'care_instructions',
            'created_at',
            'updated_at',
        ]


class StockMovementSerializer(serializers.ModelSerializer):

    plant_name = serializers.CharField(
        source='plant.name',
        read_only=True
    )

    performed_by_name = serializers.SerializerMethodField()

    order_id = serializers.IntegerField(
        source='order.id',
        read_only=True
    )

    class Meta:
        model = StockMovement
        fields = [
            'id',
            'plant',
            'plant_name',
            'movement_type',
            'quantity',
            'previous_stock',
            'new_stock',
            'reason',
            'order_id',
            'performed_by_name',
            'created_at',
        ]

    def get_performed_by_name(self, obj):

        if not obj.performed_by:
            return None

        full_name = (
            f'{obj.performed_by.first_name} '
            f'{obj.performed_by.last_name}'
        ).strip()

        return full_name or obj.performed_by.username