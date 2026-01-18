from django.db import models
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.
class MasterResume(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="MasterResume"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_jake_template():
        with open("jake_template.tex", 'r') as f:
            print("file found")
            return f.read()
        print("file not found")
        return None

    latex_source = models.TextField(default=get_jake_template())

    def __str__(self):
        return f"This object was created at {self.created_at} and last updated at {self.updated_at}"

class JobApplication(models.Model):
    # For Ali's US2
    STATUS_CHOICES = [
        ('APPLIED', 'Applied'),
        ('INTERVIEW', 'Interview'),
        ('OFFER', 'Offer'),
        ('REJECTED', 'Rejected'),
    ]
    # For Umran's US1
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    date_applied = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPLIED')
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_stale(self) -> bool:
        """True if job hasn't been updated in > 7 days."""
        if not self.updated_at:
            return False
        return timezone.now() - self.updated_at > timedelta(days=7)
    
    def touch(self):
        """Bump the last-updated timestamp without changing other fields."""
        self.updated_at = timezone.now()
        self.save(update_fields=['updated_at'])


    def __str__(self):
        return f"{self.company} - {self.role}"

class TailoredResume(models.Model):
    # For Safir's US4
    job = models.OneToOneField(JobApplication, on_delete=models.CASCADE, null=True, blank=True)
    client_job_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class CommLog(models.Model):
    # For Liqi Yin's US5
    job = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='logs')
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
