export interface ConversationUser {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant1: ConversationUser;
  participant2_id: string;
  participant2: ConversationUser;
  created_at: string;
  last_message_at: string;
}

export interface Messages {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: ConversationUser;
  message: string;
  created_at: string;
  read_at: string | null;
}
