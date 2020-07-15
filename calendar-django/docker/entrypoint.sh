#!/bin/bash
set -ex

python manage.py collectstatic --noinput

echo "Making migration files"
python manage.py makemigrations --noinput

echo "Migrating Database"
python manage.py migrate --noinput

echo "Starting uWSGI"
uwsgi --ini uwsgi.ini

exec "$@"
