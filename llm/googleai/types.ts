export type GAIAssistantPart = 
  | { text: string, thought?: boolean }
  | { functionCall: { id: string, name: string, args: object } };

export type GAIUserPart =
  | { text: string }
  | { functionResponse: { id: string, name: string, response: object } }

export type GAIUserMessage = {
  role: 'user',
  parts: UserPart
}

export type GAIAssistantMessage = {
  role: 'assistant',
  parts: AssistantPart
}

export type GAIMessage = AssistantMessage | UserMessage;
