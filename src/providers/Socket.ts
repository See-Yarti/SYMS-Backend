import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import Logger from '@/utils/logger';
import Cors from '@/middlewares/Cors';

class Socket {
  private io: SocketIOServer;

  public init(server: HttpServer): void {
    this.io = new SocketIOServer(server, {
      cors: Cors.corsConfig,
    });

    Logger.info('⚡ WebSocket Server Initialized');

    this.io.on('connection', (socket) => {
      Logger.info(`✅ New connection: ${socket.id}`);

      // Listen for messages
      socket.on('message', (data) => {
        Logger.info(`📩 Message from ${socket.id}: ${data}`);
        this.io.emit('message', data); // Broadcast to all clients
      });

      // Send a notification every 5 seconds
      //   setInterval(() => {
      //     const notification = {
      //       title: '🔔 New Notification',
      //       description: 'This is a dummy notification from the server!',
      //       image:
      //         'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3276&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      //       fallback: 'AA',
      //     };

      //     socket.emit('notification', notification);
      //     Logger.info(`📢 Sent notification to ${socket.id}`);
      // }, 5000); // Send every 5 seconds

      // Handle disconnection
      socket.on('disconnect', () => {
        Logger.warn(`❌ Disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default new Socket();
