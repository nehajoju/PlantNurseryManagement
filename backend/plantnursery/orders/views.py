from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsAdminUser, IsStaffUser, HasDeliveryResponsibility
from django.db import transaction
from django.db.models import Q
from django.conf import settings
import razorpay
from .models import Order, OrderItem
from plants.models import Plant, StockMovement
from .serializers import OrderSerializer
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from notifications.utils import (
    create_notification,
    create_notifications_for_users
)

from cart.models import Cart


class OrderView(APIView):

    permission_classes = [IsAuthenticated]
    

    def get(self, request):

        orders = Order.objects.filter(
            user=request.user
        ).order_by('-created_at')

        serializer = OrderSerializer(
            orders,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    def post(self, request):

        shipping_address = request.data.get('shipping_address')
        city = request.data.get('city')
        state = request.data.get('state')
        pincode = request.data.get('pincode')
        payment_method = request.data.get('payment_method', 'COD')

        if not all([
            shipping_address,
            city,
            state,
            pincode
        ]):
            return Response(
                {'error': 'All shipping details are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if payment_method not in ['COD', 'UPI']:
            return Response(
                {'error': 'Invalid payment method.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            cart_items = list(
                Cart.objects.filter(
                    user=request.user
                ).select_related('plant')
            )

            if not cart_items:
                return Response(
                    {'error': 'Your cart is empty.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            locked_plants = {}

            for item in cart_items:

                plant = Plant.objects.select_for_update().get(
                    id=item.plant_id
                )

                if plant.stock < item.quantity:
                    return Response(
                        {
                            'error':
                            f'Insufficient stock for {plant.name}. '
                            f'Only {plant.stock} unit(s) available.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                locked_plants[plant.id] = plant

            total_amount = sum(
                locked_plants[item.plant_id].price * item.quantity
                for item in cart_items
            )

            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                shipping_address=shipping_address,
                city=city,
                state=state,
                pincode=pincode,
                payment_method=payment_method
            )

            for item in cart_items:

                plant = locked_plants[item.plant_id]

                previous_stock = plant.stock
                plant.stock -= item.quantity
                new_stock = plant.stock

                plant.save(update_fields=['stock'])

                OrderItem.objects.create(
                    order=order,
                    plant=plant,
                    quantity=item.quantity,
                    price=plant.price
                )

                StockMovement.objects.create(
                    plant=plant,
                    movement_type='OUT',
                    quantity=item.quantity,
                    previous_stock=previous_stock,
                    new_stock=new_stock,
                    reason=f'Order #{order.id}',
                    order=order,
                    performed_by=request.user
                )

            Cart.objects.filter(
                user=request.user
            ).delete()

            admins = User.objects.filter(
                is_superuser=True,
                is_active=True
            )

            create_notifications_for_users(
                users=admins,
                title='New Order Received',
                message=f'Order #{order.id} has been placed by {request.user.username}.',
                notification_type='ORDER',
                priority='IMPORTANT',
                related_id=order.id,
                related_url=f'/admin/orders/{order.id}'
            )

            create_notification(
            user=request.user,
            title='Order Placed Successfully',
            message=f'Your Order #{order.id} has been placed successfully.',
            notification_type='ORDER',
            priority='NORMAL',
            related_id=order.id,
            related_url=f'/orders/{order.id}'
        )

        serializer = OrderSerializer(
            order,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CreateRazorpayOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        cart_items = list(
            Cart.objects.filter(
                user=request.user
            ).select_related('plant')
        )

        if not cart_items:
            return Response(
                {'error': 'Your cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        for item in cart_items:

            if item.plant.stock < item.quantity:
                return Response(
                    {
                        'error':
                        f'Insufficient stock for {item.plant.name}. '
                        f'Only {item.plant.stock} unit(s) available.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        total_amount = sum(
            item.plant.price * item.quantity
            for item in cart_items
        )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET
            )
        )

        razorpay_order = client.order.create({
            'amount': int(total_amount * 100),
            'currency': 'INR',
            'payment_capture': 1
        })

        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'key_id': settings.RAZORPAY_KEY_ID
        })

class VerifyRazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        shipping_address = request.data.get('shipping_address')
        city = request.data.get('city')
        state = request.data.get('state')
        pincode = request.data.get('pincode')

        if not all([
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        ]):
            return Response(
                {'error': 'Payment verification details are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not all([
            shipping_address,
            city,
            state,
            pincode
        ]):
            return Response(
                {'error': 'All shipping details are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET
    )
)

        # Verify Razorpay payment signature
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })

        except razorpay.errors.SignatureVerificationError:
            return Response(
                {'error': 'Payment verification failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent duplicate order creation
        existing_order = Order.objects.filter(
            transaction_id=razorpay_payment_id
        ).first()

        if existing_order:
            serializer = OrderSerializer(
                existing_order,
                context={'request': request}
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        # Create order + reduce stock together
        with transaction.atomic():

            cart_items = list(
                Cart.objects.filter(
                    user=request.user
                ).select_related('plant')
            )

            if not cart_items:
                return Response(
                    {'error': 'Your cart is empty.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            locked_plants = {}

            # Lock plants and check stock
            for item in cart_items:

                plant = Plant.objects.select_for_update().get(
                    id=item.plant.id
                )

                if plant.stock < item.quantity:
                    return Response(
                        {
                            'error': (
                                f'Insufficient stock for {plant.name}. '
                                f'Only {plant.stock} available.'
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                locked_plants[plant.id] = plant

            # Calculate total using locked plant records
            total_amount = sum(
                locked_plants[item.plant.id].price * item.quantity
                for item in cart_items
            )

            # Create confirmed and paid order
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                status='Confirmed',
                shipping_address=shipping_address,
                city=city,
                state=state,
                pincode=pincode,
                payment_method='UPI',
                payment_status='Paid',
                transaction_id=razorpay_payment_id
            )

            # Create order items and reduce stock
            for item in cart_items:

                plant = locked_plants[item.plant.id]

                previous_stock = plant.stock

                plant.stock -= item.quantity

                plant.save(
                    update_fields=['stock']
                )

                OrderItem.objects.create(
                    order=order,
                    plant=plant,
                    quantity=item.quantity,
                    price=plant.price
                )

                # Record stock movement
                StockMovement.objects.create(
                    plant=plant,
                    movement_type='OUT',
                    quantity=item.quantity,
                    previous_stock=previous_stock,
                    new_stock=plant.stock,
                    reason=f'Order #{order.id}',
                    order=order,
                    performed_by=request.user
                )

            # Clear cart only after successful order creation
            Cart.objects.filter(
                user=request.user
            ).delete()

            admins = User.objects.filter(
                is_superuser=True,
                is_active=True
            )

            create_notifications_for_users(
                users=admins,
                title='New Order Received',
                message=f'Order #{order.id} has been placed by {request.user.username}.',
                notification_type='ORDER',
                priority='IMPORTANT',
                related_id=order.id,
                related_url=f'/admin/orders/{order.id}'
            )

            create_notification(
                user=request.user,
                title='Payment Successful',
                message=f'Payment received successfully for Order #{order.id}.',
                notification_type='ORDER',
                priority='NORMAL',
                related_id=order.id,
                related_url=f'/orders/{order.id}'
            )

        serializer = OrderSerializer(
            order,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class OrderReceiptView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        try:
            order = Order.objects.get(
                id=pk,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        response = HttpResponse(
            content_type='application/pdf'
        )

        response['Content-Disposition'] = (
            f'attachment; filename="PlantNest_Order_{order.id}.pdf"'
        )

        pdf = canvas.Canvas(
            response,
            pagesize=A4
        )

        width, height = A4

        # Title
        pdf.setFont('Helvetica-Bold', 22)
        pdf.drawString(
            50,
            height - 60,
            'PlantNest'
        )

        pdf.setFont('Helvetica', 11)
        pdf.drawString(
            50,
            height - 80,
            'Plant Nursery Management System'
        )

        # Order details
        y = height - 130

        pdf.setFont('Helvetica-Bold', 13)
        pdf.drawString(
            50,
            y,
            f'Order Receipt - #{order.id}'
        )

        y -= 30

        pdf.setFont('Helvetica', 11)

        pdf.drawString(
            50,
            y,
            f'Order Date: {order.created_at.strftime("%d %b %Y")}'
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f'Payment Method: {order.payment_method}'
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f'Payment Status: {order.payment_status}'
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f'Order Status: {order.status}'
        )

        # Delivery details
        y -= 40

        pdf.setFont('Helvetica-Bold', 13)
        pdf.drawString(
            50,
            y,
            'Delivery Details'
        )

        y -= 25

        pdf.setFont('Helvetica', 11)

        pdf.drawString(
            50,
            y,
            f'Address: {order.shipping_address}'
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f'City: {order.city}'
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f'State: {order.state}'
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f'Pincode: {order.pincode}'
        )

        # Items
        y -= 40

        pdf.setFont('Helvetica-Bold', 13)
        pdf.drawString(
            50,
            y,
            'Order Items'
        )

        y -= 25

        pdf.setFont('Helvetica-Bold', 10)

        pdf.drawString(50, y, 'Plant')
        pdf.drawString(300, y, 'Qty')
        pdf.drawString(350, y, 'Price')
        pdf.drawString(430, y, 'Total')

        y -= 20

        pdf.setFont('Helvetica', 10)

        for item in order.items.all():

            item_total = item.price * item.quantity

            pdf.drawString(
                50,
                y,
                item.plant.name[:35]
            )

            pdf.drawString(
                300,
                y,
                str(item.quantity)
            )

            pdf.drawString(
                350,
                y,
                f'Rs. {item.price}'
            )

            pdf.drawString(
                430,
                y,
                f'Rs. {item_total}'
            )

            y -= 20

        # Total
        y -= 20

        pdf.setFont('Helvetica-Bold', 14)

        pdf.drawString(
            350,
            y,
            f'Total: Rs. {order.total_amount}'
        )

        # Transaction ID
        if order.transaction_id:

            y -= 30

            pdf.setFont('Helvetica', 10)

            pdf.drawString(
                50,
                y,
                f'Transaction ID: {order.transaction_id}'
            )

        # Footer
        pdf.setFont('Helvetica', 9)

        pdf.drawString(
            50,
            40,
            'Thank you for shopping with PlantNest!'
        )

        pdf.save()

        return response



class AdminOrderListView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        orders = Order.objects.all().select_related(
            'user'
        ).prefetch_related(
            'items__plant'
        ).order_by('-created_at')

        # Search

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

        # Status filter

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


class AdminOrderDetailView(APIView):

    permission_classes = [IsAdminUser]


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
        create_notification(
            user=order.user,
            title='Order Status Updated',
            message=f'Your Order #{order.id} status has been updated to {new_status}.',
            notification_type='ORDER',
            priority='IMPORTANT' if new_status in ['Shipped', 'Delivered'] else 'NORMAL',
            related_id=order.id,
            related_url=f'/orders/{order.id}'
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


class AdminAssignDeliveryStaffView(APIView):

    permission_classes = [IsAdminUser]

    def patch(self, request, pk):

        try:
            order = Order.objects.get(id=pk)

        except Order.DoesNotExist:

            return Response(
                {
                    'error': 'Order not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status == 'Cancelled':

            return Response(
                {
                    'error': 'Cancelled orders cannot be assigned.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        staff_id = request.data.get('staff_id')

        if not staff_id:

            return Response(
                {
                    'error': 'Staff ID is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            staff = User.objects.get(
                id=staff_id,
                is_staff=True,
                is_superuser=False,
                is_active=True
            )

        except User.DoesNotExist:

            return Response(
                {
                    'error': 'Active staff member not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Check Delivery responsibility

        responsibility = getattr(
            staff,
            'staff_responsibility',
            None
        )

        if not responsibility or not responsibility.can_delivery:

            return Response(
                {
                    'error':
                    'This staff member does not have Delivery responsibility.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.assigned_staff = staff
        order.delivery_status = 'Assigned'

        order.save()

        create_notification(
            user=staff,
            title='New Delivery Assigned',
            message=f'Order #{order.id} has been assigned to you for delivery.',
            notification_type='DELIVERY',
            priority='IMPORTANT',
            related_id=order.id,
            related_url=f'/staff/deliveries/{order.id}'
        )

        create_notification(
            user=order.user,
            title='Delivery Assigned',
            message=f'Your Order #{order.id} has been assigned to a delivery staff member.',
            notification_type='DELIVERY',
            priority='NORMAL',
            related_id=order.id,
            related_url=f'/orders/{order.id}'
        )   

        serializer = OrderSerializer(
            order,
            context={
                'request': request
            }
        )

        return Response(
            {
                'message': 'Delivery assigned successfully.',
                'order': serializer.data
            },
            status=status.HTTP_200_OK
        )

class StaffOrderListView(APIView):

    permission_classes = [IsStaffUser]

    def get(self, request):

        orders = Order.objects.all().select_related(
            'user'
        ).prefetch_related(
            'items__plant'
        ).order_by('-created_at')

        # Search
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

        # Status filter
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
        create_notification(
            user=order.user,
            title='Order Status Updated',
            message=f'Your Order #{order.id} status has been updated to {new_status}.',
            notification_type='ORDER',
            priority='IMPORTANT' if new_status in ['Shipped', 'Delivered'] else 'NORMAL',
            related_id=order.id,
            related_url=f'/orders/{order.id}'
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

class StaffDeliveryListView(APIView):

    permission_classes = [
        IsStaffUser,
        HasDeliveryResponsibility
    ]

    def get(self, request):

        orders = Order.objects.filter(
    assigned_staff=request.user,
    status__in=['Pending', 'Confirmed', 'Shipped', 'Delivered']
).select_related(
            'user',
            'assigned_staff',
            'cod_collected_by'
        ).prefetch_related(
            'items__plant'
        ).order_by('-created_at')

        # Search
        search = request.query_params.get('search')

        if search:

            search_filter = (
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(city__icontains=search)
            )

            if search.isdigit():
                search_filter |= Q(id=int(search))

            orders = orders.filter(search_filter)

        # Delivery status filter
        delivery_status = request.query_params.get(
            'delivery_status'
        )

        if delivery_status and delivery_status != 'All':

            orders = orders.filter(
                delivery_status=delivery_status
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

        
class StaffDeliveryDetailView(APIView):

    permission_classes = [
        IsStaffUser,
        HasDeliveryResponsibility
    ]

    def get(self, request, pk):

        try:

            order = Order.objects.select_related(
                'user',
                'assigned_staff',
                'cod_collected_by'
            ).prefetch_related(
                'items__plant'
            ).get(
                id=pk,
                assigned_staff=request.user
            )

        except Order.DoesNotExist:

            return Response(
                {
                    'error': 'Delivery not found or not assigned to you.'
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


class StaffDeliveryActionView(APIView):

    permission_classes = [
        IsStaffUser,
        HasDeliveryResponsibility
    ]

    def patch(self, request, pk):

        try:

            order = Order.objects.select_related(
                'user',
                'assigned_staff',
                'cod_collected_by'
            ).get(
                id=pk,
                assigned_staff=request.user
            )

        except Order.DoesNotExist:

            return Response(
                {
                    'error': 'Delivery not found or not assigned to you.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action')

        # --------------------------------------------------
        # Start delivery
        # --------------------------------------------------

        if action == 'out_for_delivery':

            if order.status == 'Cancelled':
                return Response(
                    {
                        'error': 'Cancelled orders cannot be delivered.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Expected delivery date provided by staff
            expected_delivery_date = request.data.get(
                'expected_delivery_date'
            )

            if not expected_delivery_date:
                return Response(
                    {
                        'error': 'Expected delivery date is required.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Convert the received date into a Python date
            try:
                expected_date = timezone.datetime.strptime(
                    expected_delivery_date,
                    '%Y-%m-%d'
                ).date()
            except ValueError:
                return Response(
                    {
                        'error': 'Invalid expected delivery date. Use YYYY-MM-DD format.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            today = timezone.localdate()

            # Expected delivery cannot be before today
            if expected_date < today:
                return Response(
                    {
                        'error': 'Expected delivery date cannot be before today.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Maximum delivery time is 5 days
            maximum_date = today + timezone.timedelta(days=5)

            if expected_date > maximum_date:
                return Response(
                    {
                        'error': 'Expected delivery date cannot be more than 5 days from today.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save shipping information
            order.delivery_status = 'Out for Delivery'
            order.status = 'Shipped'
            order.shipped_at = timezone.now()
            order.expected_delivery_date = expected_date

            order.save()

            # Notify customer
            create_notification(
                user=order.user,
                title='Order Out for Delivery',
                message=(
                    f'Your Order #{order.id} is now out for delivery. '
                    f'Expected delivery: {expected_date.strftime("%d %b %Y")}.'
                ),
                notification_type='DELIVERY',
                priority='IMPORTANT',
                related_id=order.id,
                related_url=f'/orders/{order.id}'
            )

            # Notify admins
            admins = User.objects.filter(
                is_superuser=True,
                is_active=True
            )

            create_notifications_for_users(
                users=admins,
                title='Order Out for Delivery',
                message=(
                    f'Order #{order.id} is now out for delivery by '
                    f'{request.user.username}. '
                    f'Expected delivery: {expected_date.strftime("%d %b %Y")}.'
                ),
                notification_type='DELIVERY',
                priority='NORMAL',
                related_id=order.id,
                related_url=f'/admin/orders/{order.id}'
            )
               

            

        # --------------------------------------------------
        # Collect COD payment
        # --------------------------------------------------

        elif action == 'collect_cod':

            if order.payment_method != 'COD':

                return Response(
                    {
                        'error': 'This order is not a COD order.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if order.payment_status == 'Paid':

                return Response(
                    {
                        'error': 'COD payment has already been collected.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.payment_status = 'Paid'
            order.cod_collected_by = request.user
            order.cod_collected_at = timezone.now()

            order.save()
            create_notification(
                user=order.user,
                title='COD Payment Collected',
                message=f'Cash payment for Order #{order.id} has been collected successfully.',
                notification_type='DELIVERY',
                priority='IMPORTANT',
                related_id=order.id,
                related_url=f'/orders/{order.id}'
            )

            admins = User.objects.filter(
                is_superuser=True,
                is_active=True
            )

            create_notifications_for_users(
                users=admins,
                title='COD Payment Collected',
                message=f'COD payment for Order #{order.id} was collected by {request.user.username}.',
                notification_type='DELIVERY',
                priority='NORMAL',
                related_id=order.id,
                related_url=f'/admin/orders/{order.id}'
            )

        # --------------------------------------------------
        # Complete delivery
        # --------------------------------------------------

        elif action == 'deliver':

            if order.status == 'Cancelled':
                return Response(
                    {
                        'error': 'Cancelled orders cannot be delivered.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if order.payment_method == 'COD' and order.payment_status != 'Paid':
                return Response(
                    {
                        'error':
                        'COD payment must be collected before delivery is completed.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark delivery as completed
            order.delivery_status = 'Delivered'
            order.status = 'Delivered'
            order.delivered_at = timezone.now()

            order.save()

            # Notify customer
            create_notification(
                user=order.user,
                title='Order Delivered',
                message=(
                    f'Your Order #{order.id} has been delivered successfully.'
                ),
                notification_type='DELIVERY',
                priority='IMPORTANT',
                related_id=order.id,
                related_url=f'/orders/{order.id}'
            )

            # Notify admins
            admins = User.objects.filter(
                is_superuser=True,
                is_active=True
            )

            create_notifications_for_users(
                users=admins,
                title='Order Delivered',
                message=(
                    f'Order #{order.id} has been delivered by '
                    f'{request.user.username}.'
                ),
                notification_type='DELIVERY',
                priority='NORMAL',
                related_id=order.id,
                related_url=f'/admin/orders/{order.id}'
            )

        else:

            return Response(
                {
                    'error': 'Invalid delivery action.'
                },
                status=status.HTTP_400_BAD_REQUEST
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

class StaffDeliveryStatsView(APIView):

    permission_classes = [
        IsStaffUser,
        HasDeliveryResponsibility
    ]

    def get(self, request):

        # All deliveries assigned to this staff member.
        # Delivered orders are included in the statistics.
        assigned_orders = Order.objects.filter(
            assigned_staff=request.user
        )

        total_deliveries = assigned_orders.filter(
            status__in=['Confirmed', 'Shipped', 'Delivered']
        ).count()

        assigned_deliveries = assigned_orders.filter(
            delivery_status='Assigned'
        ).count()

        out_for_delivery = assigned_orders.filter(
            delivery_status='Out for Delivery'
        ).count()

        finished_deliveries = assigned_orders.filter(
            delivery_status='Delivered'
        ).count()

        cod_pending = assigned_orders.filter(
            payment_method='COD',
            payment_status='Pending',
            status__in=['Confirmed', 'Shipped']
        ).count()

        cod_collected = assigned_orders.filter(
            payment_method='COD',
            payment_status='Paid'
        ).count()

        return Response({

            'total_deliveries':
                total_deliveries,

            'assigned_deliveries':
                assigned_deliveries,

            'out_for_delivery':
                out_for_delivery,

            'finished_deliveries':
                finished_deliveries,

            'cod_pending':
                cod_pending,

            'cod_collected':
                cod_collected

        })  