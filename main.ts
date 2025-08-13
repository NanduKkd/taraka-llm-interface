import createClient from './utils/supabase.ts';
import { getSession } from './dao/session.ts';
import { listMessages, saveMessage } from './dao/message.ts';
import { ApiError } from './utils/errors.ts';
import llm from './services/llm/index.ts';
import { googleaiModel, UserContentBlock, ToolResultContentBlock, UserMessage, ToolResponse } from './types/common.ts';
import SSECompiler from './utils/SSECompiler.ts';
import { messageToRow, rowToMessage } from './utils/messageRow.ts';
import tools from './config/schema.json' with { type: 'json' };

export default function main(authToken: string, obj: { id: string, session_id: number, provider: 'googleai', model: googleaiModel, messageContent: UserContentBlock[] | ToolResultContentBlock[] }): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>
export default function main(authToken: string, obj: { session_id: number, provider: 'googleai', model: googleaiModel, messageContent: UserContentBlock[] | ToolResultContentBlock[], isAnynymous: true }): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>
export default async function main(authToken: string, {
  id,
  session_id,
  provider,
  model,
  messageContent,
  isAnonymous,
}: {
  id?: string,
  session_id: number,
  provider: 'googleai',
  model: googleaiModel,
  messageContent: UserContentBlock[] | ToolResultContentBlock[],
  isAnonymous?: boolean,
}): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>> {
    if(!session_id)
      throw new ApiError('session_id required', 400);
    const supabase = createClient(authToken);
    const session = await getSession(supabase, session_id);
    if(!session)
      throw new ApiError("Session not found", 404);
    const messages = isAnonymous ? [] : await listMessages(supabase, session_id);
    const role = messageContent[0]?.type!=='tool_result' ? 'user' : 'tool';
    const newMessage: UserMessage | ToolResponse = {
      content: role==='user' ? messageContent.filter(i => i.type==='text') : messageContent.filter(i => i.type==='tool_result'),
      id: id || crypto.randomUUID(),
      session_id,
      created_at: new Date(),
      role,
      modelInfo: { model, provider },
    } as UserMessage | ToolResponse;
    if(!isAnonymous)
      await saveMessage(supabase, messageToRow(newMessage));
    const stream = await llm({
      provider,
      model,
      messages: [...messages.map(rowToMessage), newMessage],
      systemInstruction: "You are a powerful code implementer named Taraka. Taraka is a Sanskrit word. Use the tools and do your thing. The user uses os '"+session.os+"' and current workspace is at path '"+session.path+"'. Now get to work",
      tools: tools as any,
      toolChoice: 'auto',
      thinking: false,
      session_id: session.id
    });
    const sseStream = stream.readable.pipeThrough(new SSECompiler())
    stream.promise.then(async(res) => {
      if(!isAnonymous)
        await saveMessage(supabase, messageToRow(res));
    }).catch(error => {
      console.error(error);
    });
    return sseStream;
}
