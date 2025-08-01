class SSEParser extends TransformStream<string, { event?: string; data: string }> {
  private _saved = '';

  constructor() {
    super({
      transform: (chunk, controller) => {
        this._transform(chunk, controller);
      },
    });
  }

  private _transform(chunk: string, controller: TransformStreamDefaultController<{ event?: string; data: string }>) {
    this._saved += chunk;
    const reg = /(event: (?<event>.+)\n)?data: (?<data>.+)\r?\n\r?\n/g;
    let res, nextStart: number | null = null;
    while ((res = reg.exec(this._saved))) {
      nextStart = reg.lastIndex;
      controller.enqueue({ event: res.groups?.event, data: res.groups?.data ?? "" });
    }
    if (nextStart) {
      this._saved = this._saved.substring(nextStart);
    }
  }
}

export default SSEParser;
