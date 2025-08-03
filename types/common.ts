export interface Session {
  id: number,
  machine_id: string,
  os: string,
  path: string,
  title?: string
}

type ValueSchema = {
  type: 'string' | 'integer' | 'boolean',
  description: string
}

type ObjectSchema = {
  type: 'object',
  properties: Record<string, ValueSchema | ObjectSchema>,
  required: string[],
}

export interface Tool {
  name: string,
  description: string,
  parameters: ObjectSchema,
}

export type toolChoice = 'any' | 'auto';

export type openaiModel = 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano';
export type googleaiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite';
export type anthropicModel = 'claude-sonnet-4' | 'claude-4-haiku';
export type model = openaiModel | googleaiModel | anthropicModel;

export type tokenUsage = {
  promptTokens?: number,
  cachedTokens?: number,
  completionTokens?: number,
  thinkingTokens?: number,
}

export type ToolContentBlock = {
  type: 'tool',
  toolCallId: string,
  args: object,
  name: string
}
export type ToolResultContentBlock = {
  type: 'tool_result',
  toolCallId: string,
  toolCallResponse: {
    status: 'error' | 'success' | 'stopped',
    data: any
  }
}
export type ThinkingContentBlock = {
  type: 'thinking',
  thinking: string,
  signature?: string
}
export type TextContentBlock = {
  type: 'text',
  text: string
}
export type UserContentBlock = TextContentBlock;
export type AssistantContentBlock = ThinkingContentBlock | TextContentBlock | ToolContentBlock;
export type ContentBlock = UserContentBlock | AssistantContentBlock | ToolResultContentBlock;

export interface AssistantMessageWithoutModel {
  id: number,
  session_id: number,
  created_at: Date,
  content: AssistantContentBlock[],
  token_usage: tokenUsage,
  role: 'assistant'
}
export interface UserMessageWithoutModel {
  id: number,
  session_id: number,
  created_at: Date,
  content: UserContentBlock[],
  role: 'user'
}
export interface ToolResponseWithoutModel {
  id: number,
  session_id: number,
  created_at: Date,
  content: ToolResultContentBlock[],
  role: 'tool'
}
export type MessageWithoutModel = UserMessageWithoutModel | AssistantMessageWithoutModel | ToolResponseWithoutModel;

type AnthropicMessage = MessageWithoutModel & {
  model: anthropicModel,
  provider: 'anthropic'
}
type GoogleaiMessage = MessageWithoutModel & {
  model: googleaiModel,
  provider: 'googleai'
}
type OpenaiMessage = MessageWithoutModel & {
  model: openaiModel,
  provider: 'openai'
}
export type Message = AnthropicMessage | GoogleaiMessage | OpenaiMessage;


type startMessageEvent = {
  event: 'message_start'
  data: {messageMetadata: any},
}
type startContentBlockEvent = {
  event: 'content_block_start',
  data: ContentBlock,
}
type contentBlockDeltaTypes = 'thinking' | 'text' | 'tool' | 'signature';
type deltaContentBlockEvent = {
  event: 'content_block_delta',
  data: { type: contentBlockDeltaTypes, delta: string },
}
type endContentBlockEvent = {
  event: 'content_block_end',
  data: { type: contentBlockDeltaTypes },
}
type endMessageEvent = {
  event: 'message_end',
  data: {},
}
export type messageEvent = startMessageEvent
  | startContentBlockEvent
  | deltaContentBlockEvent
  | endContentBlockEvent
  | endMessageEvent;
