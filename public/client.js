const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

let roomId; // รหัสห้อง
let userId; // รหัสผู้ใช้

function joinRoom(roomId) {
    userId = prompt('Enter your user ID:');
    if (roomId && userId) { // ตรวจสอบค่า roomId และ userId
        socket.emit('join-room', roomId, userId); // ส่ง roomId และ userId ไปยังเซิร์ฟเวอร์
    } else {
        alert('Please enter both room ID and user ID.'); // แสดงข้อความแจ้งเตือนหากไม่ได้ป้อนค่า
    }
}

function createRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName); // ส่งชื่อห้องไปยังเซิร์ฟเวอร์
    } else {
        alert('Please enter a room name.'); // แสดงข้อความแจ้งเตือนหากไม่ได้ป้อนค่า
    }
}


socket.on('chat-message', ({ senderId, msg }) => {
    const messageElement = document.createElement('div');
    if (senderId === userId) {
        messageElement.textContent = `You: ${msg}`;
    } else {
        messageElement.textContent = `${senderId}: ${msg}`;
    }
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
    if (message.trim() && roomId && userId) { // ตรวจสอบว่ามี roomId และ userId ที่ถูกต้อง
        socket.emit('chat-message', roomId, userId, message);
        document.getElementById('message-input').value = '';
    }
});

document.getElementById('message-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const message = document.getElementById('message-input').value;
        if (message.trim() && roomId && userId) { // ตรวจสอบว่ามี roomId และ userId ที่ถูกต้อง
            socket.emit('chat-message', roomId, userId, message);
            document.getElementById('message-input').value = '';
        }
    }
});
