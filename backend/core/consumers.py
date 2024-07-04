import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatRoom, Message, User
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope['query_string'].decode())
        user_id = query_params.get('user_id', [None])[0]

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        if user_id:
            user = await self.get_user(user_id)
            if user:
                self.scope['user'] = user
            else:
                await self.close()
                return
        else:
            await self.close()
            return

        # Add user to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        text = text_data_json['text']
        user = text_data_json['user']

        # Save message to the database
        await self.save_message(self.room_name, user, text)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'text': text,
                'user': user,
            }
        )

    async def chat_message(self, event):
        text = event['text']
        user = event['user']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'text': text,
            'user': user,
        }))

    @sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @sync_to_async
    def save_message(self, room_name, sender_username, message):
        room, created = ChatRoom.objects.get_or_create(name=room_name)
        user = User.objects.get(username=sender_username)
        Message.objects.create(chat_room=room, user=user, text=message)

class GlobalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope['query_string'].decode())
        user_id = query_params.get('user_id', [None])[0]

        if user_id:
            user = await self.get_user(user_id)
            if user:
                self.scope['user'] = user
            else:
                await self.close()
                return
        else:
            await self.close()
            return

        self.room_group_name = 'chat_global'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.broadcast_user_status(user.username, 'online')

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        user = self.scope.get("user")
        if user:
            await self.broadcast_user_status(user.username, 'offline')

    async def receive(self, text_data):
        pass

    async def broadcast_user_status(self, username, status):
        await self.channel_layer.group_send(
            'chat_global',
            {
                'type': 'user_status',
                'user': username,
                'status': status
            }
        )

    async def user_status(self, event):
        user = event['user']
        status = event['status']

        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user': user,
            'status': status
        }))

    @sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None