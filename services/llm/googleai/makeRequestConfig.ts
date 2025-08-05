import { Message, Tool, googleaiModel, toolChoice } from '../../../types/common.ts';
import processMessages from './processMessages.ts';
import { aiConstants } from '../../../config/constants.ts';

const makeRequestConfig = ({
  model,
  tools,
  stream=true,
  messages,
  systemInstruction,
  thinking=false,
  temperature,
  toolChoice='any',
}: {
  model: googleaiModel,
  tools: Tool[],
  stream: boolean,
  messages: Message[],
  thinking: boolean,
  temperature?: number,
  toolChoice: toolChoice,
  systemInstruction: string,
}): [string, RequestInit] => [
  'https://generativelanguage.googleapis.com/v1beta/models/'+model+':'+(stream?'streamG':'g')+'enerateContent?alt=sse&key='+aiConstants.googleai.apiKey,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: processMessages(messages, !thinking),
      tools: {functionDeclarations: tools},
      systemInstruction: {parts: [{
        text: systemInstruction,
      }]},
      toolConfig: {
        functionCallingConfig: {
          mode: toolChoice.toUpperCase(),
        }
      },
      generationConfig: {
        thinkingConfig: {
          includeThoughts: thinking,
          thinkingBudget: 1024,
        },
        temperature,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }
]

export default makeRequestConfig;
