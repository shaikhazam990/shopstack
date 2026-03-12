const OpenAI = require("openai");
const { cache } = require("../config/cache");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Product Smart Assistant — used on PDP page
const askProductAssistant = async (product, question) => {
  const systemPrompt = `You are a helpful shopping assistant for Luminary, a premium e-commerce store.
You are helping a customer understand this product:

Name: ${product.name}
Description: ${product.description}
Price: $${product.price}
Specs: ${product.specs?.map((s) => `${s.label}: ${s.value}`).join(", ") || "N/A"}
Category: ${product.category?.name || ""}

Answer questions about this product concisely and helpfully. If asked about compatibility, warranty, or returns, mention our standard 30-day return policy. Keep answers under 3 sentences.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

// Streaming version for real-time chat
const askProductAssistantStream = async (product, messages, onChunk) => {
  const systemPrompt = `You are a helpful shopping assistant for Luminary. 
Product: ${product.name} — $${product.price}
${product.description}
Specs: ${product.specs?.map((s) => `${s.label}: ${s.value}`).join(", ") || ""}
Keep answers short and friendly.`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    max_tokens: 300,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) onChunk(text);
  }
};

// Generate product embedding for semantic search & recommendations
const generateEmbedding = async (text) => {
  const cacheKey = `embedding:${Buffer.from(text).toString("base64").slice(0, 40)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const embedding = response.data[0].embedding;
  await cache.set(cacheKey, embedding, 86400); // cache 24h
  return embedding;
};

// Cosine similarity for recommendation scoring
const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
};

// AI-powered product description generator (admin tool)
const generateProductDescription = async (productData) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Write a compelling 2-3 sentence product description for:
Name: ${productData.name}
Category: ${productData.category}
Key features: ${productData.features || ""}
Keep it professional, highlight benefits, no hype words.`,
      },
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
};

// "Complete the look" — AI upsell suggestions for cart
const getUpsellSuggestions = async (cartItems, allProducts) => {
  const cartNames = cartItems.map((i) => i.name).join(", ");
  const productList = allProducts.slice(0, 20).map((p) => `${p._id}:${p.name}`).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Cart contains: ${cartNames}
Available products:
${productList}

Suggest 2-3 product IDs that complement what's in the cart. Return ONLY a JSON array of IDs like: ["id1","id2"]`,
      },
    ],
    max_tokens: 100,
    temperature: 0.3,
  });

  try {
    const text = response.choices[0].message.content;
    const match = text.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
};

module.exports = {
  askProductAssistant,
  askProductAssistantStream,
  generateEmbedding,
  cosineSimilarity,
  generateProductDescription,
  getUpsellSuggestions,
};
