const messageList = document.querySelector('ul');
const messageForm = document.querySelector('#message');
const nicknameForm = document.querySelector('#nickname');

const socket = new WebSocket(`ws://${window.location.host}`); // Server와 연결

function makeMsg(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg); // JS Object를 string으로 변환
}

// Server와 연결되었을 때
socket.addEventListener('open', () => {
  console.log('Connected to Server ✅');
});
// Server로부터 받은 메시지를 브라우저에 출력
socket.addEventListener('message', (message) => {
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
});
// Server와 연결이 끊어지면 브라우저에 출력
socket.addEventListener('close', () => {
  console.log('Disconnected from Server ❌');
});

// Browser의 폼 연결 및 Server에 메시지 전달
messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(makeMsg('new_msg', input.value));
  input.value = '';
});
// Browser의 닉네임을 Server에 전달
nicknameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = nicknameForm.querySelector('input');
  socket.send(makeMsg('nickname', input.value));
  input.value = input.value;
  input.disabled = true;
});
