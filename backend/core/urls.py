"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
<<<<<<< HEAD
from django.urls import path
from applications.views import home, JobCreateView #"JobCreateView" added for US1 by Umran

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home),
    path("api/jobs/", JobCreateView.as_view())
=======
from django.urls import path, include
from applications.views import get_master_latex

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/master_latex", get_master_latex),
    path('api/', include('applications.urls')),
>>>>>>> b4f8dc308642e0a165b7162f6cbbd3728766c461
]

