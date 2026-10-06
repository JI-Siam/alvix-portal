import { EntityMetadata, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

/** Properties that must keep the user's casing. */
const KEEP = new Set(['email', 'website', 'passwordHash']);

/**
 * Single chokepoint: every string column written through TypeORM is trimmed and stored in UPPERCASE,
 * except email, website (URLs are case-sensitive) and the password hash.
 */
@EventSubscriber()
export class UppercaseSubscriber implements EntitySubscriberInterface {
  private apply(entity: any, meta: EntityMetadata) {
    if (!entity) return;
    for (const col of meta.columns) {
      const key = col.propertyName;
      if (KEEP.has(key) || typeof entity[key] !== 'string') continue;
      if (col.type === 'varchar' || col.type === 'text' || col.type === String) entity[key] = entity[key].trim().toUpperCase();
    }
  }
  beforeInsert(e: InsertEvent<any>) { this.apply(e.entity, e.metadata); }
  beforeUpdate(e: UpdateEvent<any>) { this.apply(e.entity, e.metadata); }
}
