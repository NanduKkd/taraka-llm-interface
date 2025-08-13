import { Message, Tool, googleaiModel, toolChoice, responseSchema } from '../../../types/common.ts';
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
  responseSchema,
}: {
  model: googleaiModel,
  tools: Tool[],
  stream: boolean,
  messages: Message[],
  thinking: boolean,
  temperature?: number,
  toolChoice: toolChoice,
  systemInstruction: string,
  responseSchema?: responseSchema,
}): [string, RequestInit] => {
  const requestBody: Record<string, any> = {
    contents: processMessages(messages, !thinking),
    tools: {functionDeclarations: tools.map(i => ({
      name: i.name,
      description: i.description,
      parametersJsonSchema: i.parameters
    }))},
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
  };

  if (responseSchema) {
    requestBody.generationConfig.responseMimeType = "application/json";
    requestBody.generationConfig.responseSchema = responseSchema;
  }

  return [
    'https://generativelanguage.googleapis.com/v1beta/models/'+model+':'+(stream?'streamG':'g')+'enerateContent?alt=sse&key='+aiConstants.googleai.apiKey,
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ];
}

export default makeRequestConfig;
