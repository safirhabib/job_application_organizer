from django.urls import path
from .views import JobCreateView
from applications.views import get_master_latex, JobCreateView

urlpatterns = [
    path('jobs/', JobCreateView.as_view(), name='job-list-create'),
    path("api/jobs/", JobCreateView.as_view()),
]