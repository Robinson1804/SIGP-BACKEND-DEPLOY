import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

/**
 * Audit Subscriber
 *
 * Logs all entity changes to the auditoria_logs table
 * This provides an application-level audit trail
 */
@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditSubscriber.name);

  // Tables to exclude from audit logging
  private readonly excludedTables = [
    'auditoria_logs',
    'sesiones',
    'typeorm_migrations',
    'notificaciones', // Too noisy
  ];

  constructor(
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  /**
   * Called after entity insertion
   */
  async afterInsert(event: InsertEvent<any>): Promise<void> {
    await this.logAudit(event, 'INSERT');
  }

  /**
   * Called after entity update
   */
  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    await this.logAudit(event, 'UPDATE');
  }

  /**
   * Called after entity removal
   */
  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    await this.logAudit(event, 'DELETE');
  }

  /**
   * Log audit entry
   */
  private async logAudit(
    event: InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>,
    action: string,
  ): Promise<void> {
    try {
      const tableName = event.metadata.tableName;
      const schemaName = event.metadata.schema || 'public';
      const fullTableName = `${schemaName}.${tableName}`;

      // Skip excluded tables
      if (this.excludedTables.includes(tableName)) {
        return;
      }

      // Get entity data
      const entity = event.entity;
      if (!entity) return;

      // Get usuario_id from entity (if available)
      const usuarioId = entity.updatedBy || entity.createdBy || null;

      // Get record ID
      const recordId = entity.id || null;

      // Prepare data
      let datosAnteriores = null;
      let datosNuevos = null;

      if (action === 'INSERT') {
        datosNuevos = this.sanitizeData(entity);
      } else if (action === 'UPDATE' && 'databaseEntity' in event) {
        datosAnteriores = this.sanitizeData((event as UpdateEvent<any>).databaseEntity);
        datosNuevos = this.sanitizeData(entity);
      } else if (action === 'DELETE') {
        datosAnteriores = this.sanitizeData(entity);
      }

      // Insert audit log
      await event.manager.query(
        `
        INSERT INTO public.auditoria_logs (
          usuario_id,
          accion,
          tabla_afectada,
          registro_id,
          datos_anteriores,
          datos_nuevos,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `,
        [
          usuarioId,
          action,
          fullTableName,
          recordId,
          datosAnteriores ? JSON.stringify(datosAnteriores) : null,
          datosNuevos ? JSON.stringify(datosNuevos) : null,
        ],
      );
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      this.logger.error('Failed to log audit entry:', error);
    }
  }

  /**
   * Sanitize data for logging (remove sensitive fields)
   */
  private sanitizeData(data: any): any {
    if (!data) return null;

    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = [
      'passwordHash',
      'password_hash',
      'password',
      'token',
      'refreshToken',
      'secretKey',
    ];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
