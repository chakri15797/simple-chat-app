const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = [];

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
    const index = users.findIndex(user => user.id === socket.id);
    if (index !== -1) {
      users.splice(index, 1);
    }
    io.emit('user-info', users);
  });

  socket.on('user-info', (userInfo) => {
    users.push({
      id: socket.id,
      name: userInfo.name
    });

    io.emit('user-info', users);
  });

  socket.on('private-message', (data) => {
    const toUser = users.find(user => user.name === data.to);

    if (toUser) {
      const messageData = {
        from: users.find(user => user.id === socket.id).name,
        to: toUser.name,
        message: data.message
      };

      io.to(toUser.id).emit('private-message', messageData);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});