from rest_framework import serializers
from .models import JobApplication, CommLog

class CommLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommLog
        fields = ["id", "job", "note", "created_at"]
        read_only_fields = ["id", "job", "created_at"]


# Aalpesh, changed 'def' to 'class' and added the inheritance
class JobSerializer(serializers.ModelSerializer):
    logs = CommLogSerializer(many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = "__all__"

