import OpenAI from 'openai';
import { redis } from '../config/redis';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const promptContent: string = process.env.PROMPT_CONTENT!;

const prompt: ChatMessage = {
  role: 'system',
  content: promptContent,
};

export async function handleNewChat(userMessage: string) {
  const chatId = randomUUID();
  const message = JSON.stringify({ role: 'user', content: userMessage });

  await redis.rpush(`chat:${chatId}`, message);
  await redis.expire(`chat:${chatId}`, 1800);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [prompt, { role: 'user', content: userMessage }],
    max_tokens: 1500,
    temperature: 0.2,
  });

  if (!completion.choices[0]?.message?.content) {
    throw new Error('Invalid response from OpenAI API.');
  }

  const reply = completion.choices[0].message.content || '';
  let parsedReply;
  try {
    parsedReply = JSON.parse(reply);
  } catch {
    throw new Error('Failed to parse OpenAI response.');
  }

  const responseMessage = JSON.stringify({
    role: 'assistant',
    content: parsedReply,
  });
  await redis.rpush(`chat:${chatId}`, responseMessage);
  return { reply: parsedReply, chatId };
}

export async function handleExistingChat(userMessage: string, chatId: string) {
  const length = await redis.llen(`chat:${chatId}`);

  if (!length) {
    throw new Error('Chat has expired');
  }
  if (length >= 20) {
    throw new Error('Chat limit reached');
  }
  const chatLimitReached = length === 18;

  const message = JSON.stringify({ role: 'user', content: userMessage });
  await redis.rpush(`chat:${chatId}`, message);

  const chat: ChatMessage[] = await redis.lrange(`chat:${chatId}`, 0, -1);

  const allMessages = chat.map((message) => {
    return { role: message.role, content: JSON.stringify(message.content) };
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [prompt, ...allMessages],
      max_tokens: 1500,
      temperature: 0.2,
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API.');
    }

    const reply = JSON.parse(completion.choices[0].message.content);
    const responseMessage = JSON.stringify({
      role: 'assistant',
      content: reply,
    });

    await redis.rpush(`chat:${chatId}`, responseMessage);
    return { reply, chatId, chatLimitReached };
  } catch {
    throw new Error('Failed to fetch response from OpenAI.');
  }
}

export async function handleDeleteChat(chatId: string) {
  try {
    await redis.del(`chat:${chatId}`);
    return { message: 'Chat deleted' };
  } catch {
    throw new Error('Error deleting chat');
  }
}
