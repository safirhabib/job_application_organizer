import os
import subprocess
import tempfile
from io import BytesIO
from typing import Tuple

from wand.image import Image


def tex_to_pdf_bytes(latex_code: str) -> bytes:
    """
    Compile LaTeX into a PDF and return PDF bytes.
    """
    env = os.environ.copy()

    env["PATH"] = env.get("PATH", "") + ":/Library/TeX/texbin:/opt/homebrew/bin:/usr/texbin:/usr/local/bin"

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

        page_index = page - 1
        with Image(filename=f"{pdf_path}[{page_index}]", resolution=resolution) as img:
            img.format = "png"
            buf = BytesIO()
            img.save(file=buf)
            return buf.getvalue()
