import express from 'express';
import http from 'http';
import { parse } from 'path';
import { Server } from 'socket.io';
const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public')); // user가 볼 수있는 폴더

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

console.log('hello');

const httpServer = http.createServer(app); // HTTP server (Used express.js)
// const wss = new WebSocket.Server({ server }); // WebSocket server (Based on HTTP server)
const wsServer = new Server(httpServer); // WebSocket Server (SocketIO)

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous'; // nickname 초기화
  socket['total'] = 0;
  // 1. 'enter_room' Event (from the Browser)
  socket.on('enter_room', (roomname, FuncShowroom) => {
    socket.join(roomname); // browser에서 입력받은 이름으로 룸 생성
    FuncShowroom(); // browser에서 함수 실행
    socket.to(roomname).emit('welcome', socket.nickname); // 방에 있는 나를 제외한 모두에게 'welcome'이벤트 실행 (app.js 참고)
  });
  // 2. 'send_msg' Evnet (from the Browser)
  socket.on('send_msg', (roomname, msg, FuncShowMsg) => {
    socket.to(roomname).emit('send_msg', `${socket.nickname}: ${msg}`);
    FuncShowMsg(`${socket.nickname}: ${msg}`); // browser에서 함수 실행
  });
  // 3. 'nickname' Event (from the Browser)
  socket.on('nickname', (nickname, done) => {
    socket['nickname'] = nickname;
    done(nickname);
  });

  // browser에서 누군가 연결이 끊어졌을 때 (disconnecting), 'closed'이벤트 실행
  socket.on('disconnecting', () => {
    socket.rooms.forEach((disconnectingRoom) => {
      socket.to(disconnectingRoom).emit('closed', socket.nickname);
    });
  });
});
/*
const sockets = [];

// 브라우저와 서버를 연결한 후에 이벤트 리스너
wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'anonymous'; // 기본 닉네임 설정
  console.log('Connected to Browser ✅');
  socket.on('close', () => console.log('Disconnected from Browser ❌')); // 탭 닫았을 때 출력 (Browser와 연결 끊김)
  socket.on('message', (msg) => {
    const message = JSON.parse(msg); // string을 JS Object로 변환
    switch (message.type) {
      case 'new_msg':
        sockets.forEach((aSocket) => {
          aSocket.send(
            `${socket.nickname}: ${message.payload.toString('utf-8')}`
          );
        });
        break;
      case 'nickname':
        socket['nickname'] = message.payload;
        break;
    }
  });
});
*/
httpServer.listen(3000);
