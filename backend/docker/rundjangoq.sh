set -ex

echo "Run django Q"
python manage.py qcluster

exec "$@"
