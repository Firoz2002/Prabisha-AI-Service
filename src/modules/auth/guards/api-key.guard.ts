// src/modules/auth/guards/api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // 1. Extract the prefix (first 12 chars) to match your admin.service.ts logic
    const incomingPrefix = apiKey.slice(0, 12);

    // 2. Fetch all active keys that match this prefix
    // (This includes the fix for keys with infinite lifespans / expiresAt: null)
    const potentialKeys = await this.prisma.apiKey.findMany({
      where: {
        keyPrefix: incomingPrefix,
        status: 'ACTIVE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: { user: true },
    });

    // 3. Initialize with 'any' to satisfy TypeScript strict null checks
    let apiKeyRecord: any = null;

    // 4. Use bcrypt to compare the incoming raw key against the stored hashes
    for (const key of potentialKeys) {
      const isMatch = await bcrypt.compare(apiKey, key.keyHash);
      if (isMatch) {
        apiKeyRecord = key;
        break;
      }
    }

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // 5. Update last used timestamp and usage count
    await this.prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { 
        lastUsedAt: new Date(),
        usageCount: { increment: 1 }
      },
    });

    // 6. Attach user and apiKey info to request
    request.user = {
      id: apiKeyRecord.user.id,
      email: apiKeyRecord.user.email,
      role: apiKeyRecord.user.role,
      apiKeyId: apiKeyRecord.id,
    };
    
    return true;
  }
}