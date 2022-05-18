import express from 'express';
import http from 'http';
import { parse } from 'path';
import WebSocket from 'ws';

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public')); // user가 볼 수있는 폴더

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

console.log('hello');

const server = http.createServer(app); // HTTP server (Used express.js)
const wss = new WebSocket.Server({ server }); // WebSocket server (Based on HTTP server)

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
server.listen(3000);
