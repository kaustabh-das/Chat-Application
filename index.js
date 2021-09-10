////dbpass=chatapp123
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Users = require("./database/Users");
const Rooms = require("./database/Rooms");
const Msszs_schema = require("./database/Msszs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
let messages = []; //[{ mssz: "Welcome",name: "Biswajit"}]

const auth = require("./auth");
const ifLoggedIn = require("./ifLoggedIn");

let Users_In_room = {};
let room_models = {};
const length = {};
let count = 1000;
// const people = {
//   //Biswajit:1000,
// };
let roooms = [];
const people = []; //[{name:name , id:ID}]

dotenv.config();
app.use(cookieParser());
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("style"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//const rooms = []; //{ name:10001001  msz_Collection:mongoose.model(room,schema)}
//room1: { '100010001': { users:{ } }};

// rooms["room1"] = { users: {} };

mongoose.connect(
  process.env.MONGO,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log("DB Connected");
  }
);
//////////////////////////////////////////////////////
app.get("/", ifLoggedIn, (req, res) => {
  res.render("signup");
});
app.post("/signup", async (req, res) => {
  //if id of a people exists
  let name = await Users.findOne({ name: req.body.name });
  if (name != null) {
    console.log("Name already exist");
    res.redirect("/");
  } else {
    await Users.countDocuments({}, (err, Count) => {
      if (err) console.log(err);
      else {
        count = 1000 + Count;
      }
    });
    let salt = await bcrypt.genSalt(10);
    let hass_pass = await bcrypt.hash(req.body.password, salt);
    let user = new Users({
      name: req.body.name,
      password: hass_pass,
      id: count
    });

    try {
      let saved_user = await user.save();
      res.redirect("login");
    } catch (err) {
      console.log(err);
    }
  }
});
app.get("/login", ifLoggedIn, (req, res) => {
  res.render("login");
});
app.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("login");
});
app.post("/login", async (req, res) => {
  const user = await Users.findOne({ name: req.body.name });
  if (user != null) {
    let ValidPass = await bcrypt.compare(req.body.password, user.password);
    if (!ValidPass) res.send("Incorrect password");
    else {
      let token = jwt.sign(
        { name: req.body.name, id: user.id },
        process.env.SECRET
      );
      res.cookie("token", token).redirect("home");
    }
  } else {
    res.send("no user found");
  }
});

app.get("/home", auth, async (req, res) => {
  ////let person = people.find(Person => Person.name === req.params.name);
  let user_name = req.user.name;
  let person = await Users.findOne({ name: user_name });
  // let p = await Users.find({ name: /person.id/i })
  //console.log(user_name);
  let Roooms = {};

  if (person != null) {
    //console.log("Test");
    await Rooms.find({}, (err, rooms) => {
      //console.log("Hello");
      if (err) console.log(err);
      rooms.map(room => {
        //console.log(room);
        if (!roooms.find(Room => Room.name === room.name)) {
          //console.log(room);
          roooms.push(room);
        }
      });
      //console.log(roooms);
      async function f() {
        for (const room of roooms) {
          //console.log("test2");
          room_models[room.name] = mongoose.model(room.name, Msszs_schema);
          //console.log("test3");
          if (room.user1 === user_name || room.user2 === user_name) {
            //console.log(room.name);

            let lst_txt = await room_models[room.name]
              .findOne()
              .sort({ field: "asc", _id: -1 })
              .limit(1);
            //console.log("test5");

            if (lst_txt != null) {
              Roooms[room.name] = {};
              Roooms[room.name].mssz = lst_txt.mssz;
              Roooms[room.name].user1 = room.user1;
              Roooms[room.name].user2 = room.user2;
            }
            //console.log(room.name);
          }
          //console.log("test6");

          //dashboard page
        }
        // console.log("/Hii/");
        res.render("index", {
          rooms: Roooms,
          name: user_name,
          id: person.id
        });
      }
      //console.log(Roooms);
      f();
    });

    //console.log(roooms);

    console.log("h");
  }

  ////For loading all friends in the dashboard /left column
  ////io.emit("user-friends", rooms, people, messages);
});

