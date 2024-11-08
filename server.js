const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Создаем приложение Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = 0; // Считаем количество подключенных пользователей

// Генерация случайного пароля
function generatePassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}

let currentPassword = generatePassword(); // Генерируем пароль при старте сервера
console.log(`Generated password: ${currentPassword}`); // Выводим пароль в консоль

// Статические файлы (например, для HTML, CSS и JS)
app.use(express.static('public'));

// Обработка нового подключения
io.on('connection', (socket) => {
    // Увеличиваем счетчик пользователей
    users++;
    io.emit('user count', users); // Отправляем количество пользователей всем клиентам

    console.log(`A user connected. Users online: ${users}`);

    // Обработка отключения пользователя
    socket.on('disconnect', () => {
        users--;
        io.emit('user count', users); // Обновляем количество пользователей при отключении
        console.log(`A user disconnected. Users online: ${users}`);
    });

    // Обработка получения пароля
    socket.on('password', (password) => {
        // Сравниваем полученный пароль с тем, который был сгенерирован
        if (password === currentPassword) {
            console.log('Correct password received. User is connected.');
            socket.emit('passwordSuccess', { message: 'Password correct. You are connected to the chat.' });
        } else {
            console.log('Incorrect password received.');
            socket.emit('passwordError', { message: 'Incorrect password. Please try again.' });
        }
    });

    // Обработка чатов
    socket.on('chat message', (msg) => {
        // Отправляем сообщение всем подключенным пользователям
        io.emit('chat message', msg);
        console.log('Message sent:', msg);
    });

    // Обработка сообщений с файлами
    socket.on('file message', (fileData) => {
        io.emit('chat message', fileData); // Рассылаем сообщение с файлом
        console.log('File sent:', fileData);
    });
});

// Настройка порта и запуск сервера
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});