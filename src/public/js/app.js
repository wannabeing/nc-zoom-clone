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
  socket.emit('nickname', input.value, (val) => {
    console.log(`nicknameCreated: ${val}`);
    h3.innerText = `Hello, ${val}!`;
    nicknameForm.hidden = true;
    roomnameForm.hidden = false;
  });
}

// 2. enter_room Event
function roomnameSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector('#roomname input');
  roomName = input.value;
  socket.emit('enter_room', roomName, () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `${roomName}방에 입장하였습니다.`;
  });
}

// 3. send_msg Event
function msgSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  socket.emit('send_msg', roomName, input.value, (msg) => {
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = msg;
    li.className = 'myMsg';
    ul.append(li);
  });
}

// 3-1. 모든 메시지 함수 (상대)
function addMessage(msg) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = msg;
  ul.append(li);
}

nicknameForm.addEventListener('submit', nicknameSubmit);
roomnameForm.addEventListener('submit', roomnameSubmit);
msgForm.addEventListener('submit', msgSubmit);

// // 2. send_msg 이벤트 (상대)
socket.on('send_msg', addMessage);

// 누군가 방에 들어오면 실행되는 welcome 이벤트
socket.on('welcome', (user) => {
  addMessage(`${user}님이 방에 입장하셨습니다.`);
});
// 누군가 방에서 나가면 실행되는 closed 이벤트
socket.on('closed', (user) => {
  addMessage(`${user}님이 방에서 나갔습니다.`);
});

// const welcomeForm = welcome.querySelector('form');

// // 3. nickname 함수
// function nicknameSubmit(event) {
//   event.preventDefault();
//   const input = welcome.querySelector('#nickname input');
//   socket.emit('nickname', input.value);
// }

// let roomName;

// // 1. enter room 함수
// function welcomeSubmit(event) {
//   event.preventDefault();
//   const input = welcomeForm.querySelector('input');
//   roomName = input.value; // 룸 이름 저장
//   socket.emit('enter_room', input.value, showRoom); // 서버에 socketIO 이벤트 (enter_room) 전달
//   input.value = ''; // input 초기화
// }
// // 2. send_msg 함수
// function msgSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector('#msg input');
//   socket.emit('send_msg', roomName, input.value, showMsg); // 서버에 socketIO 이벤트 (send_msg) 전달
//   input.value = ''; // input 초기화
// }

// // 2-1. 서버에 전달할 때 사용하는 함수 (본인)
// function showMsg(msg) {
//   const ul = room.querySelector('ul');
//   const li = document.createElement('li');
//   li.innerText = msg;
//   li.className = 'myMsg';
//   ul.append(li);
// }

// // 1-1. 서버에 전달할 때 사용하는 함수
// function showRoom() {
//   welcome.hidden = true;
//   room.hidden = false;
//   const joinMsg = room.querySelector('h3');
//   joinMsg.innerText = `[${roomName}] 방에 입장하셨습니다.`;

//   // 2. send_msg 이벤트
//   const msgForm = room.querySelector('#msg');
//   msgForm.addEventListener('submit', msgSubmit);

//   //3. nickname 이벤트
//   const nicknameForm = room.querySelector('#nickname');
//   nicknameForm.addEventListener('submit', nicknameSubmit);
// }

// // 1. enter room 이벤트
// welcomeForm.addEventListener('submit', welcomeSubmit);
