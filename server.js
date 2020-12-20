import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jsonwebtoken from "jsonwebtoken";
dotenv.config();
const jwt = jsonwebtoken;
const app = express();
app.use(cors());
app.use(express.json());
app.options('*', cors())
const port = 5000;
const booksList = [
  {
    username: "Alice",
    books: [
      {author:"something1",title:"1Lolita", score: 10, readTime:3},
      {author:"something2",title:"2Lolita", score: 8, readTime:3},
      {author:"something3",title:"3Lolita", score: 7, readTime:8},
      {author:"something4",title:"4Lolita", score: 9, readTime:7},
      {author:"something5",title:"5Lolita", score: 9, readTime:5},
      {author:"something6",title:"6Lolita", score: 5, readTime:20},
      {author:"something7",title:"7Lolita", score: 8, readTime:10},
      {author:"something8",title:"8Lolita", score: 5, readTime:7},
      {author:"something9",title:"9Lolita", score: 5, readTime:7},
      {author:"something10",title:"10Lolita", score: 8, readTime:6},
      {author:"something11",title:"11Lolita", score: 9, readTime:5} , 
      {author:"something12",title:"12Lolita", score: 9, readTime:5}  
  ],
  },
  {
    username: "Bob",
    books: [{title:"BobsLolita", score: 9, readTime:1}],
  },
];

let refreshTokens = [];

app.get("/books", authenticateToken, (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
  res.json(booksList.find((book) => book.username === req.user.username).books);
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) return res / sendstatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/login", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
  // Authenticate user
  const user = { username: req.body.username, password: req.body.password };
  if (!booksList.map(book=>book.username).includes(user.username)) return res.sendStatus(401);

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(
    { username: user.username },
    process.env.REFRESH_TOKEN_SECRET
  );
  refreshTokens.push(refreshToken);
  res.json({
    user: {
      username: user.username,
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });
});

function generateAccessToken(user) {
  //only serialise username
  return jwt.sign(
    { username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (token == null) return res.sendStatus(401); // token undefined
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // we see you have a token but it's no longer valid
    req.user = user; // the username we serialised
    next();
  });
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
