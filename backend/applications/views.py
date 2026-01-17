import json
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_http_methods

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from applications.models import MasterResume
from .models import JobApplication
from .serializers import JobSerializer


@ensure_csrf_cookie
@require_http_methods(["GET"])
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

<<<<<<< HEAD

@csrf_exempt
@require_http_methods(["POST"])
def update_master_latex(request):
    try:
        data = json.loads(request.body)
        latex_source = data.get("latex_source")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if latex_source is None:
        return JsonResponse({"error": "latex_source is required"}, status=400)

    master_resume, _ = MasterResume.objects.get_or_create(user=request.user)
    master_resume.latex_source = latex_source
    master_resume.save()

    return JsonResponse({"message": "updated"}, status=200)


class JobListCreate(generics.ListCreateAPIView):
=======
class JobCreateView(generics.CreateAPIView):
>>>>>>> umran
    queryset = JobApplication.objects.all()
    serializer_class = JobSerializer
