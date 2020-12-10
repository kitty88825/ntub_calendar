#!/bin/bash
set -ex

python manage.py collectstatic --noinput

echo "Making migration files"
python manage.py makemigrations --noinput

echo "Migrating Database"
python manage.py migrate --noinput

echo "Starting uWSGI"
uwsgi --ini uwsgi.ini

echo "Loaddata group.json"
python manage.py loaddata group.json

echo "Loaddata calendar.json"
python manage.py loaddata calendar.json

echo "Run django Q"
python manage.py qcluster -d

exec "$@"
