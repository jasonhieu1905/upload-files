const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const http = require("http");

const app = express();

const path = require("path");
const directoryPath = path.join(__dirname, "uploads");
app.use(express.static(directoryPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//start app
const hostname = "https://hieudoan-upload-files.herokuapp.com";
// const hostname = "http://localhost";
const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`App is listening on port ${port}.`)
);

app.get("/index.html", function (req, res) {
  res.sendFile(__dirname + "/" + "index.html");
});

// 1. use multer
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); //image storage path
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("file");

app.post("/files/add", upload, function (req, res, next) {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }

  res.json({ redirectUrl: `${hostname}/index.html` });
});

app.post("/files/add/hasNoRedirectUrl", upload, function (req, res, next) {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }

  res.json({});
});

// 2. use connect-multiparty
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart({ uploadDir: "./uploads" });
app.post("/files/add2", multipartMiddleware, (req, res) => {
  console.log(req.body);
  res.json({
    message: "File uploaded successfully",
  });
});

// 3. list all files
app.get("/files", function (req, res, next) {
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    res.json(files);
  });
});

// 4.download File

app.post("/file/download", function (req, res) {
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    const name = files.find((_, index) => {
      return index == req.body.id;
    });
    res.json({ url: `${hostname}/${name}` });
  });
});
