import main from './main.ts';
import { ApiError } from './utils/errors.ts';

Deno.serve(async(req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if(!authHeader)
      throw new ApiError('Unauthorised user', 401);
    const authToken = authHeader.split(' ')[1];
    return new Response(await main(authToken, await req.json()), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  } catch (error) {
    console.error(error);
    if(error instanceof ApiError)
      return error.createResponse();
    if(error instanceof Error)
      return new Response(error.message, {status: 500});
    return new Response('Something went wrong', {status: 500});
  }
})
