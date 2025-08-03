export class ApiError extends Error {
  statusCode: number;
  data: object | null;
  constructor (message: string, statusCode: number = 500, data: object | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
  createResponse() {
    return new Response(JSON.stringify({
      status: this.statusCode<500?'failed':'error',
      message: this.message,
      stack: this.stack,
      data: this.data
    }), {
      status: this.statusCode
    });
  }
}
