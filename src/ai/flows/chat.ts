'use server';

/**
 * @fileOverview A conversational AI chatbot for the Learn & Shop platform.
 *
 * - chat - A function that handles the conversational chat logic.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { allItems } from '@/lib/data';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  itemContext: z
    .string()
    .describe('A JSON string of all available products and courses.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const systemPrompt = `You are a friendly and helpful customer support assistant for an e-commerce and online course platform called "Learn & Shop".

Your goal is to answer user questions about the products and courses available.

Use the provided JSON data of available items to answer questions. Be concise and helpful. If you don't know the answer or a product doesn't exist, say so politely.

Available items:
{{{itemContext}}}`;

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: input.history,
      model: 'googleai/gemini-2.5-flash',
      config: {
        system: systemPrompt,
        template: {
          input: {
            itemContext: input.itemContext,
          },
        },
      },
    });

    return {
      response: output.message.content,
    };
  }
);
