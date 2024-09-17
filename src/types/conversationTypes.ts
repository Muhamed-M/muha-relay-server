export interface CreateConversationPayload {
  name?: string;
  isGroup: boolean;
  usersIds: number[];
}

export interface EditConversationPayload {
  conversationId: number;
  name?: string;
  usersIds?: number[];
}
