const socket = io("http://localhost:80");
const mszz_Form = document.querySelector("#input-container");
const mszz_input = document.getElementById("input");
const mssz_container = document.getElementById("mssz-container");
const room_container = document.getElementById("room_container");
//const user_name = sessionStorage.getItem("name");

//User added to the room
socket.emit("user-added", user_name, roomName);

const other_user_name = document.getElementById("user_name");
if (user_name === Users["current"])
  other_user_name.textContent = Users["other"];
else other_user_name.textContent = Users["current"];

let room = rooms;
for (let i = 0; i < room.length; i++) {
  if (room[i].name === user_name) {
    add_mszz(room[i].mssz, "_you");
  } else {
    add_mszz(room[i].mssz, "_other");
  }
}

mszz_Form.addEventListener("submit", ev => {
  ev.preventDefault();
  const mszz = mszz_input.value;
  socket.emit("send-mssz-server", mszz, roomName, user_name);
  add_mszz(`${mszz}`, "_you");
  mszz_input.value = " ";
});

socket.on("chat-mssz", data => {
  add_mszz(`${data.mssz}`, "_other");
});

function add_mszz(data, user) {
  mszz_div = document.createElement("div");
  mszz_span = document.createElement("span");
  mszz_span.innerText = data;
  mszz_span.className = `mszz_span_cls${user}`;
  mszz_div.className = `mszz_div_cls${user}`;
  mszz_div.appendChild(mszz_span);
  mssz_container.appendChild(mszz_div);
}
