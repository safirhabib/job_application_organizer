from rest_framework import serializers
from .models import JobApplication

def JobApplicationSerializer():
    class Meta:
        model = JobApplication
        fields = "__all__"