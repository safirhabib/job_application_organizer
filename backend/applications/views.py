import json
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import generics
from django.contrib.auth.models import User

# Importing models and serializers
from .models import MasterResume, JobApplication, TailoredResume
from .serializers import JobSerializer

class JobCreateView(generics.ListCreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobSerializer

@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_master_latex(request):
    user = _get_or_create_demo_user(request)
    # Ensure your model has 'latex_source'. If it uses 'content', change this line!
    master_resume, _ = MasterResume.objects.get_or_create(user=user)
    
    return JsonResponse(
        {
            "latex_source": getattr(master_resume, 'latex_source', ""),
            "created_at": getattr(master_resume, 'created_at', None),
            "updated_at": getattr(master_resume, 'updated_at', None),
        },
        status=200
    )

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

    user = _get_or_create_demo_user(request)
    master_resume, _ = MasterResume.objects.get_or_create(user=user)
    master_resume.latex_source = latex_source
    master_resume.save()
    return JsonResponse({"message": "updated"}, status=200)

@require_http_methods(["GET"])
def get_tailored_latex(request, client_job_id):
    resume = TailoredResume.objects.filter(client_job_id=client_job_id).first()
    if not resume:
        return JsonResponse({"content": "", "exists": False}, status=200)

    return JsonResponse(
        {
            "content": resume.content,
            "exists": True,
            "created_at": resume.created_at,
            "updated_at": resume.updated_at,
        },
        status=200,
    )

@csrf_exempt
@require_http_methods(["POST"])
def update_tailored_latex(request, client_job_id):
    try:
        data = json.loads(request.body)
        latex_source = data.get("latex_source")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    resume, _ = TailoredResume.objects.get_or_create(client_job_id=client_job_id)
    resume.content = latex_source
    resume.save()
    return JsonResponse({"message": "updated"}, status=200)

@csrf_exempt
@require_http_methods(["POST"])
def clone_master_to_tailored(request, client_job_id):
    user = _get_or_create_demo_user(request)
    master_resume, _ = MasterResume.objects.get_or_create(user=user)
    resume, _ = TailoredResume.objects.get_or_create(client_job_id=client_job_id)
    # Safely copying the master source to the tailored content
    resume.content = getattr(master_resume, 'latex_source', "")
    resume.save()
    return JsonResponse({"message": "cloned", "content": resume.content}, status=200)

def _get_or_create_demo_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(username="demo")
    return user

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobSerializer