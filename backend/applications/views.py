from django.http import HttpResponse
from django.http import JsonResponse

def get_master_latex(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)

    master_resume = request.user.masterResume
    print(master_resume.latex_source)

    return JsonResponse(
        {
            "latex_source": master_resume.latex_source,
            "created_at": master_resume.created_at,
            "updated_at": master_resume.updated_at,
        },
        status=200
    )