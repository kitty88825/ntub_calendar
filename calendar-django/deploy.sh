#!/usr/bin/env bash
cp -rf Pipfile docker/
cp -rf Pipfile.lock docker/
docker-compose build
docker-compose down
docker-compose up -d
rm -rf docker/Pipfile
rm -rf docker/Pipfile.lock