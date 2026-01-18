import subprocess
import sys
import os

def run_command(command, cwd=None):
    print(f"running: {command} in {cwd if cwd else 'root'}...")
    try:
        subprocess.check_call(command, shell=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"there was an error: {e}")

def main():
    # 1. BACKEND DEPENDENCIES
    backend_dir = os.path.join(os.getcwd(), "backend")
    
    # we are installing everything your views.py and models.py need
    python_libs = [
        "django",
        "djangorestframework",
        "django-cors-headers",
        "Wand",
        "requests"
    ]
    
    run_command(f"pip install {' '.join(python_libs)}")
    
    # 2. DATABASE MIGRATIONS
    run_command("python manage.py makemigrations", cwd=backend_dir)
    run_command("python manage.py migrate", cwd=backend_dir)
    
    # 3. FRONTEND DEPENDENCIES
    frontend_dir = os.path.join(os.getcwd(), "frontend")
    
    # Installing the core npm tools + all the libraries we discussed
    npm_libs = [
        "axios",
        "lucide-react",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "@dnd-kit/utilities",
        "tailwindcss",
        "postcss",
        "autoprefixer"
    ]
    
    run_command("npm install", cwd=frontend_dir)
    run_command(f"npm install {' '.join(npm_libs)}", cwd=frontend_dir)

    print("\n" + "="*40)
    print("The environment is ready!")
    print("1. In one terminal (backend): python manage.py runserver")
    print("2. In another terminal (frontend): npm run dev")
    print("="*40)

if __name__ == "__main__":
    main()