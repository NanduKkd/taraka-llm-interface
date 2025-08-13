import main from './main.ts';
import codeReplace from './codeReplace.ts';
import { ApiError } from './utils/errors.ts';

Deno.serve(async(req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if(!authHeader)
      throw new ApiError('Unauthorised user', 401);
    const authToken = authHeader.split(' ')[1];
    const body = await req.json();
    const { type, ...otherFields } = body;

    if (type === 'chat') {
      return new Response(await main(authToken, otherFields), {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });
    } else if (type === 'code_replace') {
      const result = await codeReplace(authToken, otherFields);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new ApiError('Invalid request type', 400);
    }
  } catch (error) {
    console.error(error);
    if(error instanceof ApiError)
      return error.createResponse();
    if(error instanceof Error)
      return new Response(error.message, {status: 500});
    return new Response('Something went wrong', {status: 500});
  }
})
