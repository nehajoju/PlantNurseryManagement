from django.contrib.auth.models import User

from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    # These fields belong to UserProfile.
    # They are write_only because they are used
    # during registration and saved in UserProfile.

    phone = serializers.CharField(
        required=True,
        write_only=True
    )

    address = serializers.CharField(
        required=True,
        write_only=True
    )

    city = serializers.CharField(
        required=True,
        write_only=True
    )

    state = serializers.CharField(
        required=True,
        write_only=True
    )

    pincode = serializers.CharField(
        required=True,
        write_only=True
    )

    class Meta:

        model = User

        fields = [
            'first_name',
            'last_name',
            'username',
            'email',
            'phone',
            'password',
            'confirm_password',
            'address',
            'city',
            'state',
            'pincode',
        ]

    def validate(self, data):

        if data['password'] != data['confirm_password']:

            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        return data

    def create(self, validated_data):

        validated_data.pop(
            'confirm_password'
        )

        phone = validated_data.pop(
            'phone'
        )

        address = validated_data.pop(
            'address'
        )

        city = validated_data.pop(
            'city'
        )

        state = validated_data.pop(
            'state'
        )

        pincode = validated_data.pop(
            'pincode'
        )

        password = validated_data.pop(
            'password'
        )

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        UserProfile.objects.create(
            user=user,
            phone=phone,
            address=address,
            city=city,
            state=state,
            pincode=pincode
        )

        return user


class AdminCustomerSerializer(serializers.ModelSerializer):

    customer_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    pincode = serializers.SerializerMethodField()

    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:

        model = User

        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'customer_name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'pincode',
            'total_orders',
            'total_spent',
        ]

    def get_customer_name(self, obj):

        full_name = f'{obj.first_name} {obj.last_name}'.strip()

        return full_name or obj.username

    def get_phone(self, obj):

        profile = getattr(obj, 'profile', None)

        return profile.phone if profile else ''

    def get_address(self, obj):

        profile = getattr(obj, 'profile', None)

        return profile.address if profile else ''

    def get_city(self, obj):

        profile = getattr(obj, 'profile', None)

        return profile.city if profile else ''

    def get_state(self, obj):

        profile = getattr(obj, 'profile', None)

        return profile.state if profile else ''

    def get_pincode(self, obj):

        profile = getattr(obj, 'profile', None)

        return profile.pincode if profile else ''

    def get_total_orders(self, obj):

        return obj.orders.count()

    def get_total_spent(self, obj):

        return sum(
            order.total_amount
            for order in obj.orders.all()
            if order.status != 'Cancelled'
        )