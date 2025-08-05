import { googleaiModel, Message, Tool, toolChoice } from '../../types/common.ts';
import SSEParser from './SSEParser.ts';
import SSEConverterParent from './SSEConverterParent.ts';
import providers from './providers.ts';
import { ApiError } from '../../utils/errors.ts';

async function llm({
  provider='googleai',
  model,
  messages,
  tools,
  toolChoice='any',
  temperature,
  thinking=false,
  systemInstruction,
  session_id,
}: {
  provider: 'googleai',
  model: googleaiModel,
  messages: Message[],
  tools: Tool[],
  toolChoice: toolChoice,
  thinking: boolean,
  temperature?: number,
  systemInstruction: string,
  session_id: number,
}): Promise<SSEConverterParent> {
  const providerObj = providers[provider];
  const res = await fetch(...providerObj.makeRequestConfig({
    model,
    tools,
    messages,
    systemInstruction,
    thinking,
    temperature,
    toolChoice,
    stream: true,
  }));
  const converted = new providerObj.SSEConverter({
    id: crypto.randomUUID(), session_id,
    created_at: new Date(),
    modelInfo: {
      provider,
      model,
    }
  });
  if(!res.body || res.headers.get('Content-Type')!=='text/event-stream')
    throw new ApiError("Invalid LLM Response", 500, {status: res.status, contentType: res.headers.get('Content-Type')})
  res.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new SSEParser())
    .pipeThrough(converted);
  return converted;
}

export default llm;
