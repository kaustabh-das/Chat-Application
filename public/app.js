const socket = io("http://localhost:80");
const mszz_Form = document.querySelector("#input-container");
const mszz_input = document.getElementById("input");
const mssz_container = document.getElementById("mssz-container");
const room_container = document.getElementById("room_container");
const search_btn = document.getElementById("search-btn");
const search = document.getElementById("search");
const user_found_conatiner = document.querySelector(".user_container");

// if (room_container != null) {
//   sessionStorage.setItem("name", user_name);
// }
if (performance.navigation.type === 2) {
  location.reload(true);
}

//searching the id of a friend
search_btn.addEventListener("click", () => {
  user_found_conatiner.innerHTML = "";
  const search_value = search.value;
  if (search_value === id) {
    user_found_conatiner.innerHTML = "Invalid Id";
  } else {
    fetch_body = {
      search_value: search_value,
      user_name: user_name
    };
    // socket.emit("user-id", search_value, user_name);
    fetch("/userSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
      body: JSON.stringify(fetch_body)
    })
      .then(res => res.json())
      .then(res => {
        if (res.err === "400") {
          user_found_conatiner.innerHTML = res.mssz;
        } else {
          let other_user_name = res.other_user_name;
          let user = res.user_name;
          let RoomNo = res.RoomNo;
          let id = res.searched_id;
          // localStorage.setItem(RoomNo + "U", other_user_name);
          // localStorage.setItem(RoomNo + "N", user);
          const user_link = document.createElement("a");
          user_link.innerHTML = `<div class="user_found">
      <img src="member2.svg" class="member_icon">
      <div class="user_data">
      <p>Name: ${other_user_name}</p>
      <p>Id: ${id}</p>       
      </div>
      </div>`;
          const link = `/${RoomNo}`;
          user_link.href = link;
          user_found_conatiner.appendChild(user_link);
          render_on_room_creation(RoomNo);
        }
      });
  }
});

render_friends();

socket.on("user-friends", room => {
  // render_on_room_creation(room);
});

//For loading all friends in the dashboard /left column
socket.on("update-chat", (mssz, roomName) => {
  console.log(typeof parseInt(roomName));
  const roomCls = document.getElementsByClassName(roomName)[0];
  roomSpan =
    roomCls.firstElementChild.firstElementChild.lastElementChild
      .lastElementChild;
  roomSpan.textContent = mssz;
});

socket.on("room-created", resBody => {
  // let room = [{ name: resBody.RoomNo, user }];
  // RoomNo = room;
  console.log(resBody);
  room = resBody.RoomNo;
  user1 = resBody.user_name;
  user2 = resBody.other_user_name;
  mssz = "Welcome";
  const _div_exist = document.getElementsByClassName(room)[0];
  // console.log("index" + index);
  if (_div_exist != null) {
    console.log("I'm the culprite");
  } else {
    const user_div = document.createElement("div");
    user_div.className = room;
    const user_link = document.createElement("a");
    if (user_name === user1) {
      user_link.innerHTML = `<div class="room">
          <img src="member2.svg" class="member_icon">
          <div class="room_cnt">
          <p>${user2}</p>       
          <span>
          ${mssz}
          </span>
          </div>
          </div>`;
    } else {
      user_link.innerHTML = `<div class="room">
          <img src="member2.svg" class="member_icon">
          <div class="room_cnt">
          <p>${user1}</p>
          <span>
          ${mssz}
          </span>
          </div>
          </div>`;
    }
    const link = `/${room}`;
    user_link.href = link;
    user_div.appendChild(user_link);
    room_container.appendChild(user_div);
  }
});
function render_friends() {
  let RoomNo;
  let user_id = parseInt(id);
  // console.log("Outside for each");
  console.log(rooms);

  Object.keys(rooms).forEach(Room => {
    room = Room;
    console.log(Room);

    RoomNo = room;
    console.log(rooms[Room].mssz);
    const div_exist = document.getElementsByClassName(room)[0];
    // console.log("index" + index);
    if (div_exist != null) {
      console.log("I'm the culprite");
    } else {
      const user_div = document.createElement("div");
      user_div.className = room;
      const user_link = document.createElement("a");
      if (rooms[RoomNo].mssz != "Welcome") {
        if (user_name === rooms[Room].user1) {
          user_link.innerHTML = `<div class="room">
          <img src="member2.svg" class="member_icon">
          <div class="room_cnt">
          <p>${rooms[Room].user2}</p>       
          <span>
          ${rooms[Room].mssz}
          </span>
          </div>
          </div>`;
        } else {
          user_link.innerHTML = `<div class="room">
          <img src="member2.svg" class="member_icon">
          <div class="room_cnt">
          <p>${rooms[Room].user1}</p>
          <span>
          ${rooms[Room].mssz}
          </span>
          </div>
          </div>`;
        }
      } else {
        if (user_name === rooms[Room].user1) {
          user_link.innerHTML = `<div class="room">
          <img src="member2.svg" class="member_icon">
          <div class="room_cnt">
          <p>${rooms[Room].user2}</p>       
          <span>
          </span>
          </div>
          </div>`;
        } else {
          user_link.innerHTML = `<div class="room">
          <img src="member2.svg" class="member_icon">
          <div class="room_cnt">
          <p>${rooms[Room].user1}</p>
          <span>
          </span>
          </div>
          </div>`;
        }
      }

      const link = `/${room}`;
      user_link.href = link;
      user_div.appendChild(user_link);
      room_container.appendChild(user_div);
    }
  });
}

// function render_on_room_creation(room) {
//   let user_id = parseInt(id);
//   console.log("Outside for each");
//   let match1 = room[0] + room[1] + room[2] + room[3];
//   let match2 = room[4] + room[5] + room[6] + room[7];
//   if (user_id === parseInt(match1) || user_id === parseInt(match2)) {
//     RoomNo = room;
//     const user_div = document.createElement("div");
//     user_div.className = room;
//     const user_link = document.createElement("a");
//     const div_exist = document.getElementsByClassName(room)[0];
//     if (div_exist != null);
//     else {
//       if (user_name === localStorage.getItem(room + "U"))
//         user_link.innerHTML = `<div class="room">
//         <img src="member2.svg" class="member_icon">
//         <div class="room_cnt">
//         <p>${localStorage.getItem(room + "N")}</p>
//         <span>
//         </span>
//         </div>
//         </div>`;
//       else
//         user_link.innerHTML = `<div class="room">
//         <img src="member2.svg" class="member_icon">
//         <div class="room_cnt">
//         <p>${localStorage.getItem(room + "U")}</p>
//         <span>
//         </span>
//         </div>
//         </div>`;
//       const link = `/${room}`;
//       user_link.href = link;
//       user_div.appendChild(user_link);
//       room_container.appendChild(user_div);
//     }
//   }
// }

//Database
//mongodb+srv://Chat-App:chatapp123@dbtest-c6oyq.mongodb.net/test?retryWrites=true&w=majority
//SECRET=dsajkvghvbgvhjsdavkjdbvkhcjbdskvhdsjkvbjksdjsfhvjkfdgsfgvj
