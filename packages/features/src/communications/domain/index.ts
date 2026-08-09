export type MessageRole = 'user' | 'assistant' | 'system';
export type CommunicationChannel = 'web' | 'whatsapp' | 'email';
export interface Attachment { readonly kind: 'image' | 'audio' | 'file'; readonly url: string; readonly contentType: string; }
export interface Message { readonly id: string; readonly conversationId: string; readonly role: MessageRole; readonly channel: CommunicationChannel; readonly content: string; readonly createdAt: string; readonly attachments?: readonly Attachment[]; }
export interface Conversation { readonly id: string; readonly tenantId: string; readonly unreadCount: number; readonly messages: readonly Message[]; }
export class InvalidMessageError extends Error { readonly code = 'INVALID_MESSAGE'; }
export function createMessage(value: Message): Message { if (!value.content.trim() && !value.attachments?.length) throw new InvalidMessageError('Message content is required'); if (value.content.length > 4000) throw new InvalidMessageError('Message content is too long'); return { ...value }; }
export function orderMessages(messages: readonly Message[]): Message[] { return [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)); }
