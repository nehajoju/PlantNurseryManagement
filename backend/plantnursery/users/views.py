from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView


from .models import UserProfile, StaffResponsibility
from .serializers import RegisterSerializer,AdminCustomerSerializer
from .permissions import IsAdminUser, IsStaffUser


class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [AllowAny]


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(
            username=username,
            password=password
        )

        if user is not None:

            token, created = Token.objects.get_or_create(
                user=user
            )
            print("LOGIN USER:", user.username, user.id)
            print("LOGIN TOKEN:", token.key)
            print("TOKEN CREATED:", created)
            UserProfile.objects.get_or_create(
                user=user
            )

            return Response({

                'message': 'Login successful',

                'token': token.key,

                'user_id': user.id,

                'username': user.username,

                'email': user.email,

                'is_staff': user.is_staff,

                'is_superuser': user.is_superuser,

            }, status=status.HTTP_200_OK)

        return Response({

            'message': 'Invalid username or password'

        }, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):

    def get(self, request):

        user = request.user

        profile, created = UserProfile.objects.get_or_create(
            user=user
        )

        return Response({

            'id': user.id,

            'username': user.username,

            'email': user.email,

            'phone': profile.phone,

            'address': profile.address,

            'city': profile.city,

            'state': profile.state,

            'pincode': profile.pincode,

        })


    def put(self, request):

        user = request.user

        profile, created = UserProfile.objects.get_or_create(
            user=user
        )

        user.email = request.data.get(
            'email',
            user.email
        )

        profile.phone = request.data.get(
            'phone',
            profile.phone
        )

        profile.address = request.data.get(
            'address',
            profile.address
        )

        profile.city = request.data.get(
            'city',
            profile.city
        )

        profile.state = request.data.get(
            'state',
            profile.state
        )

        profile.pincode = request.data.get(
            'pincode',
            profile.pincode
        )

        user.save()

        profile.save()

        return Response({

            'message': 'Profile updated successfully.',

            'user': {

                'id': user.id,

                'username': user.username,

                'email': user.email,

                'phone': profile.phone,

                'address': profile.address,

                'city': profile.city,

                'state': profile.state,

                'pincode': profile.pincode,

            }

        })

