import os
import subprocess
import tempfile
from io import BytesIO

def tex_to_png(latex_code: str) -> bytes:
    env = os.environ.copy()
    env["PATH"] = env.get("PATH", "") + ":/Library/TeX/texbin:/opt/homebrew/bin"
    env.setdefault("MAGICK_HOME", "/opt/homebrew/opt/imagemagick")
    env.setdefault("DYLD_LIBRARY_PATH", "/opt/homebrew/opt/imagemagick/lib")
    env.setdefault("WAND_LIBRARY", "/opt/homebrew/opt/imagemagick/lib/libMagickWand-7.Q16HDRI.dylib")

    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "output.tex")
        pdf_path = os.path.join(tmpdir, "output.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_code)

        # IMPORTANT: run inside tmpdir and pass env
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

        from wand.image import Image
        with Image(filename=pdf_path, resolution=300) as img:
            img.format = "png"
            buf = BytesIO()
            img.save(file=buf)
            buf.seek(0)
            return buf.read()
