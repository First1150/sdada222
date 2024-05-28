const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

let roomId; // รหัสห้อง
let userId; // รหัสผู้ใช้

let isRoomCreator = false;

function createRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
}

socket.on('room-created', ({ roomId, roomName }) => {
    const roomButton = document.createElement('button');
    roomButton.textContent = roomName;
    roomButton.addEventListener('click', () => {
        joinRoom(roomId);
    });
    document.getElementById('room-selection').appendChild(roomButton);

    // Check if the user is the room creator before joining
    if (isRoomCreator) {
        joinRoom(roomId);
    }
});

socket.on('connect', () => {
    console.log('Connected to the server');
    userId = prompt('Enter your user ID:');
});

function joinRoom(roomId) {
    if (!userId) {
        userId = prompt('Enter your user ID:');
    }
    socket.emit('join-room', roomId, userId);
}

document.getElementById('join-room-button').addEventListener('click', () => {
    roomId = prompt('Enter room ID:');
    joinRoom(roomId);
});

document.getElementById('create-room-button').addEventListener('click', () => {
    createRoom();
    isRoomCreator = true;
});

socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userId}: ${msg}`;
    document.getElementById('chat-display').appendChild(messageElement);
});

document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        // Send message to server
        socket.emit('chat-message', roomId, userId, message);
        
        // Display user's message in chat display
        const userMessageElement = document.createElement('div');
        userMessageElement.textContent = `You: ${message}`;
        document.getElementById('chat-display').appendChild(userMessageElement);

        // Clear message input field
        document.getElementById('message-input').value = '';
    }
});

