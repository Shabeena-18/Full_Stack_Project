#!/usr/bin/env bash
# Runs on Render every time you deploy.
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate --no-input

# Load the sample menu (safe to repeat: existing dishes are skipped).
python manage.py populate_food

# Create the admin account from DJANGO_SUPERUSER_* variables (skipped if it exists).
python manage.py createsuperuser --no-input || echo "Admin user already exists - skipping."
