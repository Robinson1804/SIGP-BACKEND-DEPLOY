import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Notificacion } from '../entities/notificacion.entity';

/**
 * Eventos WebSocket para Notificaciones
 */
export const WS_EVENTS = {
  // Server -> Client
  NOTIFICATION_NEW: 'notificacion:nueva',
  NOTIFICATION_COUNT: 'notificacion:conteo',
  NOTIFICATION_READ: 'notificacion:leida',

  // Client -> Server
  MARK_AS_READ: 'notificacion:marcarLeida',
  MARK_ALL_READ: 'notificacion:marcarTodas',
  JOIN_USER_ROOM: 'user:join',
  LEAVE_USER_ROOM: 'user:leave',

  // Rooms por proyecto/actividad
  JOIN_PROJECT_ROOM: 'proyecto:join',
  LEAVE_PROJECT_ROOM: 'proyecto:leave',

  // Eventos de tareas (para tablero Kanban en tiempo real)
  TASK_UPDATED: 'tarea:actualizada',
  TASK_MOVED: 'tarea:movida',
  TASK_CREATED: 'tarea:creada',
  TASK_DELETED: 'tarea:eliminada',

  // Eventos de sprint
  SPRINT_UPDATED: 'sprint:actualizado',

  // Conexion
  USER_CONNECTED: 'usuario:conectado',
  USER_DISCONNECTED: 'usuario:desconectado',
} as const;

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userEmail?: string;
  userRol?: string;
}

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificacionesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificacionesGateway.name);
  private connectedUsers: Map<number, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized on namespace /ws');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extraer token del handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verificar token JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Guardar info del usuario en el socket
      client.userId = payload.sub;
      client.userEmail = payload.email;
      client.userRol = payload.rol;

      // Unir al room del usuario
      const userRoom = `user:${payload.sub}`;
      client.join(userRoom);

      // Registrar conexion
      if (!this.connectedUsers.has(payload.sub)) {
        this.connectedUsers.set(payload.sub, new Set());
      }
      this.connectedUsers.get(payload.sub)!.add(client.id);

      this.logger.log(
        `User ${payload.email} (ID: ${payload.sub}) connected with socket ${client.id}`,
      );

      // Notificar al cliente que esta conectado
      client.emit(WS_EVENTS.USER_CONNECTED, {
        userId: payload.sub,
        connectedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
        }
      }
      this.logger.log(`User ${client.userEmail} (ID: ${client.userId}) disconnected`);
    }
  }

  /**
   * Unirse a sala de proyecto para recibir actualizaciones en tiempo real
   */
  @SubscribeMessage(WS_EVENTS.JOIN_PROJECT_ROOM)
  handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { proyectoId: number },
  ) {
    const room = `proyecto:${data.proyectoId}`;
    client.join(room);
    this.logger.debug(`User ${client.userId} joined room ${room}`);
    return { success: true, room };
  }

  /**
   * Salir de sala de proyecto
   */
  @SubscribeMessage(WS_EVENTS.LEAVE_PROJECT_ROOM)
  handleLeaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { proyectoId: number },
  ) {
    const room = `proyecto:${data.proyectoId}`;
    client.leave(room);
    this.logger.debug(`User ${client.userId} left room ${room}`);
    return { success: true };
  }

  /**
   * Marcar notificacion como leida (desde cliente)
   */
  @SubscribeMessage(WS_EVENTS.MARK_AS_READ)
  handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificacionId: number },
  ) {
    // Este evento se usa para sincronizar entre pestanas del mismo usuario
    // La logica real de marcar como leida esta en el servicio REST
    const userRoom = `user:${client.userId}`;
    this.server.to(userRoom).emit(WS_EVENTS.NOTIFICATION_READ, {
      notificacionId: data.notificacionId,
      userId: client.userId,
    });
    return { success: true };
  }

  // ============================================
  // METODOS PUBLICOS PARA EMITIR DESDE SERVICIOS
  // ============================================

  /**
   * Emitir notificacion a un usuario especifico
   */
  emitToUser(userId: number, notificacion: Notificacion) {
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit(WS_EVENTS.NOTIFICATION_NEW, {
      id: notificacion.id,
      tipo: notificacion.tipo,
      titulo: notificacion.titulo,
      descripcion: notificacion.descripcion,
      entidadTipo: notificacion.entidadTipo,
      entidadId: notificacion.entidadId,
      urlAccion: notificacion.urlAccion,
      createdAt: notificacion.createdAt,
    });
    this.logger.debug(`Notification sent to user ${userId}`);
  }

  /**
   * Emitir a multiples usuarios
   */
  emitToUsers(userIds: number[], notificacion: Notificacion) {
    userIds.forEach((userId) => this.emitToUser(userId, notificacion));
  }

  /**
   * Emitir actualizacion de conteo de notificaciones
   */
  emitCountUpdate(userId: number, count: { total: number; porTipo: Record<string, number> }) {
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit(WS_EVENTS.NOTIFICATION_COUNT, count);
  }

  /**
   * Emitir actualizacion de tarea a todos en la sala del proyecto
   */
  emitTaskUpdate(proyectoId: number, event: string, data: any) {
    const room = `proyecto:${proyectoId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Task event ${event} emitted to room ${room}`);
  }

  /**
   * Emitir actualizacion de sprint
   */
  emitSprintUpdate(proyectoId: number, sprintData: any) {
    const room = `proyecto:${proyectoId}`;
    this.server.to(room).emit(WS_EVENTS.SPRINT_UPDATED, sprintData);
  }

  /**
   * Verificar si un usuario esta conectado
   */
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  /**
   * Obtener cantidad de usuarios conectados
   */
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Obtener IDs de usuarios conectados
   */
  getOnlineUserIds(): number[] {
    return Array.from(this.connectedUsers.keys());
  }
}
