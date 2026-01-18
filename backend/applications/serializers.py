from rest_framework import serializers
from .models import JobApplication

# Aalpesh, changed 'def' to 'class' and added the inheritance
class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = "__all__"