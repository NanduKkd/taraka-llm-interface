import SSEConverterParent from '../SSEConverterParent.ts';
import { messageEvent } from '../../../types/common.ts';

class SSEConverter extends SSEConverterParent {
  override _transform({ data: str }: { data: string, event?: string }, controller: TransformStreamDefaultController<messageEvent>) {
    try {
      const json = JSON.parse(str);
      const cand = json.candidates[0];
      if (cand.index !== 0) {
        return;
      }
      for (const part of cand.content.parts) {
        if (part.thought) {
          if (this.crntBlockType !== 'thinking') {
            this.thinkingContentBlock(controller);
          }
          this.thinkingContentBlockDelta({ thinking: part.text }, controller);
        } else if (part.text) {
          if (this.crntBlockType !== 'text') {
            this.textContentBlock(controller);
          }
          this.textContentBlockDelta(part.text, controller);
        } else if (part.functionCall) {
          this.toolContentBlock(crypto.randomUUID(), part.functionCall.name, controller);
          this.toolContentBlockDelta(JSON.stringify(part.functionCall.args), controller, part.functionCall.args);
        }
        this.updateUsage({
          promptTokens: json.usageMetadata.promptTokenCount,
          completionTokens: json.usageMetadata.candidatesTokenCount,
          thinkingTokens: json.usageMetadata.thoughtsTokenCount,
          cachedTokens: json.usageMetadata.cachedContentTokenCount || 0,
        });
      }
    } catch (error) {
      if(error instanceof Error)
        this.handleError(error, controller);
      else
        this.handleError(new Error('Something went wrong'), controller);
      return;
    }
  }
}

export default SSEConverter;
