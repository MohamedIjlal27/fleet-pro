import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket;

  constructor() {
    console.log('[SocketService] Socket connection disabled for local development');
    // Commented out socket connection to run without backend
    // this.socket = io(import.meta.env.VITE_BACKEND_BASE_URL, {
    //   transports: ['websocket'],
    // });
    
    // Create a mock socket object to prevent errors
    this.socket = {
      on: () => {},
      emit: () => {},
      off: () => {},
      disconnect: () => {},
      id: 'mock-socket-id'
    } as any;

    // Commented out socket event listeners since we're using a mock socket
    // this.socket.on('connect', () => {
    //   console.log(`[SocketService] Connected to WebSocket server. Socket ID: ${this.socket.id}`);
    // });

    // this.socket.on('disconnect', (reason) => {
    //   console.log(`[SocketService] Disconnected from WebSocket server. Reason: ${reason}`);
    // });

    // this.socket.on('connect_error', (error) => {
    //   console.error('[SocketService] Connection error:', error);
    // });

    // this.socket.on('error', (error) => {
    //   console.error('[SocketService] Socket error:', error);
    // });
  }

  subscribeToDeviceUpdates(deviceId: string, organizationId: number) {
    console.log(`[SocketService] Subscribing to device updates. deviceId: ${deviceId}. organizationId: ${organizationId}.`);
    this.socket.emit('deviceUpdates', {deviceId, organizationId});
  }

  unsubscribeFromDeviceUpdates() {
    console.log('[SocketService] Unsubscribing from device updates.');
    this.socket.emit('removeUpdates');
  }

  onDeviceUpdate(callback: (data: any) => void) {
    console.log('[SocketService] Setting up listener for device updates.');
    this.socket.on('getDeviceUpdate', (data) => {
      console.log('[SocketService] Received device update:', data);
      callback(data);
    });
  }

  subscribeTodevicesLocationUpdates(deviceIds: string[], organizationId: number) {
    const serializedIds = JSON.stringify(deviceIds);
    console.log(`[SocketService] Subscribing to location updates for devices: ${serializedIds}. organizationId: ${organizationId}.`);
    this.socket.emit('devicesLocationUpdates', {deviceIds: serializedIds, organizationId});
  }

  onDevicesLocationUpdates(callback: (data: any) => void): () => void {
    console.log('[SocketService] Setting up listener for devices location updates.');

    const listener = (data: any) => {
      console.log('[SocketService] Received devices location update:', data);
      callback(data);
    };

    this.socket.on('getDevicesLocationUpdates', listener);

    return () => {
      console.log('[SocketService] Removing listener for devices location updates.');
      this.socket.off('getDevicesLocationUpdates', listener);
    };
  }

  disconnect() {
    console.log('[SocketService] Disconnecting from WebSocket server.');
    this.socket.disconnect();
  }
}

const socketService = new SocketService();
export default socketService;
