import SSEConverterParent from '../SSEConverterParent';
import { messageEvent } from '../../../types';

class SSEConverter extends SSEConverterParent {
  _transform({ data: str, event }: { data: string, event?: string }, controller: TransformStreamDefaultController<messageEvent>) {
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
      this.handleError(error, controller);
    }
  }
}

export default SSEConverter;
