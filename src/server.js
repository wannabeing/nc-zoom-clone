import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public')); // user가 볼 수있는 폴더

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app); // HTTP server (Used express.js)
const wsServer = new Server(httpServer); // WebSocket Server (SocketIO)

let roomsData;
function getPublicRooms() {
  // sids = privateRoom
  // rooms = privateRoom & publicRoom
  const { sids, rooms } = wsServer.sockets.adapter;
  const publicRooms = [];
  roomsData = [];

  // public Room 찾기 (sids, rooms의 key가 동일하면 private Room)
  rooms.forEach((value, key) => {
    if (!sids.has(key)) {
      publicRooms.push(key);
    }
  });

  publicRooms.forEach((publicRoom) => {
    const members = rooms.get(publicRoom);
    const roomCount = [];
    members.forEach((member) => {
      wsServer.sockets.sockets.forEach((socket) => {
        if (member === socket.id) {
          roomCount.push(member);
        }
      });
    });
    roomsData.push({ publicRoom, userCount: roomCount.length });
  });
  return roomsData;
}
function getCountUsers(roomname) {
  return wsServer.sockets.adapter.rooms.get(roomname)?.size;
}

wsServer.on('connection', (socket) => {
  socket.nickname = 'Anonymous'; // nickname 초기화
  wsServer.sockets.emit('room_change', getPublicRooms()); // 모든 socket에 보냄

  // 1. 'enter_room' Event (from the Browser)
  socket.on('enter_room', (roomname, FuncShowroom) => {
    socket.join(roomname); // browser에서 입력받은 이름으로 룸 생성
    FuncShowroom(getCountUsers(roomname)); // browser에서 함수 실행
    socket
      .to(roomname)
      .emit('welcome', socket.nickname, getCountUsers(roomname));
    wsServer.sockets.emit('room_change', getPublicRooms()); // 모든 socket에 보냄
  });
  // 2. 'send_msg' Evnet (from the Browser)
  socket.on('send_msg', (roomname, msg, done) => {
    socket.to(roomname).emit('send_msg', `${socket.nickname}: ${msg}`);
    done(`${socket.nickname}: ${msg}`); // browser에서 함수 실행
  });
  // 3. 'nickname' Event (from the Browser)
  socket.on('nickname', (nickname, done) => {
    socket.nickname = nickname;
    done(nickname);
  });
  // 연결이 끊어지기 직전에 'closed'이벤트 실행
  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomname) => {
      socket
        .to(roomname)
        .emit('closed', socket.nickname, getCountUsers(roomname) - 1);
    });
  });
  // 연결이 완전히 끊어진 후에 'room_change' 이벤트 실행
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', getPublicRooms()); // 모든 socket에 보냄
  });
});

httpServer.listen(3000, () => {
  console.log('Activated Port 3000');
});