class AdminCustomerListView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        customers = User.objects.filter(
            is_staff=False,
            is_superuser=False
        ).select_related(
            'profile'
        ).prefetch_related(
            'orders'
        ).order_by('-date_joined')

        # Search

        search = request.query_params.get('search')

        if search:

            search_filter = (
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

            customers = customers.filter(
                search_filter
            )

        serializer = AdminCustomerSerializer(
            customers,
            many=True
        )

        return Response(
            serializer.data
        )

class AdminCustomerDetailView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request, pk):

        try:
            customer = User.objects.select_related(
                'profile'
            ).prefetch_related(
                'orders__items__plant'
            ).get(
                id=pk,
                is_staff=False,
                is_superuser=False
            )

        except User.DoesNotExist:
            return Response(
                {
                    'error': 'Customer not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminCustomerSerializer(
            customer
        )

        orders = customer.orders.all().order_by(
            '-created_at'
        )

        order_data = []

        for order in orders:

            items = []

            for item in order.items.all():

                items.append({
                    'id': item.id,
                    'plant': item.plant.id,
                    'plant_name': item.plant.name,
                    'quantity': item.quantity,
                    'price': item.price
                })

            order_data.append({
                'id': order.id,
                'total_amount': order.total_amount,
                'status': order.status,
                'payment_method': order.payment_method,
                'payment_status': order.payment_status,
                'transaction_id': order.transaction_id,
                'shipping_address': order.shipping_address,
                'city': order.city,
                'state': order.state,
                'pincode': order.pincode,
                'created_at': order.created_at,
                'items': items
            })

        return Response({
            'customer': serializer.data,
            'orders': order_data
        })

class AdminStaffListView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        staff = User.objects.filter(
            is_staff=True,
            is_superuser=False
        ).order_by('-date_joined')

        search = request.query_params.get('search')

        if search:

            staff = staff.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        staff_data = []

        for member in staff:

            profile, created = UserProfile.objects.get_or_create(
                user=member
            )

            responsibility, created = (
                StaffResponsibility.objects.get_or_create(
                    user=member
                )
            )

            staff_data.append({

                'id': member.id,

                'username': member.username,

                'first_name': member.first_name,

                'last_name': member.last_name,

                'email': member.email,

                'phone': profile.phone,

                'address': profile.address,

                'city': profile.city,

                'state': profile.state,

                'pincode': profile.pincode,

                'is_active': member.is_active,

                'date_joined': member.date_joined,

                # STAFF RESPONSIBILITIES
                'can_delivery':
                    responsibility.can_delivery,

                'can_stock':
                    responsibility.can_stock,

                'can_gardening':
                    responsibility.can_gardening,

            })

        return Response(staff_data)


    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        first_name = request.data.get(
            'first_name',
            ''
        )

        last_name = request.data.get(
            'last_name',
            ''
        )

        phone = request.data.get(
            'phone',
            ''
        )

        address = request.data.get(
            'address',
            ''
        )

        city = request.data.get(
            'city',
            ''
        )

        state = request.data.get(
            'state',
            ''
        )

        pincode = request.data.get(
            'pincode',
            ''
        )

        if not username or not password:

            return Response(
                {
                    'error':
                    'Username and password are required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(
            username=username
        ).exists():

            return Response(
                {
                    'error':
                    'Username already exists.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )

        user.is_staff = True
        user.is_superuser = False
        user.is_active = True

        user.save()

        UserProfile.objects.create(
            user=user,
            phone=phone,
            address=address,
            city=city,
            state=state,
            pincode=pincode
        )

        # Create responsibility record
        # for the new staff member.
        StaffResponsibility.objects.create(
            user=user
        )

        return Response(
            {
                'message':
                'Staff account created successfully.',

                'staff': {

                    'id':
                    user.id,

                    'username':
                    user.username,

                    'first_name':
                    user.first_name,

                    'last_name':
                    user.last_name,

                    'email':
                    user.email,

                    'is_active':
                    user.is_active,

                    'can_delivery':
                    False,

                    'can_stock':
                    False,

                    'can_gardening':
                    False

                }
            },
            status=status.HTTP_201_CREATED
        )







class AdminStaffDetailView(APIView):

    permission_classes = [IsAdminUser]

    def get_staff(self, pk):

        try:
            return User.objects.get(
                id=pk,
                is_staff=True,
                is_superuser=False
            )
        except User.DoesNotExist:
            return None

    def get(self, request, pk):

        staff = self.get_staff(pk)

        if staff is None:
            return Response(
                {'error': 'Staff not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        profile, created = UserProfile.objects.get_or_create(
            user=staff
        )

        return Response({
            'id': staff.id,
            'username': staff.username,
            'first_name': staff.first_name,
            'last_name': staff.last_name,
            'email': staff.email,
            'phone': profile.phone,
            'address': profile.address,
            'city': profile.city,
            'state': profile.state,
            'pincode': profile.pincode,
            'is_active': staff.is_active,
            'date_joined': staff.date_joined,
        })

    def patch(self, request, pk):

        staff = self.get_staff(pk)

        if staff is None:
            return Response(
                {'error': 'Staff not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        staff.first_name = request.data.get(
            'first_name',
            staff.first_name
        )

        staff.last_name = request.data.get(
            'last_name',
            staff.last_name
        )

        staff.email = request.data.get(
            'email',
            staff.email
        )

        if 'password' in request.data:
            password = request.data.get('password')

            if password:
                staff.set_password(password)

        if 'is_active' in request.data:
            staff.is_active = request.data.get(
                'is_active'
            )

        staff.save()

        profile, created = UserProfile.objects.get_or_create(
            user=staff
        )

        profile.phone = request.data.get(
            'phone',
            profile.phone
        )

        profile.address = request.data.get(
            'address',
            profile.address
        )

        profile.city = request.data.get(
            'city',
            profile.city
        )

        profile.state = request.data.get(
            'state',
            profile.state
        )

        profile.pincode = request.data.get(
            'pincode',
            profile.pincode
        )

        profile.save()

        return Response({
            'message': 'Staff updated successfully.',
            'staff': {
                'id': staff.id,
                'username': staff.username,
                'first_name': staff.first_name,
                'last_name': staff.last_name,
                'email': staff.email,
                'phone': profile.phone,
                'address': profile.address,
                'city': profile.city,
                'state': profile.state,
                'pincode': profile.pincode,
                'is_active': staff.is_active,
            }
        })

class StaffOrderListView(APIView):

    permission_classes = [IsStaffUser]

    def get(self, request):

        orders = Order.objects.all().select_related(
            'user'
        ).prefetch_related(
            'items__plant'
        ).order_by('-created_at')

        search = request.query_params.get('search')

        if search:

            search_filter = (
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
            )

            if search.isdigit():
                search_filter |= Q(id=int(search))

            orders = orders.filter(search_filter)

        status_filter = request.query_params.get('status')

        if status_filter and status_filter != 'All':

            orders = orders.filter(
                status=status_filter
            )

        serializer = OrderSerializer(
            orders,
            many=True,
            context={
                'request': request
            }
        )

        return Response(
            serializer.data
        )


class StaffOrderDetailView(APIView):

    permission_classes = [IsStaffUser]

    def get(self, request, pk):

        try:

            order = Order.objects.select_related(
                'user'
            ).prefetch_related(
                'items__plant'
            ).get(
                id=pk
            )

        except Order.DoesNotExist:

            return Response(
                {
                    'error': 'Order not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderSerializer(
            order,
            context={
                'request': request
            }
        )

        return Response(
            serializer.data
        )

    def patch(self, request, pk):

        try:

            order = Order.objects.get(
                id=pk
            )

        except Order.DoesNotExist:

            return Response(
                {
                    'error': 'Order not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get(
            'status'
        )

        valid_statuses = [
            'Pending',
            'Confirmed',
            'Shipped',
            'Delivered',
            'Cancelled'
        ]

        if new_status not in valid_statuses:

            return Response(
                {
                    'error': 'Invalid order status.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status

        order.save()

        serializer = OrderSerializer(
            order,
            context={
                'request': request
            }
        )

        return Response(
            serializer.data
        )

    

class AdminStaffResponsibilityView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            staff = User.objects.get(
                id=pk,
                is_staff=True,
                is_superuser=False
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Staff member not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        responsibility, created = StaffResponsibility.objects.get_or_create(
            user=staff
        )

        return Response({
            'staff_id': staff.id,
            'username': staff.username,
            'staff_name': (
                f'{staff.first_name} {staff.last_name}'.strip()
                or staff.username
            ),
            'can_delivery': responsibility.can_delivery,
            'can_stock': responsibility.can_stock,
            'can_gardening': responsibility.can_gardening,
        })

    def patch(self, request, pk):
        try:
            staff = User.objects.get(
                id=pk,
                is_staff=True,
                is_superuser=False
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Staff member not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        responsibility, created = StaffResponsibility.objects.get_or_create(
            user=staff
        )

        if 'can_delivery' in request.data:
            responsibility.can_delivery = bool(
                request.data['can_delivery']
            )

        if 'can_stock' in request.data:
            responsibility.can_stock = bool(
                request.data['can_stock']
            )

        if 'can_gardening' in request.data:
            responsibility.can_gardening = bool(
                request.data['can_gardening']
            )

        responsibility.save()

        return Response({
            'message': 'Staff responsibilities updated successfully.',
            'staff_id': staff.id,
            'username': staff.username,
            'can_delivery': responsibility.can_delivery,
            'can_stock': responsibility.can_stock,
            'can_gardening': responsibility.can_gardening,
        })


class StaffResponsibilityView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        responsibility, created = StaffResponsibility.objects.get_or_create(
            user=request.user
        )

        return Response({
            'staff_id': request.user.id,
            'username': request.user.username,
            'staff_name': (
                f'{request.user.first_name} {request.user.last_name}'.strip()
                or request.user.username
            ),
            'can_delivery': responsibility.can_delivery,
            'can_stock': responsibility.can_stock,
            'can_gardening': responsibility.can_gardening,
        })