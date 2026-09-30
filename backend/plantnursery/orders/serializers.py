from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):

    plant_name = serializers.CharField(
        source='plant.name',
        read_only=True
    )

    plant_image = serializers.ImageField(
        source='plant.image',
        read_only=True
    )

    class Meta:
        model = OrderItem

        fields = [
            'id',
            'plant',
            'plant_name',
            'plant_image',
            'quantity',
            'price'
        ]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    # Customer information
    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    customer_name = serializers.SerializerMethodField()

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    # Delivery information
    assigned_staff_id = serializers.IntegerField(
        source='assigned_staff.id',
        read_only=True
    )

    assigned_staff_name = serializers.SerializerMethodField()

    cod_collected_by_id = serializers.IntegerField(
        source='cod_collected_by.id',
        read_only=True
    )

    cod_collected_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Order

        fields = [
            # Order information
            'id',
            'username',
            'customer_name',
            'email',

            'total_amount',
            'status',

            # Shipping information
            'shipping_address',
            'city',
            'state',
            'pincode',

            'created_at',

            # Order items
            'items',

            # Payment information
            'payment_method',
            'payment_status',
            'transaction_id',

            # Delivery information
            'delivery_status',
            'assigned_staff_id',
            'assigned_staff_name',

            # COD collection information
            'cod_collected_by_id',
            'cod_collected_by_name',
            'cod_collected_at',
        ]

    def get_customer_name(self, obj):

        full_name = (
            f'{obj.user.first_name} '
            f'{obj.user.last_name}'
        ).strip()

        return full_name or obj.user.username

    def get_assigned_staff_name(self, obj):

        if not obj.assigned_staff:
            return None

        full_name = (
            f'{obj.assigned_staff.first_name} '
            f'{obj.assigned_staff.last_name}'
        ).strip()

        return full_name or obj.assigned_staff.username

    def get_cod_collected_by_name(self, obj):

        if not obj.cod_collected_by:
            return None

        full_name = (
            f'{obj.cod_collected_by.first_name} '
            f'{obj.cod_collected_by.last_name}'
        ).strip()

        return full_name or obj.cod_collected_by.username