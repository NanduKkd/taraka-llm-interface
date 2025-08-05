import createClient from './utils/supabase.ts';
import { getSession } from './dao/session.ts';
import { listMessages, saveMessage } from './dao/message.ts';
import { ApiError } from './utils/errors.ts';
import llm from './services/llm/index.ts';
import { googleaiModel, UserContentBlock, UserMessage } from './types/common.ts';
import SSECompiler from './utils/SSECompiler.ts';
import { messageToRow, rowToMessage } from './utils/messageRow.ts';

export default async function main(authToken: string, {
  session_id,
  provider,
  model,
  messageContent,
}: {
  session_id: number,
  provider: 'googleai',
  model: googleaiModel,
  messageContent: UserContentBlock
}) {
    if(!session_id)
      throw new ApiError('session_id required', 400);
    const supabase = createClient(authToken);
    const session = await getSession(supabase, session_id);
    if(!session)
      throw new ApiError("Session not found", 404);
    const messages = await listMessages(supabase, session_id);
    const newMessage: UserMessage = {
      content: [messageContent],
      id: crypto.randomUUID(),
      session_id,
      created_at: new Date(),
      role: 'user',
      modelInfo: { model, provider },
    }
    await saveMessage(supabase, messageToRow(newMessage));
    const stream = await llm({
      provider,
      model,
      messages: [...messages.map(rowToMessage), newMessage],
      systemInstruction: "You are a helpful assistant",
      tools: [],
      toolChoice: 'auto',
      thinking: false,
      session_id: session.id
    });
    const sseStream = stream.readable.pipeThrough(new SSECompiler())
    stream.promise.then(async(res) => {
      await saveMessage(supabase, messageToRow(res));
    }).catch(error => {
      console.error(error);
    });
    return sseStream;
}
