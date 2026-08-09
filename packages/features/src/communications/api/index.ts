import { asRecord, stringField, optionalStringField } from '@emme/api';
import type { CommunicationChannel, Message, MessageRole } from '../domain/index.js';

function parseRole(value: string): MessageRole {
  if (value === 'user' || value === 'assistant' || value === 'system') return value;
  throw new Error(`Invalid message role: ${value}`);
}

function parseChannel(value: string): CommunicationChannel {
  if (value === 'web' || value === 'whatsapp' || value === 'email') return value;
  throw new Error(`Invalid message channel: ${value}`);
}

export function mapMessagePayload(payload: unknown): Message {
  const raw = asRecord(payload, 'message');
  const attachmentUrl = optionalStringField(raw, 'attachmentUrl');
  return {
    id: stringField(raw, 'id', 'message'),
    conversationId: stringField(raw, 'conversationId', 'message'),
    role: parseRole(stringField(raw, 'role', 'message')),
    channel: parseChannel(stringField(raw, 'channel', 'message')),
    content: stringField(raw, 'content', 'message'),
    createdAt: stringField(raw, 'createdAt', 'message'),
    ...(attachmentUrl
      ? { attachments: [{ kind: 'file', url: attachmentUrl, contentType: 'application/octet-stream' }] }
      : {}),
  };
}
