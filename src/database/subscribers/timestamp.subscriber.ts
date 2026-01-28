import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

/**
 * Timestamp Subscriber
 *
 * Automatically sets created_at and updated_at fields
 * This is a fallback for entities that don't use TypeORM decorators properly
 */
@Injectable()
@EventSubscriber()
export class TimestampSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  /**
   * Called before entity insertion
   */
  beforeInsert(event: InsertEvent<any>): void {
    const entity = event.entity;
    if (!entity) return;

    const now = new Date();

    // Set created_at if not set
    if ('createdAt' in entity && !entity.createdAt) {
      entity.createdAt = now;
    }

    // Set updated_at
    if ('updatedAt' in entity) {
      entity.updatedAt = now;
    }
  }

  /**
   * Called before entity update
   */
  beforeUpdate(event: UpdateEvent<any>): void {
    const entity = event.entity;
    if (!entity) return;

    // Always update updated_at
    if ('updatedAt' in entity) {
      entity.updatedAt = new Date();
    }
  }
}
