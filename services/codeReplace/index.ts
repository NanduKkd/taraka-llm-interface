import llm from '../llm/index.ts';
import { TextContentBlock } from '../../types/common.ts';

const codeReplace = async({ actualCode, newCode, filePath }: { actualCode: string, newCode: string, filePath: string }): Promise<string> => {
  const res = await llm({
    provider: 'googleai',
    model: 'gemini-2.5-flash-lite',
    messages: [{
      content: [{type: 'text', text: '<existingCode path="'+filePath+'">\n'+actualCode+'\n</existingCode>\n<codeToReplace>\n'+newCode+'\n</codeToReplace><note>The "// ... existing code ..." if any in the codeToReplace denotes the parts that already exist '}],
      id: 'dfdf',
      session_id: 23,
      created_at: new Date(),
      role: 'user',
      modelInfo: {provider: 'googleai', model: 'gemini-2.5-flash-lite'},
    }],
    tools: [],
    toolChoice: 'auto',
    thinking: false,
    session_id: 23,
    systemInstruction: "You are a code editing assistant that applies edits to code. Your task is to take the existing code and an edit description along with the code change, and apply the changes to produce the updated code. Only return the complete updated code without any explanations or markdown formatting.",
    responseSchema: {type: 'object', properties: {
      updatedFileCode: {
        type: 'string',
        description: 'The code that is to be written to the file',
      },
    }, required: ['updatedFileCode']}
  });
  for await (const _ of res.readable) {}
  const out = await res.promise;
  return JSON.parse((out.content[0] as TextContentBlock).text).updatedFileCode;
}

export default codeReplace;
