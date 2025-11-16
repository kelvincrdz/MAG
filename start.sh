#!/bin/bash
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Gunicorn server..."
exec gunicorn --bind :8000 --workers 2 --threads 4 --timeout 60 --access-logfile - --error-logfile - mag_player.wsgi:application
