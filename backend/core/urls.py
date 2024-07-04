from django.urls import path
from . import views
    
urlpatterns = [
    path('user/list/', views.UserListView.as_view(), name='users_list'),
    path('user/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('user/logout/', views.LogoutView.as_view(), name='logout'),
    path('user/refresh/', views.RefreshTokenView.as_view(), name='token_refresh'),

    path('chatrooms/', views.ChatRoomView.as_view(), name='chat_room'),
    path('messages/<str:room_name>/', views.MessageListView.as_view(), name='message_list'),

]
