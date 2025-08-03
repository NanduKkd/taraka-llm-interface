import { googleaiModel, Message, Tool, toolChoice } from '../../types';
import SSEParser from './SSEParser';
import SSEConverterParent from './SSEConverterParent';
import providers from '.providers';

async function llm({
  provider='googleai',
  model,
  messages,
  tool,
  toolChoice='any',
  temperature,
  thinking=false,
  systemInstruction,
}: {
  provider: 'googleai',
  model: googleaiModel,
  messages: Message[],
  tool: Tool[],
  toolChoice: toolChoice,
  thinking: boolean,
  temperature?: number,
  systemInstruction: string,
}): Promise<SSEConverterParent> {
  const res = await fetch(...providers[model].makeRequestConfig({
    model,
    tools,
    messages,
    provider,
    systemInstruction,
    thinking,
    temperature,
  }));
  const converted = new providers[model].SSEConverter(model, {});
  res.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new SSEParser())
    .pipeThrough(converted);
  return converted;
}

export default llm;
