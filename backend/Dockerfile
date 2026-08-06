# Dev image for the Django backend (ARCHITECTURE §7.2).
FROM python:3.13-slim

WORKDIR /app

# Dependencies first: this layer is cached until requirements.txt changes,
# so code edits don't re-run pip (guide 17 §3.2).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code last — the layer that changes constantly.
COPY . .

# Prod-style default; compose overrides this with runserver for dev.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
