import type { Conversation, Message } from '../domain/index.js';
export interface ConversationRepository { history(id: string): Promise<Conversation>; }
export interface MessageTransport { send(message: Message): Promise<Message>; }
export interface NotificationPort { sendReminder(conversationId: string): Promise<void>; }
export interface AiAssistantPort { reply(conversation: Conversation, message: Message): Promise<Message>; }
