export interface IUser {
  id: number;
  username: string;
  email: string;
  image?: string;
  is_online: boolean;
}
  
export interface IMessage {
  id: number;
  user: IUser;
  text: string;
  message_type: string;
  seen_by: number[] | undefined;
  created_at: string;
}
  
export interface Conversation {
  id: number;
  admin?: IUser;
  chat_room: string;
  participants: IUser[];
  is_group: boolean;
  group_image: string;
  group_name: string;
  created_at: string;
  last_message?: IMessage;
  messages: IMessage[];
}
