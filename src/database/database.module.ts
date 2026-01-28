import { Module, Global } from '@nestjs/common';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { TimestampSubscriber } from './subscribers/timestamp.subscriber';

/**
 * Database Module
 *
 * Provides database-related services:
 * - Event subscribers (audit, timestamp)
 * - Utilities (pagination, query helpers, código generator)
 */
@Global()
@Module({
  providers: [
    AuditSubscriber,
    TimestampSubscriber,
  ],
  exports: [
    AuditSubscriber,
    TimestampSubscriber,
  ],
})
export class DatabaseModule {}
