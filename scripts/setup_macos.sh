#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> macOS setup for Job Application Organizer"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Install it from https://brew.sh and re-run."
  exit 1
fi

echo "==> Installing system deps (ImageMagick, Ghostscript, BasicTeX)"
brew install imagemagick ghostscript || true
brew install --cask basictex || true

echo "==> Ensuring TeX is on PATH"
if ! command -v pdflatex >/dev/null 2>&1; then
  export PATH="/Library/TeX/texbin:$PATH"
fi

echo "==> Exporting ImageMagick/Wand env vars for this shell"
export MAGICK_HOME="/opt/homebrew/opt/imagemagick"
export DYLD_LIBRARY_PATH="/opt/homebrew/opt/imagemagick/lib"
export WAND_LIBRARY="/opt/homebrew/opt/imagemagick/lib/libMagickWand-7.Q16HDRI.dylib"

echo "==> Backend setup"
cd "$ROOT_DIR/backend"
python3.12 -m venv .venv || true
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

echo "==> Frontend setup"
cd "$ROOT_DIR/frontend"
npm install

echo ""
echo "Done."
echo "Start backend:"
echo "  cd \"$ROOT_DIR/backend\""
echo "  source .venv/bin/activate"
echo "  python3.12 manage.py runserver"
echo "Start frontend:"
echo "  cd \"$ROOT_DIR/frontend\""
echo "  npm run dev"

