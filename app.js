const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");

const app = express();

// Middlewares
app.set("view engine", "ejs");
// express.urlencoded({ extended: false });
// express.json;

// app.use(express.static(path.join(__dirname)));

// Importing Config keys
const key = require("./config/key");

// Importing Routes
// const home = require("./route/homeRoute");

// MongoDb Connection
const conn = mongoose.createConnection(
  key.MongoURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  err => {
    if (err) {
      console.log(err);
    }
    console.log("Mongodb Connected");
  }
);

// Importing model
require("./model/Signup");

const Signup = conn.model("signup");

let gfs;

//init gfs
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// creating the storage engine
const storage = new GridFsStorage({
  url: key.MongoURL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// Using Route
// app.use("/", home);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/uploads", (req, res) => {
  Signup.findOne().then(signup => {
    if (signup) {
      console.log(signup);
      gfs.files.findOne(
        { filename: "43e3c00e249fe1d034970eba298ddbe9.jpg" },
        (err, file) => {
          var readstream = gfs.createReadStream(
            "43e3c00e249fe1d034970eba298ddbe9.jpg"
          );
          readstream.pipe(res);
        }
      );
    }
  });
});

app.post("/uploads", upload.single("file"), (req, res) => {
  const { name, username, email, password } = req.body;
  console.log(req.file);
  console.log(req.file.filename);

  const newSignup = {
    name,
    username,
    email,
    password,
    image: req.file.filename
  };

  new Signup(newSignup).save().then(() => {
    console.log("successful");
    res.redirect("/");
  });
});

// Connection port
const port = 5000;

app.listen(port, () => {
  console.log(`App started at port ${port} `);
});

// id: 5e93ddb0f67a8b04e8e2d105,
//   filename: '43e3c00e249fe1d034970eba298ddbe9.jpg',
