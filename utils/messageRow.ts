import { Tables, Database } from '../types/supabase.ts';
import { Message } from '../types/common.ts';

export function rowToMessage (row: Tables<'messages'>): Message {
  const message: Message = {
    id: row.id,
    session_id: row.session_id,
    modelInfo: { model: row.model, provider: row.provider },
    created_at: new Date(row.created_at),
    role: row.role,
    content: row.content,
    token_usage: row.token_usage,
  } as Message;
  return message;
}

type MessageInsert = Database['public']['Tables']['messages']['Insert']

export function messageToRow (message: Message): MessageInsert {
  return {
    id: message.id,
    session_id: message.session_id,
    model: message.modelInfo.model,
    provider: message.modelInfo.provider,
    created_at: message.created_at.toISOString(),
    role: message.role,
    content: message.content,
    token_usage: 'token_usage' in message ? message.token_usage : null,
  } as MessageInsert;
}
