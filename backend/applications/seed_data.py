import os
import django
import random
from datetime import date, timedelta
import sys

# Aalpesh, this tells Python to look one folder UP so it can see the 'core' folder
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Aalpesh, your image shows the folder is named 'core'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from applications.models import JobApplication

def seed_jobs():
    companies = ["Google", "Amazon", "Tesla", "Microsoft", "Apple", "Netflix", "Meta", "OpenAI"]
    roles = ["Software Engineer", "Product Manager", "UI Designer", "Data Scientist"]
    # Aalpesh, verify these match your choices in models.py
    statuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"]

    print("Aalpesh, starting the seed process...")
    
    # Optional: Clear existing data
    JobApplication.objects.all().delete()
    
    for _ in range(10):
        JobApplication.objects.create(
            company=random.choice(companies),
            role=random.choice(roles),
            date_applied=date.today() - timedelta(days=random.randint(0, 14)),
            status=random.choice(statuses)
        )
    
    print("Success! Aalpesh, your 10 test jobs are now in the database.")

if __name__ == '__main__':
    seed_jobs()