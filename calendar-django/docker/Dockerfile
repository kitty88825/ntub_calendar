FROM python:3.8
WORKDIR /code

ENV LANG=en_US.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update && apt-get install -y \
  build-essential \
  libsasl2-dev \
  pipenv \
  python3-dev \
  liblzma-dev \
  libpq-dev

RUN pip install --upgrade --no-cache-dir pip setuptools uwsgi

COPY Pipfile .
COPY Pipfile.lock .
RUN pipenv install --system --deploy

ARG DOCKER_ROOT
COPY ${DOCKER_ROOT}/entrypoint.sh /usr/local/bin/
#COPY ${DOCKER_ROOT}/runcelery.sh /usr/local/bin/

ARG DJANGO_ROOT
COPY ${DJANGO_ROOT}/ .
RUN chmod +x /usr/local/bin/entrypoint.sh && chmod +x manage.py
#RUN chmod +x /usr/local/bin/entrypoint.sh && chmod +x manage.py && chmod +x /usr/local/bin/runcelery.sh

CMD [ "entrypoint.sh" ]