import main from './main.ts';
import { ApiError } from './utils/errors.ts';

Deno.serve(async(req) => {
  try {
    const authToken = req.headers.get('Authorization');
    if(!authToken)
      throw new ApiError('Unauthorised user', 401);
    return new Response(await run(authToken, await req.json()), {
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
