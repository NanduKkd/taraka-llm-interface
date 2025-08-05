export type GAIAssistantPart = 
  | { text: string, thought?: boolean }
  | { functionCall: { id: string, name: string, args: object } };

export type GAIUserPart =
  | { text: string }
  | { functionResponse: { id: string, name: string, response: object } }

export type GAIUserMessage = {
  role: 'user',
  parts: GAIUserPart[]
}

export type GAIAssistantMessage = {
  role: 'model',
  parts: GAIAssistantPart[]
}

export type GAIMessage = GAIAssistantMessage | GAIUserMessage;
