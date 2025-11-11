'use server';

/**
 * @fileOverview AI flow to determine products that are frequently bought together.
 *
 * - getFrequentlyBoughtTogether - A function that returns related products.
 * - FrequentlyBoughtTogetherInput - The input type.
 * - FrequentlyBoughtTogetherOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { allItems } from '@/lib/data';

const FrequentlyBoughtTogetherInputSchema = z.object({
  productId: z.string().describe('The ID of the main product.'),
  allItemsJson: z.string().describe('A JSON string of all available items.'),
});
export type FrequentlyBoughtTogetherInput = z.infer<typeof FrequentlyBoughtTogetherInputSchema>;

const RecommendedItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    reason: z.string(),
});

const FrequentlyBoughtTogetherOutputSchema = z.object({
  recommendations: z.array(RecommendedItemSchema).describe('A list of recommended items that are frequently bought with the main product.'),
});
export type FrequentlyBoughtTogetherOutput = z.infer<typeof FrequentlyBoughtTogetherOutputSchema>;


export async function getFrequentlyBoughtTogether(input: FrequentlyBoughtTogetherInput): Promise<FrequentlyBoughtTogetherOutput> {
  return frequentlyBoughtTogetherFlow(input);
}


const prompt = ai.definePrompt({
  name: 'frequentlyBoughtTogetherPrompt',
  input: { schema: FrequentlyBoughtTogetherInputSchema },
  output: { schema: FrequentlyBoughtTogetherOutputSchema },
  prompt: `You are an expert e-commerce recommendation engine.
Based on the provided product (ID: {{{productId}}}) and the entire catalog of items, identify 2-3 other products that are most likely to be bought at the same time.

For each recommendation, provide a short, compelling reason why it's a good combination.

For example, if the main product is a "Smartphone," good recommendations might be a "Phone Case" because it offers protection, or "Wireless Earbuds" because they enhance the listening experience.

Do not recommend other items from the exact same category if better, more complementary accessories exist.

All available items:
{{{allItemsJson}}}
`,
});

const frequentlyBoughtTogetherFlow = ai.defineFlow(
  {
    name: 'frequentlyBoughtTogetherFlow',
    inputSchema: FrequentlyBoughtTogetherInputSchema,
    outputSchema: FrequentlyBoughtTogetherOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
