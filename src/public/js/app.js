const socket = io(); // 서버와 연결 (socketIO)
const welcome = document.querySelector('#welcome');
const room = document.querySelector('#room');
const nicknameForm = welcome.querySelector('#nickname');
const roomnameForm = welcome.querySelector('#roomname');
const msgForm = room.querySelector('#msg');
let roomName;

// 1. nickname Event
function nicknameSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector('#nickname input');
  const h3 = welcome.querySelector('h3');
  socket.emit('nickname', input.value, (nickname) => {
    h3.innerText = `Hello, ${nickname}!`;
    nicknameForm.hidden = true;
    roomnameForm.hidden = false;
  });
}

// 2. enter_room Event
function roomnameSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector('#roomname input');
  roomName = input.value;
  socket.emit('enter_room', roomName, (userCount) => {
    welcome.hidden = true;
    room.hidden = false;
    printCount(userCount);
  });
}

// 3. send_msg Event
function msgSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  socket.emit('send_msg', roomName, input.value, (msg) => {
    myMessage(msg);
    input.value = '';
    input.focus();
  });
}

// 3-1. 모든 메시지 함수 (상대)
function addMessage(msg) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = msg;
  ul.append(li);
}
// 3-1. 메시지 함수 (본인)
function myMessage(msg) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = msg;
  li.className = 'myMsg';
  ul.append(li);
}
// 방 인원 출력하는 함수
function printCount(userCount) {
  const h3 = room.querySelector('h3');
  h3.innerText = `방이름: ${roomName} (${userCount}명)`;
}

nicknameForm.addEventListener('submit', nicknameSubmit);
roomnameForm.addEventListener('submit', roomnameSubmit);
msgForm.addEventListener('submit', msgSubmit);

// // 2. send_msg 이벤트 (상대)
socket.on('send_msg', addMessage);

// 누군가 방에 들어오면 실행되는 welcome 이벤트
socket.on('welcome', (user, userCount) => {
  addMessage(`${user}님이 방에 입장하셨습니다.`);
  printCount(userCount);
});
// 누군가 방에서 나가면 실행되는 closed 이벤트
socket.on('closed', (user, userCount) => {
  addMessage(`${user}님이 방에서 나갔습니다.`);
  printCount(userCount);
});
// 방 업데이트 room_change 이벤트
socket.on('room_change', (publicRooms) => {
  const roomList = welcome.querySelector('#roomlist');
  roomList.innerHTML = ''; // 모든 방 초기화
  publicRooms.forEach((publicRoom) => {
    const li = document.createElement('li');
    li.innerText = `${publicRoom.publicRoom} (${publicRoom.userCount})`;
    roomList.append(li);
  });
});