app.post("/userSearch", async (req, res) => {
  // 3console.log("req.body:" + req.body.search_value + req.body.user_name);
  let searched_id = req.body.search_value;
  let user_name = req.body.user_name;
  let People = await Users.findOne({ id: parseInt(searched_id) });
  let people_id = await Users.findOne({ name: user_name });

  if (People != null && people_id != null) {
    let other_user_name = People.name;
    const RoomNo = people_id.id + searched_id;
    const RoomNo_invert = searched_id + people_id.id;
    let room = await Rooms.findOne({ name: RoomNo });
    let room_inv = await Rooms.findOne({ name: RoomNo_invert });
    if (room != null) {
      console.log("Room has been already created ");
      let Body = { err: "400", mssz: "Already Created" };
      res.send(Body);
    } else if (room_inv != null) {
      console.log("Other person already created the room");
      let Body = { err: "400", mssz: "Already Created" };
      res.send(Body);
    } else {
      //// let obj = { name: RoomNo, msz_Collection: [] };
      // // rooms.push(obj);
      let room = new Rooms({
        name: RoomNo,
        user1: user_name,
        user2: other_user_name
      });
      try {
        let saved_room = await room.save();
        room_models[RoomNo] = mongoose.model(RoomNo, Msszs_schema);
        const Mssz = new room_models[RoomNo]({
          mssz: "Welcome",
          name: "Admin"
        });

        saved_Mssz = await Mssz.save();

        // room_models[RoomNo] = mongoose.model(RoomNo, Msszs_schema);
        //? messages[RoomNo] = {};
        //console.log(rooms + saved_room);
        // Users_In_room[RoomNo]["other"] = other_user_name;
        // Users_In_room[RoomNo]["current"] = user_name;
        // io.emit("user-found", other_user_name, user_name, RoomNo, searched_id);
        resBody = {
          other_user_name: other_user_name,
          user_name: user_name,
          RoomNo: RoomNo,
          searched_id: searched_id
        };
        io.emit("room-created", resBody);
        res.send(resBody);
        // console.log("Hiiii" + People + "//" + name);}
      } catch (err) {
        console.log(err);
      }
    }
  }
});

app.get("/:room", auth, async (req, res) => {
  //!If room doesnot exists
  //! if (rooms[req.params.room] == null) {
  // !  return res.redirect("/");
  //! }
  //Specific room page
  // console.log("1");
  // console.log(room_models);
  let room = await Rooms.findOne({ name: req.params.room });
  let user_name = req.user.name;
  try {
    //console.log(x);
    //x++;
    //console.log(room_models["10011000"]);
    if (room != null) {
      let rooms = [];
      Users_In_room["current"] = user_name;
      if (room.user1 === user_name) Users_In_room["other"] = room.user2;
      else Users_In_room["other"] = room.user1;

      await room_models[room.name].find({}, (err, msszs) => {
        if (err) console.log(err);

        msszs.map(msz => {
          obj = { mssz: msz.mssz, name: msz.name };
          rooms.push(obj);
        });
        // console.log(x);
        // x++;
        res.render("room", {
          roomName: room.name,
          messages: messages,
          Users: Users_In_room,
          rooms: rooms,
          user_name: user_name
        });
      });
      //console.log(rooms);
    }
  } catch (err) {
    console.log(err);
  }
});
server.listen(process.env.PORT || 80, () => {
  console.log("server is running");
});
//////////////////////////////////////////////////////

io.on("connection", socket => {
  console.log("IN");

  ////////Room///////////////////////////////
  //user added in room
  socket.on("user-added", (name, roomName) => {
    socket.join(roomName);
    //// rooms[roomName].users[socket.id] = name;
    socket.broadcast.emit("user-friends", roomName);
    //// socket.to(roomName).broadcast.emit("user-connected", name);
  });

  socket.on("send-mssz-server", async (mssz, roomName, user_name) => {
    //// length[roomName] = Object.keys(messages[roomName]).length;
    ////let room = rooms.find(room => room.name === roomName);
    ////length[roomName] = room.msz_Collection.length;

    //length[roomName]++;
    //// messages_obj = {
    ////   mssz: mssz,
    ////   name: user_name
    //// };
    //// room.msz_Collection.push(messages_obj);
    ///// console.log(room.msz_Collection);
    // console.log(room_models);
    const Mssz = new room_models[roomName]({
      mssz: mssz,
      name: user_name
    });

    try {
      saved_Mssz = await Mssz.save();
      socket.broadcast.emit("update-chat", mssz, roomName, user_name);
      socket.to(roomName).broadcast.emit("chat-mssz", {
        mssz: mssz,
        name: user_name
      });
    } catch (err) {
      console.log(err);
    }
  });
});
