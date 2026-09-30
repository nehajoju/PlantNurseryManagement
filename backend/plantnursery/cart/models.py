from django.db import models
from django.conf import settings
from plants.models import Plant


class Cart(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )

    plant = models.ForeignKey(
        Plant,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )

    quantity = models.PositiveIntegerField(default=1)

    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'plant')

    def __str__(self):
        return f"{self.user.username} - {self.plant.name}"

class Wishlist(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )

    plant = models.ForeignKey(
        Plant,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )

    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'plant')

    def __str__(self):
        return f"{self.user.username} - {self.plant.name}"