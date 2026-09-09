// src/modules/providers/provider.interface.ts
import { Modality, ProviderName } from 'src/generated/prisma/enums';

export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  model: string;
  providerName: ProviderName;
  providerId?: string;
  providerModelId?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
  fallbackChain?: string[];
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  n?: number;
}

export interface ImageGenerationResponse {
  images: string[];
  provider: ProviderName;
  model: string;
  providerId?: string;
  providerModelId?: string;
  latency?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  resolution?: string;
}

export interface VideoGenerationResponse {
  videoUrl: string;
  provider: ProviderName;
  model: string;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  provider: ProviderName;
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
  providerId?: string;
  providerModelId?: string;
  latency?: number;
}

export interface AIProvider {
  name: ProviderName;
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream?(request: ChatRequest): Promise<AsyncIterable<any>>;
  generateImage?(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  generateVideo?(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
  generateEmbeddings?(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  supportsModality(modality: Modality): boolean;
}