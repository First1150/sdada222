const socket = io();
let userId;

socket.on('connect', () => {
    console.log('Connected to the server');
    userId = prompt('Enter your user ID:');
});

socket.on('disconnect', () => {
    rooms.forEach((users, roomId) => {
        if (users.has(userId)) {
            users.delete(userId);
            socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has left the room.` });
        }
    });
});

function joinRoom(roomId) {
    socket.emit('join-room', roomId, userId);
}

function createRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
}

socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userId}: ${msg}`;
    document.getElementById('chat-display').appendChild(messageElement);
});

socket.on('room-created', ({ roomId, roomName }) => {
    const roomButton = document.createElement('button');
    roomButton.textContent = roomName;
    roomButton.addEventListener('click', () => {
        joinRoom(roomId);
    });
    document.getElementById('room-selection').appendChild(roomButton);
});

document.getElementById('join-room-button').addEventListener('click', () => {
    roomId = prompt('Enter room ID:');
    joinRoom(roomId);
});

document.getElementById('create-room-button').addEventListener('click', createRoom);

document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        socket.emit('chat-message', roomId, userId, message);
        document.getElementById('message-input').value = '';
    }
});
