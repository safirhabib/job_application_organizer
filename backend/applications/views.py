from django.http import HttpResponse

#Umran US1
from rest_framework import generics
from .models import JobApplication
from .serializers import JobApplicationSerializer

def home(request):
    return HttpResponse("Django is working ✅")

class JobCreateView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
