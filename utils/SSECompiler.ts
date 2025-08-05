import { messageEvent } from '../types/common.ts';

export default class SSECompiler extends TransformStream<messageEvent, Uint8Array> {
  constructor() {
    const enc = new TextEncoder();
    super({
      transform: (chunk, controller) => {
        controller.enqueue(enc.encode('event: '+chunk.event+'\ndata: '+JSON.stringify(chunk.data)+'\n\n'));
      },
    });
  }
}
