const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

const rooms = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(userId);
        socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has joined the room.` });
        
        // Emit all previous messages in the room to the user who just joined
        const messagesInRoom = messages.get(roomId) || [];
        messagesInRoom.forEach(message => {
            socket.emit('chat-message', message);
        });
    });

    socket.on('create-room', (roomName) => {
        const roomId = uuidv4();
        rooms.set(roomId, new Set());
        io.emit('room-created', { roomId, roomName });
    });

    socket.on('chat-message', (roomId, userId, msg) => {
        const message = { userId, msg };
        // Store the message
        if (!messages.has(roomId)) {
            messages.set(roomId, []);
        }
        messages.get(roomId).push(message);
        // Emit the chat message to everyone in the room, including the sender
        io.to(roomId).emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        rooms.forEach((users, roomId) => {
            if (users.has(socket.userId)) {
                users.delete(socket.userId);
                socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${socket.userId} has left the room.` });
            }
        });
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
