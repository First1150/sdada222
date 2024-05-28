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
    });

    socket.on('create-room', (roomName) => {
        const roomId = uuidv4();
        rooms.set(roomId, new Set());
        io.emit('room-created', { roomId, roomName });
    });

    socket.on('chat-message', (roomId, userId, msg) => {
        socket.to(roomId).emit('chat-message', { userId, msg });
    });

    socket.on('disconnect', () => {
        rooms.forEach((users, roomId) => {
            if (users.has(userId)) {
                users.delete(userId);
                socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has left the room.` });
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
