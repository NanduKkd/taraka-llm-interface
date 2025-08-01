import { Message, model, contentBlock, messageEvent } from '../types';

interface ConvertedMessage extends Message {
  messageMetadata: any
}

interface currentContentBlock extends contentBlock {
  args: string | object
}

class SSEConverterParent extends TransformStream<string, messageEvent> {
  contentOutput: contentBlock[] = [];
  crntContentBlock?: currentContentBlock = null;
  usageTokens = {};
  message: Partial<ConvertedMessage> = {};
  private onFulfilled?: (value: ConvertedMessage) => void;
  private onRejected?: (reason: any) => void;
  public readonly promise: Promise<ConvertedMessage>;


  constructor(model: model, messageMetadata: any) {
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
    this.message.messageMetadata = messageMetadata;
    this.model = model;
  }

  _transform(chunk: string, controller: TransformStreamDefaultController<messageEvent>) {
    controller.error(new Error('_transform not implemented'));
  }

  _flush(controller: TransformStreamDefaultController<messageEvent>) {
    if (this.error) {
      this.onRejected?.(this.error);
    } else {
      this.endContentBlock(controller);
      controller.enqueue({ event: 'message_end', data: {} });
      this.onFulfilled?.({
        ...this.message,
        contentOutput: this.contentOutput,
        usageTokens: this.usageTokens,
        model: this.model,
      });
    }
  }

  endContentBlock(controller: TransformStreamDefaultController<messageEvent>) {
    if (this.crntContentBlock) {
      const toSaveData = { ...this.crntContentBlock };
      if (toSaveData.type === 'tool' && typeof toSaveData.args === 'string') {
        toSaveData.args = JSON.parse(toSaveData.args);
      }
      this.contentOutput.push(toSaveData);
      this.crntContentBlock = null;
      controller.enqueue({ event: "content_block_end", data: { type: toSaveData.type } });
    }
  }

  startContentBlock(data: contentBlock, controller: TransformStreamDefaultController<messageEvent>) {
    let isStart = !this.crntContentBlock;
    this.endContentBlock(controller);
    if (isStart) {
      controller.enqueue({ event: "message_start", data: this.message });
    }
    this.crntContentBlock = data;
    controller.enqueue({ event: "content_block_start", data });
  }

  toolContentBlock(toolCallId: string, name: string, controller: TransformStreamDefaultController<messageEvent>) {
    this.startContentBlock({ type: 'tool', toolCallId, name, args: '' }, controller);
  }

  toolContentBlockDelta(partialJson: string, controller: TransformStreamDefaultController<messageEvent>, object?: object) {
    if (object) {
      this.crntContentBlock.args = object;
    } else {
      this.crntContentBlock.args += partialJson;
    }
    controller.enqueue({ event: "content_block_delta", data: { type: 'tool', delta: partialJson } });
  }

  textContentBlock(controller: TransformStreamDefaultController<messageEvent>) {
    this.startContentBlock({ type: 'text', text: '' }, controller);
  }

  textContentBlockDelta(txt: string, controller: TransformStreamDefaultController<messageEvent>) {
    this.crntContentBlock.text += txt;
    controller.enqueue({ event: "content_block_delta", data: { type: 'text', delta: txt } });
  }

  thinkingContentBlock(controller: TransformStreamDefaultController<messageEvent>) {
    this.startContentBlock({ type: 'thinking', thinking: '', signature: '' }, controller);
  }

  thinkingContentBlockDelta({ thinking, signature }: { thinking?: string, signature?: string }, controller: TransformStreamDefaultController<messageEvent>) {
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
    controller.enqueue({ event: 'error', data: { message: error.message, type: error.type } });
    controller.terminate();
  }
}

export default SSEConverterParent;
