// prisma/seed.ts
import { 
  PrismaClient, 
  ProviderName, 
  ProviderStatus, 
  Modality 
} from '../src/generated/prisma/client'; // Note: Adjust if your path is /prisma/client
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as crypto from 'crypto';

// 1. Initialize standard pg connection pool
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Wrap it in the Prisma PG Adapter
const adapter = new PrismaPg(pool);

// 3. Initialize PrismaClient by passing the required adapter options
const prisma = new PrismaClient({ adapter });

/**
 * Helper to simulate AES-256-GCM encryption for API keys.
 * In production, use a static 32-byte secret from environment variables.
 */
function encryptDummyKey(rawKey: string) {
  const encryptionKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  
  let encrypted = cipher.update(rawKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedKey: encrypted,
    keyIv: iv.toString('hex'),
    keyTag: authTag,
  };
}

async function main() {
  console.log('Seeding model providers and pricing...');

  // =============================================================
  // 1. OPENAI 
  // =============================================================
  const openAiDummyKey = encryptDummyKey('sk-proj-dummy-openai-key');
  const openai = await prisma.provider.upsert({
    where: { name: ProviderName.OPENAI },
    update: {},
    create: {
      name: ProviderName.OPENAI,
      displayName: 'OpenAI',
      ...openAiDummyKey,
      baseUrl: 'https://api.openai.com/v1',
      status: ProviderStatus.ACTIVE,
      priority: 1,
      supportedModalities: [Modality.TEXT, Modality.IMAGE, Modality.AUDIO, Modality.EMBEDDING],
    }
  });

  const openaiModels = [
    { modelId: 'gpt-6-astra', displayName: 'GPT-6 Astra', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.010, outputPricePer1k: 0.050, contextWindow: 1050000, maxOutputTokens: 128000 },
    { modelId: 'gpt-5.6-sol', displayName: 'GPT-5.6 Sol', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.005, outputPricePer1k: 0.030, contextWindow: 1050000, maxOutputTokens: 128000 },
    { modelId: 'gpt-5.6-terra', displayName: 'GPT-5.6 Terra', modality: Modality.TEXT, isDefault: true, inputPricePer1k: 0.002, outputPricePer1k: 0.012, contextWindow: 1050000, maxOutputTokens: 128000 },
    { modelId: 'gpt-5.6-luna', displayName: 'GPT-5.6 Luna', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0002, outputPricePer1k: 0.0012, contextWindow: 1050000, maxOutputTokens: 128000 },
    { modelId: 'gpt-4o', displayName: 'GPT-4o', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0025, outputPricePer1k: 0.0100, contextWindow: 128000, maxOutputTokens: 16384 },
    { modelId: 'gpt-4o-mini', displayName: 'GPT-4o Mini', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00015, outputPricePer1k: 0.0006, contextWindow: 128000, maxOutputTokens: 16384 },
    { modelId: 'o3', displayName: 'o3 (Reasoning)', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.002, outputPricePer1k: 0.008, contextWindow: 128000, maxOutputTokens: 16384 },
    { modelId: 'o4-mini', displayName: 'o4-mini (Reasoning)', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0011, outputPricePer1k: 0.0044, contextWindow: 128000, maxOutputTokens: 16384 },
    { modelId: 'gpt-5.6-cyber', displayName: 'GPT-5.6 Cyber', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-daybreak-red-latest', displayName: 'Daybreak Red', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-daybreak-blue-latest', displayName: 'Daybreak Blue', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-image-2', displayName: 'GPT-Image-2', modality: Modality.IMAGE, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-realtime-2.1', displayName: 'GPT-Realtime-2.1', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-realtime-translate', displayName: 'GPT-Realtime-Translate', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-4o-mini-tts', displayName: 'GPT-4o Mini TTS', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-transcribe', displayName: 'GPT-Transcribe', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gpt-live-transcribe', displayName: 'GPT-Live-Transcribe', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'text-embedding-3-small', displayName: 'Text Embedding 3 Small', modality: Modality.EMBEDDING, isDefault: false, inputPricePer1k: 0.00002, outputPricePer1k: 0.00, contextWindow: 8191, maxOutputTokens: null },
  ];

  for (const m of openaiModels) {
    await prisma.providerModel.upsert({
      where: { modelId: m.modelId },
      update: m,
      create: { ...m, providerId: openai.id }
    });
  }

  // =============================================================
  // 2. ANTHROPIC 
  // =============================================================
  const anthropicDummyKey = encryptDummyKey('sk-ant-dummy-anthropic-key');
  const anthropic = await prisma.provider.upsert({
    where: { name: ProviderName.ANTHROPIC },
    update: {},
    create: {
      name: ProviderName.ANTHROPIC,
      displayName: 'Anthropic',
      ...anthropicDummyKey,
      baseUrl: 'https://api.anthropic.com/v1',
      status: ProviderStatus.ACTIVE,
      priority: 2,
      supportedModalities: [Modality.TEXT, Modality.IMAGE],
    }
  });

  const anthropicModels = [
    { modelId: 'claude-fable-5-1', displayName: 'Claude Fable 5.1', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.010, outputPricePer1k: 0.050, contextWindow: 1000000, maxOutputTokens: 128000 },
    { modelId: 'claude-opus-5', displayName: 'Claude Opus 5', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.005, outputPricePer1k: 0.025, contextWindow: 1000000, maxOutputTokens: 128000 },
    { modelId: 'claude-sonnet-5', displayName: 'Claude Sonnet 5', modality: Modality.TEXT, isDefault: true, inputPricePer1k: 0.002, outputPricePer1k: 0.010, contextWindow: 1000000, maxOutputTokens: 128000 },
    { modelId: 'claude-haiku-4-5-20251001', displayName: 'Claude Haiku 4.5', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.001, outputPricePer1k: 0.005, contextWindow: 200000, maxOutputTokens: 64000 }
  ];

  for (const m of anthropicModels) {
    await prisma.providerModel.upsert({
      where: { modelId: m.modelId },
      update: m,
      create: { ...m, providerId: anthropic.id }
    });
  }

  // =============================================================
  // 3. GOOGLE GEMINI 
  // =============================================================
  const geminiDummyKey = encryptDummyKey('AIzaSyDummyGeminiKey');
  const gemini = await prisma.provider.upsert({
    where: { name: ProviderName.GEMINI },
    update: {},
    create: {
      name: ProviderName.GEMINI,
      displayName: 'Google Gemini',
      ...geminiDummyKey,
      status: ProviderStatus.ACTIVE,
      priority: 3,
      supportedModalities: [Modality.TEXT, Modality.IMAGE, Modality.VIDEO, Modality.AUDIO, Modality.EMBEDDING],
    }
  });

  const geminiModels = [
    { modelId: 'gemini-3.8-flash', displayName: 'Gemini 3.8 Flash', modality: Modality.TEXT, isDefault: true, inputPricePer1k: 0.0015, outputPricePer1k: 0.0075, contextWindow: 1000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-3.7-flash', displayName: 'Gemini 3.7 Flash', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0015, outputPricePer1k: 0.0075, contextWindow: 1000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-3.6-flash', displayName: 'Gemini 3.6 Flash', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0015, outputPricePer1k: 0.0075, contextWindow: 1000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-3.5-flash-lite', displayName: 'Gemini 3.5 Flash-Lite', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0003, outputPricePer1k: 0.0025, contextWindow: 1000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-3.1-pro-preview', displayName: 'Gemini 3.1 Pro (Preview)', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.002, outputPricePer1k: 0.012, contextWindow: 2000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00125, outputPricePer1k: 0.010, contextWindow: 2000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash-Lite', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0001, outputPricePer1k: 0.0004, contextWindow: 1000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-3.1-flash-image', displayName: 'Nano Banana 2', modality: Modality.IMAGE, isDefault: false, inputPricePer1k: 0.02, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gemini-3.1-flash-lite-image', displayName: 'Nano Banana 2 Lite', modality: Modality.IMAGE, isDefault: false, inputPricePer1k: 0.01, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gemini-3-pro-image', displayName: 'Nano Banana Pro', modality: Modality.IMAGE, isDefault: false, inputPricePer1k: 0.04, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gemini-omni-1.1-flash', displayName: 'Gemini Omni Flash', modality: Modality.VIDEO, isDefault: false, inputPricePer1k: 0.0015, outputPricePer1k: 0.0075, contextWindow: 1000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-3.5-transcribe', displayName: 'Gemini 3.5 Transcribe', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.001, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gemini-3.1-flash-live-preview', displayName: 'Gemini 3.1 Flash Live', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.003, outputPricePer1k: 0.015, contextWindow: 1000000, maxOutputTokens: 8192 },
    { modelId: 'gemini-3.1-flash-tts-preview', displayName: 'Gemini 3.1 Flash TTS', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.001, outputPricePer1k: 0.01, contextWindow: null, maxOutputTokens: null },
    { modelId: 'gemini-embedding-2-preview', displayName: 'Gemini Embedding 2', modality: Modality.EMBEDDING, isDefault: false, inputPricePer1k: 0.00001, outputPricePer1k: 0.00, contextWindow: 8192, maxOutputTokens: null },
  ];

  for (const m of geminiModels) {
    await prisma.providerModel.upsert({
      where: { modelId: m.modelId },
      update: m,
      create: { ...m, providerId: gemini.id }
    });
  }

  // =============================================================
  // 4. MISTRAL AI
  // =============================================================
  const mistralDummyKey = encryptDummyKey('dummy-mistral-api-key');
  const mistral = await prisma.provider.upsert({
    where: { name: ProviderName.MISTRAL },
    update: {},
    create: {
      name: ProviderName.MISTRAL,
      displayName: 'Mistral AI',
      ...mistralDummyKey,
      baseUrl: 'https://api.mistral.ai/v1',
      status: ProviderStatus.ACTIVE,
      priority: 4,
      supportedModalities: [Modality.TEXT, Modality.EMBEDDING],
    }
  });

  const mistralModels = [
    { modelId: 'mistral-large-latest', displayName: 'Mistral Large 3', modality: Modality.TEXT, isDefault: true, inputPricePer1k: 0.0005, outputPricePer1k: 0.0015, contextWindow: 128000, maxOutputTokens: 8192 },
    { modelId: 'magistral-medium', displayName: 'Magistral Medium', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.002, outputPricePer1k: 0.005, contextWindow: 128000, maxOutputTokens: 8192 },
    { modelId: 'codestral-latest', displayName: 'Codestral', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0003, outputPricePer1k: 0.0009, contextWindow: 256000, maxOutputTokens: 8192 },
    { modelId: 'mistral-small-latest', displayName: 'Mistral Small 4', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00015, outputPricePer1k: 0.0006, contextWindow: 128000, maxOutputTokens: 8192 },
    { modelId: 'ministral-3b', displayName: 'Ministral 3B', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0001, outputPricePer1k: 0.0001, contextWindow: 128000, maxOutputTokens: 8192 },
  ];

  for (const m of mistralModels) {
    await prisma.providerModel.upsert({
      where: { modelId: m.modelId },
      update: m,
      create: { ...m, providerId: mistral.id }
    });
  }

  // =============================================================
  // 5. COHERE 
  // =============================================================
  const cohereDummyKey = encryptDummyKey('dummy-cohere-api-key');
  const cohere = await prisma.provider.upsert({
    where: { name: ProviderName.COHERE },
    update: {},
    create: {
      name: ProviderName.COHERE,
      displayName: 'Cohere',
      ...cohereDummyKey,
      baseUrl: 'https://api.cohere.com/v1',
      status: ProviderStatus.ACTIVE,
      priority: 5,
      supportedModalities: [Modality.TEXT, Modality.EMBEDDING, Modality.IMAGE, Modality.AUDIO],
    }
  });

  const cohereModels = [
    { modelId: 'command-a-plus-05-2026', displayName: 'Command A+', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: 128000, maxOutputTokens: 64000 },
    { modelId: 'command-a-03-2025', displayName: 'Command A', modality: Modality.TEXT, isDefault: true, inputPricePer1k: 0.0025, outputPricePer1k: 0.0100, contextWindow: 256000, maxOutputTokens: 8000 },
    { modelId: 'command-a-translate-08-2025', displayName: 'Command A Translate', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: 8000, maxOutputTokens: 8000 },
    { modelId: 'command-a-reasoning-08-2025', displayName: 'Command A Reasoning', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: 256000, maxOutputTokens: 32000 },
    { modelId: 'command-a-vision-07-2025', displayName: 'Command A Vision', modality: Modality.IMAGE, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: 128000, maxOutputTokens: 8000 },
    { modelId: 'command-r7b-12-2024', displayName: 'Command R7B', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0000375, outputPricePer1k: 0.00015, contextWindow: 128000, maxOutputTokens: 4000 },
    { modelId: 'command-r-plus-08-2024', displayName: 'Command R+', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0025, outputPricePer1k: 0.0100, contextWindow: 128000, maxOutputTokens: 4000 },
    { modelId: 'command-r-08-2024', displayName: 'Command R', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00015, outputPricePer1k: 0.0006, contextWindow: 128000, maxOutputTokens: 4000 },
    { modelId: 'embed-v4.0', displayName: 'Embed v4.0', modality: Modality.EMBEDDING, isDefault: false, inputPricePer1k: 0.00012, outputPricePer1k: 0.00, contextWindow: 128000, maxOutputTokens: null },
    { modelId: 'embed-english-v3.0', displayName: 'Embed English v3.0', modality: Modality.EMBEDDING, isDefault: false, inputPricePer1k: 0.0001, outputPricePer1k: 0.00, contextWindow: 512, maxOutputTokens: null },
    { modelId: 'cohere-transcribe-03-2026', displayName: 'Cohere Transcribe', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'cohere-transcribe-arabic-07-2026', displayName: 'Cohere Transcribe Arabic', modality: Modality.AUDIO, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: null, maxOutputTokens: null },
    { modelId: 'c4ai-aya-expanse-32b', displayName: 'Aya Expanse 32B', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.0005, outputPricePer1k: 0.0015, contextWindow: 128000, maxOutputTokens: 4000 },
    { modelId: 'c4ai-aya-vision-32b', displayName: 'Aya Vision 32B', modality: Modality.IMAGE, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: 16000, maxOutputTokens: 4000 },
    { modelId: 'tiny-aya-global', displayName: 'Tiny Aya Global', modality: Modality.TEXT, isDefault: false, inputPricePer1k: 0.00, outputPricePer1k: 0.00, contextWindow: 8000, maxOutputTokens: 8000 },
  ];

  for (const m of cohereModels) {
    await prisma.providerModel.upsert({
      where: { modelId: m.modelId },
      update: m,
      create: { ...m, providerId: cohere.id }
    });
  }

  console.log(`✅ Fully seeded 5 Providers and their combined 56 Models (OpenAI: 18, Anthropic: 4, Gemini: 15, Mistral: 5, Cohere: 14).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 4. Safely disconnect Prisma and drain the PG connection pool
    await prisma.$disconnect();
    await pool.end();
  });