import { Message } from '../../../types';
import { GAIMessage, GAIAssistantPart } from './types';

const processMessages = (messages: Message[]) => {
  const processedMessages: GAIMessage[] = [];
  for(const message of messages) {
    if(message.role==='assistant') {
      let content: GAIAssistantPart[] = [];
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
      for(const item of message.contentOutput) {
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
      let content: GAIUserPart[] = message.content.map(i => ({
        type: item.text,
      }))
      processedMessages.push({role: 'user', parts: content});
    }
  }
  return processedMessages;
}

export default processMessages;
