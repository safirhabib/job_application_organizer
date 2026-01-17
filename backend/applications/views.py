from rest_framework import generics
from .models import JobApplication
from .serializers import JobSerializer  # THIS MUST MATCH EXACTLY

class JobListCreate(generics.ListCreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobSerializer
