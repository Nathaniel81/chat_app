FROM python:3.11.4-slim-bullseye

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SETTINGS_MODULE=chat.settings
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app

RUN apt-get update && apt-get install -y python3-venv gcc

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY ./requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app

RUN python manage.py migrate

CMD ["gunicorn", "chat.asgi:application", "-b", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker"]
