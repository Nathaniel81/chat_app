from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class ChatRoom(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    TEXT = 'text'
    IMAGE = 'image'
    VIDEO = 'video'
    MESSAGE_TYPE_CHOICES = [
        (TEXT, 'Text'),
        (IMAGE, 'Image'),
        (VIDEO, 'Video'),
    ]

    chat_room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)
    text = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default=TEXT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user} message in {self.chat_room}'

class Conversation(models.Model):
    admin = models.ForeignKey(User, related_name='convos', on_delete=models.CASCADE, null=True, blank=True)
    chat_room = models.ForeignKey(ChatRoom, related_name='rooms', on_delete=models.CASCADE)
    # room_image = 
    participants = models.ManyToManyField(User)
    is_group = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.chat_room.name} (Group)' if self.is_group else f'Conversation in {self.chat_room.name}'

