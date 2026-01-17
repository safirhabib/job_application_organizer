from rest_framework import serializers
from .models import JobApplication  # make sure this model exists

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'  # or list the fields explicitly
