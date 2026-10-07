
import { Server, Socket } from 'socket.io';

// In-memory room canvas element store
const roomStore: Record<string, any[]> = {};

export const registerCanvasHandlers = (io: Server, socket: Socket) => {
  // Join room and load saved canvas elements
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    if (!roomStore[roomId]) {
      roomStore[roomId] = [];
    }
    socket.emit('load-canvas', roomStore[roomId]);
  });

  // Add or update drawing element in real-time
  socket.on('draw-element', ({ roomId, element }) => {
    if (!roomStore[roomId]) roomStore[roomId] = [];

    const index = roomStore[roomId].findIndex((e) => e.id === element.id);
    if (index !== -1) {
      roomStore[roomId][index] = element;
    } else {
      roomStore[roomId].push(element);
    }

    socket.to(roomId).emit('element-updated', element);
  });

  // Clear canvas across all peers in the room
  socket.on('clear-canvas', (roomId: string) => {
    roomStore[roomId] = [];
    socket.to(roomId).emit('canvas-cleared');
  });

  // Broadcast peer cursor movement
  socket.on('cursor-move', ({ roomId, cursor, userName }) => {
    socket.to(roomId).emit('cursor-updated', {
      userId: socket.id,
      cursor,
      userName,
    });
  });

  // Clean up user cursor when disconnected
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('user-disconnected', socket.id);
    });
  });
};