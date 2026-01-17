from django.http import HttpResponse
from django.http import JsonResponse
from applications.models import MasterResume
from rest_framework import generics
from .models import JobApplication
from .serializers import JobSerializer  # THIS MUST MATCH EXACTLY

def get_master_latex(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)

    master_resume, _ = MasterResume.objects.get_or_create(
        user=request.user
    )

    print(master_resume.latex_source)

    return JsonResponse(
        {
            "latex_source": master_resume.latex_source,
            "created_at": master_resume.created_at,
            "updated_at": master_resume.updated_at,
        },
        status=200
    )

class JobCreateView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobSerializer
