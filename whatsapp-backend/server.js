import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
const app = express();
const port = process.env.PORT || 8000;
import Pusher from "pusher";
import cors from "cors";


// pusher config

const pusher = new Pusher({
  appId: "1463766",
  key: "b6637a6bdd90c42e95b6",
  secret: "481f0d3ad967a26520e5",
  cluster: "ap2",
  useTLS: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB is connected");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A changed occured",change);

    if(change.operationType === 'insert') {
        const messageDetails = change.fullDocument;
        pusher.trigger('messages','inserted',{
            name:messageDetails.name,
            message:messageDetails.message,
            timestamp:messageDetails.timestamp,
            received:messageDetails.received
        }
        )
    }else{
        console.log('Error triggred...Pusher')
    }
  });
});

// middleware
app.use(express.json());
// cors policy 
app.use(cors())

// cors headers 
// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
//     res.setHeader("Access-Control-Allow-Origin","*");
//     next();
// })
// 07k5Aw6x9jFYzbkl

const connection_url =
  "mongodb+srv://deepak:07k5Aw6x9jFYzbkl@cluster0.821uk6n.mongodb.net/mywhatsapp?retryWrites=true&w=majority";
// db connection
mongoose.connect(connection_url);

// routes
app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

// get all data

app.get("/messages/sync", (req, res) => {
  const dbMessage = req.body;

  Messages.find(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// post req

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// listening server

app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
