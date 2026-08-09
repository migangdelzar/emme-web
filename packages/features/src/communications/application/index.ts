export type { ConversationRepository, MessageTransport, NotificationPort, AiAssistantPort } from './ports.js';
import type { Message } from '../domain/index.js';
import type { MessageTransport } from './ports.js';
export function sendMessage(transport: MessageTransport) { return (message: Message) => transport.send(message); }
