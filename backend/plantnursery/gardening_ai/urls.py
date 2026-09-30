from django.urls import path
from .views import GardeningAIView


urlpatterns = [
    path('ask/', GardeningAIView.as_view(), name='gardening-ai-ask'),
]