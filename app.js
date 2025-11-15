require("dotenv").config();
require("./models/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var booksRouter = require("./routes/books");
var commentsRouter = require("./routes/comments");
var externalBooksRouter = require("./routes/externalBooks");  

var app = express();

const cors = require("cors");
app.use(cors(/*{
  //origin: 'http://localhost:3001', // frontend Next.js
  //origin: ["http://localhost:3000","http://localhost:3001", "https://mnemosym-v2-frontend.vercel.app"],
  //credentials: true
}*/));


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/comments", commentsRouter);
app.use("/externalBooks", externalBooksRouter);


module.exports = app;
