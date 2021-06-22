// importing
const express = require("express");
const env = require("dotenv").config();
const mongoose = require("mongoose");
const Pusher = require("pusher");
const Messages = require("./dbmessages.js");
const User = require("./models/user.js");
const cors = require("cors");

// app config
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: "1222679",
  key: "fbe55a9d3a0f0d0df65e",
  secret: "e37c31fcbfcf180dcba3",
  cluster: "ap2",
  useTLS: true,
});

// pusher.trigger("my-channel", "my-event", {
//   message: "hello world",
// });
// middleware
app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });

//DB config
const connection_url = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.gwcvl.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`;
// const connection_url = `mongodb+srv://admin:moleconcept@cluster0.gwcvl.mongodb.net/whatsappdb?retryWrites=true&w=majority`;
mongoose
  .connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log("Database connected");
  });

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB is connected");
  const msgCollection = db.collection("mesagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    // console.log("A change occured", change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      console.log(messageDetails);
      // pusher.trigger("messages", "inserted", {
      //   name: messageDetails.name,
      //   message: messageDetails.message,
      //   toUser: messageDetails.toUser,
      //   fromUser: messageDetails.fromUser,

      // });
      pusher.trigger("messages", "inserted", messageDetails);
    } else {
      console.log("error triggering pusher");
    }
  });
});

//????

//api routes
app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

app.post("/messages/new", async (req, res) => {
  const dbMessage = req.body;
  let toUser = await User.findOne({
    _id: mongoose.Types.ObjectId(dbMessage.toUser),
  });
  let fromUser = await User.findOne({
    _id: mongoose.Types.ObjectId(dbMessage.fromUser),
  });
  // console.log("toUser:", toUser, "fromUser:", fromUser);
  // dbMessage.toUser = mongoose.Types.ObjectId(dbMessage.toUser);
  // dbMessage.fromUser = mongoose.Types.ObjectId(dbMessage.fromUser);
  dbMessage.toUser = toUser;
  dbMessage.fromUser = fromUser;
  // console.log("dbmessage:", dbMessage);
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).json(data);
    }
  });
});

app.get("/getAllUsers", (req, res) => {
  User.find({}, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).json(data);
    }
  });
});

app.get("/messages/sync", (req, res) => {
  Messages.find({}, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).json(data);
    }
  });
});

const authRoutes = require("./routes/auth.js");
app.use("/api", authRoutes);

//listener
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
