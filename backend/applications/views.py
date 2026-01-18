import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import generics
from django.contrib.auth.models import User
from django.views.decorators.http import require_GET
from .latex_converter import tex_to_pdf_bytes, pdf_page_count, pdf_page_to_png

# Importing models and serializers
from .models import MasterResume, JobApplication, TailoredResume, CommLog
from .serializers import JobSerializer, CommLogSerializer

class JobCreateView(generics.ListCreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobSerializer

@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_master_latex(request):
    user = _get_or_create_demo_user(request)
    master_resume, _ = MasterResume.objects.get_or_create(user=user)
    
    return JsonResponse(
        {
            "latex_source": getattr(master_resume, 'latex_source', ""),
            "created_at": getattr(master_resume, 'created_at', None),
            "updated_at": getattr(master_resume, 'updated_at', None),
        },
        status=200
    )

@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_master_preview(request):
    user = _get_or_create_demo_user(request)
    master_resume, _ = MasterResume.objects.get_or_create(user=user)
    latex_resume = getattr(master_resume, 'latex_source', "")
    try:
        from . import latex_converter
        resume_img = latex_converter.tex_to_png(latex_resume)
        return HttpResponse(resume_img, content_type="image/png", status=200)
    except Exception:
        return JsonResponse(
            {"error": "Preview service unavailable. Install ImageMagick to enable."},
            status=501,
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

    resume.content = getattr(master_resume, 'latex_source', "")
    resume.save()
    return JsonResponse({"message": "cloned", "content": resume.content}, status=200)


@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_tailored_preview(request, client_job_id):
    resume = TailoredResume.objects.filter(client_job_id=client_job_id).first()
    if not resume:
        return JsonResponse({"error": "Tailored resume not found"}, status=404)

    latex_resume = resume.content or ""
    try:
        from . import latex_converter
        resume_img = latex_converter.tex_to_png(latex_resume)
        return HttpResponse(resume_img, content_type="image/png", status=200)
    except Exception:
        return JsonResponse(
            {"error": "Preview service unavailable. Install ImageMagick to enable."},
            status=501,
        )

def _get_or_create_demo_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(username="demo")
    return user

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobSerializer

def no_cache(resp: HttpResponse) -> HttpResponse:
    resp["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp["Pragma"] = "no-cache"
    resp["Expires"] = "0"
    return resp


def get_master_latex_source_for_request(request) -> str:
    user = _get_or_create_demo_user(request)
    master_resume, _ = MasterResume.objects.get_or_create(user=user)
    return getattr(master_resume, "latex_source", "") or ""


@require_GET
def master_preview_meta(request):
    latex = get_master_latex_source_for_request(request)
    try:
        pdf_bytes = tex_to_pdf_bytes(latex)
        pages = pdf_page_count(pdf_bytes)
        return no_cache(JsonResponse({"pages": pages}, status=200))
    except Exception as e:
        return no_cache(JsonResponse({"error": str(e)}, status=500))


@require_GET
def get_master_preview(request):
    page_str = request.GET.get("page", "1")
    try:
        page = int(page_str)
    except ValueError:
        return no_cache(JsonResponse({"error": "Invalid page"}, status=400))

    latex = get_master_latex_source_for_request(request)

    try:
        pdf_bytes = tex_to_pdf_bytes(latex)
        total_pages = pdf_page_count(pdf_bytes)

        if page < 1 or page > total_pages:
            return no_cache(JsonResponse({"error": f"page must be between 1 and {total_pages}"}, status=400))

        png_bytes = pdf_page_to_png(pdf_bytes, page=page, resolution=200)
        return no_cache(HttpResponse(png_bytes, content_type="image/png", status=200))

    except Exception as e:
        return no_cache(JsonResponse({"error": str(e)}, status=500))


@require_GET
def get_master_pdf(request):
    latex = get_master_latex_source_for_request(request)
    try:
        print("PDF latex len:", len(latex))
        print("PDF latex head:", repr(latex[:120]))

        pdf_bytes = tex_to_pdf_bytes(latex)
        resp = HttpResponse(pdf_bytes, content_type="application/pdf", status=200)
        resp["Content-Disposition"] = 'attachment; filename="master_resume.pdf"'
        return no_cache(resp)

    except Exception as e:
        return no_cache(JsonResponse({
            "error": str(e),
            "latex_len": len(latex),
            "latex_head": latex[:120],
        }, status=500))

class JobLogListCreateView(generics.ListCreateAPIView):
    serializer_class = CommLogSerializer

    def get_queryset(self):
        job_id = self.kwargs["job_id"]
        return CommLog.objects.filter(job_id=job_id).order_by("-timestamp", "-created_at")

    def perform_create(self, serializer):
        job_id = self.kwargs["job_id"]
        serializer.save(job_id=job_id)

