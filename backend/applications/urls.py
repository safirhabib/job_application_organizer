from django.urls import path
from .views import JobListCreate

urlpatterns = [
    path('jobs/', JobListCreate.as_view(), name='job-list-create'),
]