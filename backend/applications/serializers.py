from rest_framework import serializers
from .models import JobApplication

def JobSerializer():
    class Meta:
        model = JobApplication
        fields = "__all__"