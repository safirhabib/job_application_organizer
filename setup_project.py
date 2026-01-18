import subprocess
import platform
import os
import sys

def run_cmd(cmd, name, cwd=None):
    print(f"\nAalpesh, starting {name}...")
    try:
        # Aalpesh, shell=True is essential for winget/brew and PATH updates
        subprocess.check_call(cmd, shell=True, cwd=cwd)
        print(f"✅ Aalpesh, {name} completed successfully.")
    except Exception as e:
        print(f"❌ Aalpesh, {name} failed or was already installed: {e}")

def main():
    system = platform.system()
    root_dir = os.getcwd()
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # 1. SYSTEM-LEVEL TOOLS (The Heavy Lifting)
    if system == "Windows":
        print("--- Aalpesh, Automating Windows System Setup ---")
        run_cmd("winget install ImageMagick.ImageMagick --source winget", "ImageMagick")
        run_cmd("winget install ArtifexSoftware.Ghostscript --source winget", "Ghostscript")
        run_cmd("winget install MiKTeX.MiKTeX --source winget", "MiKTeX")
        print("\n⚠️ Aalpesh, if system tools were just installed, a terminal restart is required after this script finishes.")

    elif system == "Darwin": # Mac
        print("--- Aalpesh, Automating Mac System Setup ---")
        run_cmd("brew install imagemagick ghostscript mactex", "Mac Tools")

    # 2. BACKEND LIBRARIES (pip)
    # Aalpesh, these are critical for your views.py and models.py
    python_libs = ["django", "djangorestframework", "django-cors-headers", "Wand", "requests"]
    run_cmd(f"pip install {' '.join(python_libs)}", "Python Libraries")

    # 3. DATABASE MIGRATIONS
    # This ensures everyone has the same schema for the hackathon
    print("\n--- Aalpesh, Syncing Database ---")
    run_cmd("python manage.py makemigrations", "Make Migrations", cwd=backend_dir)
    run_cmd("python manage.py migrate", "Apply Migrations", cwd=backend_dir)

    # 4. FRONTEND LIBRARIES (npm)
    # Supporting Ali's Kanban (US2) and your Frontend work (US7)
    npm_libs = [
        "axios", "lucide-react", "@dnd-kit/core", "@dnd-kit/sortable", 
        "@dnd-kit/utilities", "tailwindcss", "postcss", "autoprefixer"
    ]
    print("\n--- Aalpesh, Installing Frontend Dependencies ---")
    run_cmd("npm install", "Base NPM Install", cwd=frontend_dir)
    run_cmd(f"npm install {' '.join(npm_libs)}", "Frontend Libraries", cwd=frontend_dir)

    print("\n" + "="*50)
    print("Aalpesh, the Hackathon environment is synchronized!")
    print("1. Backend: python manage.py runserver")
    print("2. Frontend: npm run dev")
    print("="*50)

if __name__ == "__main__":
    main()