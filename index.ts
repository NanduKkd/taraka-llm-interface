import createClient from './utils/supabase.ts';
import { getSession } from './dao/session.ts';
import { listMessages } from './dao/message.ts';
import { ApiError } from './utils/errors.ts';

Deno.serve(async(req) => {
  try {
    const authToken = req.headers.get('Authorization');
    if(!authToken)
      throw new ApiError('Unauthorised user', 401);
    const { session_id } = await req.json();
    if(!session_id)
      throw new ApiError('session_id required', 400);
    const supabase = createClient(authToken);
    const session = await getSession(supabase, session_id);
    if(!session)
      throw new ApiError("Session not found", 404);
    const messages = await listMessages(supabase, session_id);
    return new Response('Helllo');
  } catch (error) {
    console.error(error);
    if(error instanceof ApiError)
      return error.createResponse();
    if(error instanceof Error)
      return new Response(error.message, {status: 500});
    return new Response('Something went wrong', {status: 500});
  }
})
