import os
import subprocess
import tempfile
import platform
from io import BytesIO


if platform.system() == "Windows":
    # 1. Aalpesh, this helps Wand find ImageMagick
    magick_path = r'C:\Program Files\ImageMagick-7.1.1-Q16-HDRI' 
    os.environ['MAGICK_HOME'] = magick_path
    
    # 2. Aalpesh, this helps Django find 'pdflatex' (MiKTeX)
    # Check your C: drive to make sure this path is correct for your MiKTeX version
    latex_path = r'C:\Users\aalpe\AppData\Local\Programs\MiKTeX\miktex\bin\x64'
    
    # Aalpesh, we combine them into the system PATH
    os.environ['PATH'] = magick_path + os.pathsep + latex_path + os.pathsep + os.environ['PATH']

from wand.image import Image


def tex_to_pdf_bytes(latex_code: str) -> bytes:
    """
    Compile LaTeX into a PDF and return PDF bytes.
    """
    env = os.environ.copy()
    env = os.environ.copy()
    env["PATH"] = env.get("PATH", "") + ":/Library/TeX/texbin:/opt/homebrew/bin:/usr/texbin:/usr/local/bin"
    env.setdefault("MAGICK_HOME", "/opt/homebrew/opt/imagemagick")
    env.setdefault("DYLD_LIBRARY_PATH", "/opt/homebrew/opt/imagemagick/lib")
    env.setdefault("WAND_LIBRARY", "/opt/homebrew/opt/imagemagick/lib/libMagickWand-7.Q16HDRI.dylib")

    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "output.tex")
        pdf_path = os.path.join(tmpdir, "output.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_code)

        p = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "output.tex"],
            cwd=tmpdir,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        if p.returncode != 0 or not os.path.exists(pdf_path):
            raise RuntimeError(f"LaTeX compile failed:\n{p.stdout}")

        with open(pdf_path, "rb") as f:
            return f.read()


def pdf_page_count(pdf_bytes: bytes) -> int:
    """
    Return number of pages in a PDF given as bytes.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        pdf_path = os.path.join(tmpdir, "input.pdf")
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)

        with Image(filename=pdf_path) as img:
            return len(img.sequence)


def pdf_page_to_png(pdf_bytes: bytes, page: int, resolution: int = 200) -> bytes:
    """
    Convert a single PDF page (1-indexed) to PNG bytes.
    """
    if page < 1:
        raise ValueError("page must be >= 1")

    with tempfile.TemporaryDirectory() as tmpdir:
        pdf_path = os.path.join(tmpdir, "input.pdf")
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)

        page_index = page - 1  # 0-indexed for wand
        with Image(filename=f"{pdf_path}[{page_index}]", resolution=resolution) as img:
            img.format = "png"
            buf = BytesIO()
            img.save(file=buf)
            return buf.getvalue()
