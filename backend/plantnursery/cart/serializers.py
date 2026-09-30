from rest_framework import serializers
from .models import Cart,Wishlist


class CartSerializer(serializers.ModelSerializer):

    plant_name = serializers.CharField(source='plant.name', read_only=True)
    plant_price = serializers.DecimalField(
        source='plant.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    plant_image = serializers.ImageField(
        source='plant.image',
        read_only=True
    )

    class Meta:
        model = Cart
        fields = [
            'id',
            'plant',
            'plant_name',
            'plant_price',
            'plant_image',
            'quantity',
            'added_at'
        ]

class WishlistSerializer(serializers.ModelSerializer):

    plant_name = serializers.CharField(
        source='plant.name',
        read_only=True
    )

    plant_price = serializers.DecimalField(
        source='plant.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    plant_image = serializers.ImageField(
        source='plant.image',
        read_only=True
    )

    class Meta:
        model = Wishlist
        fields = [
            'id',
            'plant',
            'plant_name',
            'plant_price',
            'plant_image',
            'added_at'
        ]