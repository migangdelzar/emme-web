import type { Message } from '../domain/index.js';
export function MessageList({ messages }: { readonly messages: readonly Message[] }) { return <ol aria-label="Messages">{messages.map((message) => <li key={message.id}>{message.content}</li>)}</ol>; }
export function MessageComposer({ onSend }: { readonly onSend: (content: string) => void }) { return <button type="button" onClick={() => onSend('')}>Send</button>; }
