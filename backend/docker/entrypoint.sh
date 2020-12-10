#!/bin/bash
set -ex

python manage.py collectstatic --noinput

echo "Making migration files"
python manage.py makemigrations --noinput

echo "Migrating Database"
python manage.py migrate --noinput

echo "Loaddata group.json"
python manage.py loaddata group.json  --noinput

echo "Loaddata calendar.json"
python manage.py loaddata calendar.json  --noinput

echo "Loaddata super.json"
python manage.py loaddata super.json  --noinput

echo "Loaddata permission.json"
python manage.py loaddata permission.json  --noinput

echo "Run django Q"
python manage.py qcluster --traceback

echo "Starting uWSGI"
uwsgi --ini uwsgi.ini

exec "$@"
