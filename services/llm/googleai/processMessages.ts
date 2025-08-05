import { Message } from '../../../types/common.ts';
import { GAIMessage, GAIAssistantPart, GAIUserPart } from './types.ts';

const processMessages = (messages: Message[], removeThinking: boolean) => {
  const processedMessages: GAIMessage[] = [];
  for(const message of messages) {
    if(message.role==='assistant') {
      const content: GAIAssistantPart[] = [];
      for(const item of message.content) {
        if(item.type==='tool') {
          content.push({
            functionCall: {
              id: item.toolCallId,
              name: item.name,
              args: item.args,
            },
          });
        } else if(item.type==='text') {
          content.push({text: item.text})
        } else if(item.type==='thinking') {
          content.push({
            thought: !removeThinking,
            text: item.thinking,
          })
        }
      }
      processedMessages.push({role: 'model', parts: content});
    } else if(message.role === 'tool') {
      const content: GAIUserPart[] = [];
      for(const item of message.content) {
        content.push({
          functionResponse: {
            id: item.toolCallId,
            name: item.toolCallName,
            response: item.toolCallResponse
          }
        });
      }
      processedMessages.push({role: 'user', parts: content});
    } else if(message.role==='user') {
      const content: GAIUserPart[] = message.content.map(item => ({
        text: item.text,
      }))
      processedMessages.push({role: 'user', parts: content});
    }
  }
  return processedMessages;
}

export default processMessages;
