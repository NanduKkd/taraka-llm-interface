import {
  AssistantMessage, modelInfo, AssistantContentBlock,
  ToolContentBlock, ThinkingContentBlock, TextContentBlock,
  messageEvent, tokenUsage
} from '../../types/common.ts';

type MessageMetadata = {
  id: string
  session_id: number
  created_at: Date
  modelInfo: modelInfo
}

type CurrentToolContentBlock = ToolContentBlock & {
  stringArgs: string | undefined,
}
type CurrentContentBlock = CurrentToolContentBlock | ThinkingContentBlock | TextContentBlock;

class SSEConverterParent extends TransformStream<{data: string, event?: string}, messageEvent> {
  contentOutput: AssistantContentBlock[] = [];
  crntContentBlock: CurrentContentBlock | null = null;
  usageTokens: tokenUsage = {};
  message: Partial<AssistantMessage> = {};
  private onFulfilled?: (value: AssistantMessage) => void;
  private onRejected?: (reason: any) => void;
  public readonly promise: Promise<AssistantMessage>;
  private messageMetadata: MessageMetadata;
  private error?: Error;


  constructor(messageMetadata: MessageMetadata) {
    super({
      transform: (chunk, controller) => {
        this._transform(chunk, controller);
      },
      flush: (controller) => {
        this._flush(controller);
      }
    });
    this.promise = new Promise((resolve, reject) => {
      this.onFulfilled = resolve;
      this.onRejected = reject;
    });
    this.messageMetadata = messageMetadata;
  }

  throwError(error: Error, controller?: TransformStreamDefaultController<messageEvent>) {
    if(controller) controller.error(error);
    this.error = error;
  }
  _transform(_: { data: string, event?: string }, controller: TransformStreamDefaultController<messageEvent>) {
    this.throwError(new Error('_transform not implemented'), controller);
  }

  _flush(controller: TransformStreamDefaultController<messageEvent>) {
    if (this.error) {
      this.onRejected?.(this.error);
    } else {
      this.endContentBlock(controller);
      controller.enqueue({ event: 'message_end', data: {} });
      this.onFulfilled?.({
        // ...this.message,
        content: this.contentOutput,
        token_usage: this.usageTokens,
        modelInfo: this.messageMetadata.modelInfo,
        id: this.messageMetadata.id,
        session_id: this.messageMetadata.session_id,
        created_at: this.messageMetadata.created_at,
        role: 'assistant',
      });
    }
  }

  endContentBlock(controller: TransformStreamDefaultController<messageEvent>) {
    if (this.crntContentBlock) {
      let toSaveData: AssistantContentBlock | undefined;
      if(this.crntContentBlock.type==='tool' && this.crntContentBlock.stringArgs) {
        toSaveData = {...this.crntContentBlock, args: JSON.parse(this.crntContentBlock.stringArgs)};
      } else {
        toSaveData = this.crntContentBlock;
      }
      this.contentOutput.push(toSaveData);
      this.crntContentBlock = null;
      controller.enqueue({ event: "content_block_end", data: { type: toSaveData.type } });
    }
  }

  startContentBlock(data: CurrentContentBlock, controller: TransformStreamDefaultController<messageEvent>) {
    const isStart = !this.crntContentBlock;
    this.endContentBlock(controller);
    if (isStart) {
      controller.enqueue({ event: "message_start", data: {messageMetadata: this.messageMetadata} });
    }
    this.crntContentBlock = data;
    controller.enqueue({ event: "content_block_start", data });
  }

  toolContentBlock(toolCallId: string, name: string, controller: TransformStreamDefaultController<messageEvent>) {
    this.startContentBlock({ type: 'tool', toolCallId, name, args: {}, stringArgs: '' }, controller);
  }

  toolContentBlockDelta(partialJson: string, controller: TransformStreamDefaultController<messageEvent>, object?: object) {
    if(this.crntContentBlock?.type!=='tool') {
      return this.throwError(new Error("Tool content block delta but crnt block is "+this.crntContentBlock?.type));
    }
    if (object) {
      this.crntContentBlock.args = object;
    } else {
      this.crntContentBlock.stringArgs += partialJson;
    }
    controller.enqueue({ event: "content_block_delta", data: { type: 'tool', delta: partialJson } });
  }

  textContentBlock(controller: TransformStreamDefaultController<messageEvent>) {
    this.startContentBlock({ type: 'text', text: '' }, controller);
  }

  textContentBlockDelta(txt: string, controller: TransformStreamDefaultController<messageEvent>) {
    if(this.crntContentBlock?.type!=='text') {
      return this.throwError(new Error("Text content block delta but crnt block is "+this.crntContentBlock?.type));
    }
    this.crntContentBlock.text += txt;
    controller.enqueue({ event: "content_block_delta", data: { type: 'text', delta: txt } });
  }

  thinkingContentBlock(controller: TransformStreamDefaultController<messageEvent>) {
    this.startContentBlock({ type: 'thinking', thinking: '', signature: '' }, controller);
  }

  thinkingContentBlockDelta({ thinking, signature }: { thinking?: string, signature?: string }, controller: TransformStreamDefaultController<messageEvent>) {
    if(this.crntContentBlock?.type!=='thinking') {
      return this.throwError(new Error("Thinking content block delta but crnt block is "+this.crntContentBlock?.type));
    }
    if (thinking) {
      this.crntContentBlock.thinking += thinking;
      controller.enqueue({ event: 'content_block_delta', data: { type: 'thinking', delta: thinking } });
    }
    if (signature) {
      this.crntContentBlock.signature += signature;
    }
  }

  updateUsage({ promptTokens, completionTokens, cachedTokens, thinkingTokens }: tokenUsage) {
    this.usageTokens = {
      promptTokens: promptTokens ?? this.usageTokens.promptTokens,
      completionTokens: completionTokens ?? this.usageTokens.completionTokens,
      cachedTokens: cachedTokens ?? this.usageTokens.cachedTokens,
      thinkingTokens: thinkingTokens ?? this.usageTokens.thinkingTokens,
    };
  }

  get crntBlockType() {
    return this.crntContentBlock?.type || null;
  }

  handleError(error: Error, controller: TransformStreamDefaultController<messageEvent>) {
    this.error = error;
    console.error(error);
    controller.enqueue({ event: 'error', data: { message: error.message } });
    controller.terminate();
  }
}

export default SSEConverterParent;
