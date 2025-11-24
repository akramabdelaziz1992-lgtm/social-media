import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/whatsapp',
})
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsAppGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendQRCode(qr: string) {
    this.logger.log('📱 Broadcasting QR Code to clients...');
    this.server.emit('qr', { qr });
  }

  sendConnectionStatus(status: 'connected' | 'disconnected' | 'failed') {
    this.logger.log(`📢 Broadcasting status: ${status}`);
    this.server.emit('status', { status });
  }

  sendMessage(event: string, data: any) {
    this.server.emit(event, data);
  }
}
