from rest_framework import generics
from rest_framework.permissions import BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Category, Plant, StockMovement
from .serializers import (
    CategorySerializer,
    PlantSerializer,
    StockMovementSerializer,
)

from users.permissions import (
    IsStaffUser,
    HasStockResponsibility,
)


class IsAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class CategoryListCreateView(generics.ListCreateAPIView):

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [IsAdminOrReadOnly]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [IsAdminOrReadOnly]


class PlantListCreateView(generics.ListCreateAPIView):

    queryset = Plant.objects.all()

    serializer_class = PlantSerializer

    permission_classes = [IsAdminOrReadOnly]


class PlantDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Plant.objects.all()

    serializer_class = PlantSerializer

    permission_classes = [IsAdminOrReadOnly]



class StaffStockListView(APIView):

    permission_classes = [
        IsStaffUser,
        HasStockResponsibility
    ]

    def get(self, request):

        plants = Plant.objects.all().order_by('name')

        search = request.query_params.get('search')

        if search:

            plants = plants.filter(
                name__icontains=search
            )

        stock_status = request.query_params.get(
            'stock_status'
        )

        # -----------------------------------------
        # LOW STOCK
        # -----------------------------------------

        if stock_status == 'Low':

            plants = plants.filter(
                stock__lte=5
            )

        # -----------------------------------------
        # OUT OF STOCK
        # -----------------------------------------

        elif stock_status == 'Out of Stock':

            plants = plants.filter(
                stock=0
            )

        # -----------------------------------------
        # AVAILABLE
        # -----------------------------------------

        elif stock_status == 'Available':

            plants = plants.filter(
                stock__gt=5
            )

        stock_data = []

        for plant in plants:

            if plant.stock == 0:

                status_value = 'Out of Stock'

            elif plant.stock <= 5:

                status_value = 'Low'

            else:

                status_value = 'Available'

            stock_data.append({

                'id': plant.id,

                'name': plant.name,

                'price': plant.price,

                'stock': plant.stock,

                'image': (
                    plant.image.url
                    if plant.image
                    else None
                ),

                'stock_status': status_value,

            })

        return Response(stock_data)

class StaffStockRestockView(APIView):

    permission_classes = [
        IsStaffUser,
        HasStockResponsibility
    ]

    def patch(self, request, pk):

        try:

            plant = Plant.objects.get(
                id=pk
            )

        except Plant.DoesNotExist:

            return Response(
                {
                    'error':
                    'Plant not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        quantity = request.data.get(
            'quantity'
        )

        # -----------------------------------------
        # VALIDATE QUANTITY
        # -----------------------------------------

        try:

            quantity = int(quantity)

        except (
            TypeError,
            ValueError
        ):

            return Response(
                {
                    'error':
                    'Quantity must be a valid number.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:

            return Response(
                {
                    'error':
                    'Restock quantity must be greater than 0.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------
        # STOCK UPDATE
        # -----------------------------------------

        previous_stock = plant.stock

        plant.stock += quantity

        new_stock = plant.stock

        plant.save()

        # -----------------------------------------
        # STOCK MOVEMENT
        # -----------------------------------------

        StockMovement.objects.create(

            plant=plant,

            movement_type='IN',

            quantity=quantity,

            previous_stock=previous_stock,

            new_stock=new_stock,

            reason=(
                f'Restock by staff - '
                f'{request.user.username}'
            ),

            performed_by=request.user

        )

        return Response({

            'message':
            'Stock restocked successfully.',

            'plant_id':
            plant.id,

            'plant_name':
            plant.name,

            'previous_stock':
            previous_stock,

            'quantity_added':
            quantity,

            'new_stock':
            new_stock

        })


class StaffStockHistoryView(APIView):

    permission_classes = [
        IsStaffUser,
        HasStockResponsibility
    ]

    def get(self, request):

        movements = (
            StockMovement.objects
            .select_related(
                'plant',
                'performed_by',
                'order'
            )
            .order_by('-created_at')
        )

        plant_id = request.query_params.get(
            'plant_id'
        )

        if plant_id:

            movements = movements.filter(
                plant_id=plant_id
            )

        serializer = StockMovementSerializer(
            movements,
            many=True
        )

        return Response(
            serializer.data
        )