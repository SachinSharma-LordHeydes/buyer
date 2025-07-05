import type { PrismaClient } from '@prisma/client';

// Type for Prisma transaction client
export type PrismaTransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

// Product update input interface
export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  stock?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  images?: ProductImageInput[];
  video?: ProductVideoInput[];
  features?: ProductFeatureInput[];
  specifications?: ProductSpecificationInput[];
}

export interface ProductImageInput {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface ProductVideoInput {
  url: string;
  publicId: string;
}

export interface ProductFeatureInput {
  feature: string;
  value?: string;
}

export interface ProductSpecificationInput {
  name: string;
  value?: string;
}
