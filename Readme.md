# JobApplication
**Problem Overview:** The current job market can be challenging for job seekers. Individuals often find themselves applying to numerous companies, tailoring their resumes for each specific role, and struggling to keep track of all their applications. 

**Task:** Create software that assists job seekers in managing their job applications more efficiently. The system would enable individuals to easily monitor where they have applied, track the status of applications, customize their resumes for different positions, and keep all of their job-related information organized.

You can manually create the jobs and update their status as an administrator of the application, we do not expect a user management system for job posters.

---

## Requirements
- Python 3.10+
- pip
- node 20+

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone git@github.com:safirhabib/job_application_organizer.git
cd job_application_organizer
```

### 2. Setup backend
```bash
cd backend/

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# create migrations of the new update
python manage.py makemigrations

# apply database migrations
python manage.py migrate

# create admin user
python manage.py createsuperuser

# run backend server on port 8000
python manage.py runserver
```

### 3. Setup frontend
```bash
cd client/

# install dependencies
npm install

# run the server on port 5173
npm run dev
```