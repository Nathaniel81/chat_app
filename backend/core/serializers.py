from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, ChatRoom, Message, Conversation


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for basic user information.
    This serializer includes only the id, name, username, and profile_picture fields.
    """
    
    class Meta:
        model = User
        fields = ['id', 'username', 'is_online']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'user', 'text', 'message_type', 'created_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'messages']

class ConversationSerializer(serializers.ModelSerializer):
    admin = UserSerializer(read_only=True)
    participants = UserSerializer(read_only=True, many=True)
    chat_room = serializers.StringRelatedField()
    last_message = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Conversation
        fields = '__all__'

    def get_last_message(self, obj):
        last_message = obj.chat_room.messages.last()
        return MessageSerializer(last_message).data if last_message else None

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token obtain pair serializer.

    This serializer is used to add additional user data to the token obtain pair response.
    """

    def validate(self, attrs):
        """
        Validate the token obtain pair serializer data.

        This method adds additional user data to the token obtain pair response.

        Args:
            attrs (dict): The serializer data.

        Returns:
            dict: The validated data.
        """

        data = super().validate(attrs)
        serializer = UserSerializer(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data

class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    This serializer is used to create user accounts.
    """

    password = serializers.CharField(write_only=True, required=True)
    confirmPassword = serializers.CharField(write_only=True, required=True)
    tokens = serializers.SerializerMethodField(read_only=True)
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'name', 
            'email', 
            'password', 
            'confirmPassword', 
            'tokens', 
            'token'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        """
        Validate the registration serializer data.

        This method validates the password and confirmPassword fields.

        Args:
            data (dict): The serializer data.

        Returns:
            dict: The validated data.

        Raises:
            serializers.ValidationError: If passwords do not match.
        """

        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def save(self, validated_data):
        """
        Save the registration serializer data.

        This method creates a new user account, sets the password, generates access and refresh tokens,
        and returns the validated data.

        Args:
            validated_data (dict): The validated serializer data.

        Returns:
            dict: The validated data.
        """

        validated_data.pop('confirmPassword')
        user = User.objects.create(
            name=validated_data['name'],
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        validated_data['id'] = user.id

        refresh_token = RefreshToken.for_user(user)
        access_token = str(refresh_token.access_token)

        validated_data['access_token'] = access_token
        validated_data['refresh_token'] = refresh_token

        return validated_data
