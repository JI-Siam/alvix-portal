import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

export async function removeOr404<T extends ObjectLiteral>(repo: Repository<T>, id: string, what: string) {
  const r = await repo.delete(id);
  if (!r.affected) throw new NotFoundException(`${what} not found`);
  return { ok: true };
}
