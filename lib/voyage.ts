import { VoyageAIClient } from 'voyageai'

// Singleton Voyage AI client
const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY ?? '',
})

// voyage-3-lite: 1024 dimensions, lowest cost, sufficient for semantic search
const EMBEDDING_MODEL = 'voyage-3-lite'

/**
 * Embed a single string using Voyage AI voyage-3-lite.
 * Returns a 1024-dimensional float array.
 */
export async function embedText(text: string): Promise<number[]> {
  const response = await voyage.embed({
    input: text,
    model: EMBEDDING_MODEL,
  })

  const embedding = response.data?.[0]?.embedding
  if (!embedding) throw new Error('Voyage AI returned no embedding')

  return embedding as number[]
}
