#!/usr/bin/env bash
set -ex
celery -A config worker -l info -B
exec "$@"