from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Cart
from .serializers import CartSerializer
from plants.models import Plant

from .models import Cart, Wishlist
from .serializers import CartSerializer, WishlistSerializer
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)

        serializer = CartSerializer(
            cart_items,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    def post(self, request):
        plant_id = request.data.get('plant')
        quantity = request.data.get('quantity', 1)

        try:
            plant = Plant.objects.get(id=plant_id)
        except Plant.DoesNotExist:
            return Response(
                {'error': 'Plant not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            plant=plant,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()

        serializer = CartSerializer(
            cart_item,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            cart_item = Cart.objects.get(
                id=pk,
                user=request.user
            )
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        quantity = request.data.get('quantity')

        if quantity is None:
            return Response(
                {'error': 'Quantity is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        quantity = int(quantity)

        if quantity < 1:
            return Response(
                {'error': 'Quantity must be at least 1.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(
            cart_item,
            context={'request': request}
        )

        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            cart_item = Cart.objects.get(
                id=pk,
                user=request.user
            )
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item.delete()

        return Response(
            {'message': 'Item removed from cart.'},
            status=status.HTTP_200_OK
        )

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        wishlist_items = Wishlist.objects.filter(
            user=request.user
        )

        serializer = WishlistSerializer(
            wishlist_items,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    def post(self, request):

        plant_id = request.data.get('plant')

        try:
            plant = Plant.objects.get(id=plant_id)

        except Plant.DoesNotExist:
            return Response(
                {'error': 'Plant not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            plant=plant
        )

        serializer = WishlistSerializer(
            wishlist_item,
            context={'request': request}
        )

        if created:
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                'message': 'Plant already exists in wishlist.',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

class WishlistDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        try:
            wishlist_item = Wishlist.objects.get(
                id=pk,
                user=request.user
            )

        except Wishlist.DoesNotExist:
            return Response(
                {'error': 'Wishlist item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist_item.delete()

        return Response(
            {'message': 'Plant removed from wishlist.'},
            status=status.HTTP_200_OK
        )