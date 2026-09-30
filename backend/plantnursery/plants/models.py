from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Plant(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='plants'
    )
    name = models.CharField(max_length=150)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='plants/', blank=True, null=True)

    sunlight = models.CharField(max_length=100, blank=True, null=True)
    watering = models.CharField(max_length=100, blank=True, null=True)
    care_instructions = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class StockMovement(models.Model):

    MOVEMENT_TYPE_CHOICES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
    ]

    plant = models.ForeignKey(
        Plant,
        on_delete=models.CASCADE,
        related_name='stock_movements'
    )

    movement_type = models.CharField(
        max_length=10,
        choices=MOVEMENT_TYPE_CHOICES
    )

    quantity = models.PositiveIntegerField()

    previous_stock = models.PositiveIntegerField()

    new_stock = models.PositiveIntegerField()

    reason = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements'
    )

    performed_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements_performed'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f'{self.plant.name} - '
            f'{self.movement_type} - '
            f'{self.quantity}'
        )