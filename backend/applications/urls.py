from django.urls import path
from .views import (
    JobCreateView,
    get_tailored_latex,
    update_tailored_latex,
    clone_master_to_tailored,
)

urlpatterns = [
    path('jobs/', JobCreateView.as_view(), name='job-list-create'),
    path('tailored/<str:client_job_id>/', get_tailored_latex, name='get-tailored-latex'),
    path('tailored/<str:client_job_id>/update/', update_tailored_latex, name='update-tailored-latex'),
    path('tailored/<str:client_job_id>/clone/', clone_master_to_tailored, name='clone-tailored-latex'),
]