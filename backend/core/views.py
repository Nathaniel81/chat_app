from django.conf import settings
from django.db.models import Count
from rest_framework import generics, permissions, status, exceptions
from rest_framework.exceptions import PermissionDenied
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt import tokens
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404

from .models import User, ChatRoom, Message, Conversation
from .serializers import (
    MyTokenObtainPairSerializer,
    UserSerializer, 
    ChatRoomSerializer, 
    MessageSerializer,
    ConversationSerializer,
    RegistrationSerializer
    )

class LoginRateThrottle(AnonRateThrottle):
    rate = '5/hour'

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain pair view for setting cookies on successful token retrieval.
    """

    serializer_class = MyTokenObtainPairSerializer
    # throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        """
        Handle POST request for token generation.

        This method overrides the default post method of TokenObtainPairView to set cookies
        for access and refresh tokens if the request is successful.

        Args:
            request (HttpRequest): The request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: The HTTP response.
        """

        # Call the super method to perform default token generation
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.pop('access', None)
            refresh_token = response.data.pop('refresh', None)
            # Set httponly flag for access and refresh tokens
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=refresh_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
        return response

class RegistrationView(generics.CreateAPIView):
    """
    Custom registration view for creating user accounts and setting authentication cookies.
    """

    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            if serializer.is_valid(raise_exception=True):
                serializedData = serializer.save(validated_data=serializer.validated_data)
                response = Response({
                    'id': serializedData['id'],
                    'username': serializedData['username'],
                    'email': serializedData['email'],
                    'profile_picture': serializedData['profile_picture'],
                }, status=status.HTTP_201_CREATED)
                access_token = serializedData.get('access_token')
                refresh_token = serializedData.get('refresh_token')
                response.set_cookie(
                        key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                        value=access_token,
                        expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                response.set_cookie(
                       key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                       value=refresh_token,
                       expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                       secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                       httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                       samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                return response
        except ValidationError as e:
            if 'email' in e.detail and 'already exists' in str(e.detail['email']):
                return Response(
                    {"error": "A user with this email already exists."},
                    status=status.HTTP_409_CONFLICT
                )
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            if not refresh_token:
                return Response({'error': 'Refresh token not found in cookies'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = tokens.RefreshToken(refresh_token)
            token.blacklist()

            response = Response({'detail': 'Logged out successfully'}, status=status.HTTP_200_OK)
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            return response
        except tokens.TokenError as e:
            response = Response({'detail': 'Token error occurred'}, status=status.HTTP_400_BAD_REQUEST)
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])        
            return response
        except Exception as e:
            print(f"Exception: {e}")
            raise exceptions.ParseError("Invalid token")

class RefreshTokenView(APIView):
    """
    Custom view for refreshing access tokens.
    """

    def post(self, request):
        """
        Handle POST request for refreshing access tokens.

        This method retrieves the refresh token from cookies, generates new access and
        refresh tokens, sets cookies with the new tokens, and returns a response.

        Args:
            request (HttpRequest): The request object.

        Returns:
            Response: The HTTP response.
        """
        # Retrieve refresh token from cookies
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        # Check if refresh token is missing
        if not refresh_token:
            return Response({'error': 'Refresh token is missing'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Instantiate a RefreshToken object
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            new_refresh_token = str(token)

            response = Response()
            # Set httponly flag for access and refresh tokens in cookies
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=new_access_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=new_refresh_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user is not None:
            return User.objects.exclude(id=user.id)
        return User.objects.all()

class ChatRoomView(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        room_name = self.kwargs['room_name']
        try:
            chat_room = ChatRoom.objects.get(name=room_name)
        except ChatRoom.DoesNotExist:
            # Return an empty queryset if the chat room doesn't exist
            return Message.objects.none()

        return Message.objects.filter(chat_room=chat_room).order_by('created_at')
