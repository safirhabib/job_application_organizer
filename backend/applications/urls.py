from django.urls import path
from .views import JobCreateView, JobDetailView
from .views import (
    JobCreateView,
    get_tailored_latex,
    update_tailored_latex,
    clone_master_to_tailored,
)
from . import views

urlpatterns = [
    path('jobs/', JobCreateView.as_view(), name='job-list-create'),
    path('tailored/<str:client_job_id>/', get_tailored_latex, name='get-tailored-latex'),
    path('tailored/<str:client_job_id>/update/', update_tailored_latex, name='update-tailored-latex'),
    path('tailored/<str:client_job_id>/clone/', clone_master_to_tailored, name='clone-tailored-latex'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path("get_master_latex", views.get_master_latex),
    path("update_master_latex", views.update_master_latex),
    path("master_preview_meta", views.master_preview_meta),
    path("get_master_preview", views.get_master_preview),
    path("get_master_pdf", views.get_master_pdf),
]