# Use the official Python image from the Docker Hub
FROM python:3.11.4-slim-bullseye

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SETTINGS_MODULE=chat.settings

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3-venv

# Create and activate a virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY ./requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the application code
COPY . /app

# Define the entrypoint for the web service
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "chat.asgi:application"]
