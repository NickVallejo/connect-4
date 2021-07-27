require("dotenv").config()
const express = require('express')
const session = require("express-session")
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const MongoStore = require("connect-mongo")
const { Session } = require("express-session")
const { uuid } = require('uuidv4');
const app = express()
const port = 3200

const io = require("socket.io")(3100, {
  cors: {
    origin: ["http://localhost:3200"]
  }
})

//middleware & view engine setup
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

io.on("connection", socket => {
  console.log('Socket connection made:', socket.id)
})

const db_connect = mongoose.createConnection(
  'mongodb+srv://nicovallejo:weareborg@cluster0.p0vwz.azure.mongodb.net/connect-4?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    try {
      console.log('Connected to database.')
    }
    catch (err) {
      throw err;
    }
  })

const Player = db_connect.model('Players', require('./models/player'), "players")
const Room = db_connect.model('Rooms', require('./models/room'), "rooms")

//! CREATES A STORAGE COLLECTION FOR SESSIONS USING THE DATABASE CONNECTION ESTABLISHED ABOVE
const sessionStore = MongoStore.create({
  mongoUrl: 'mongodb+srv://nicovallejo:weareborg@cluster0.p0vwz.azure.mongodb.net/connect-4?retryWrites=true&w=majority',
  collection: 'sessions'
})

//! ESTABLISHES THE SESSION MIDDLEWARE THAT PLANTS A SESSION COOKIE ON THE BRWOSER & ADDS A NEW ENTRY TO SESSION STORAGE ON THE SERVER
app.use(
  session({
    secret: 'GroupIronManWhen?@2022',
    resave: true,
    saveUninitialized: true,
    store: sessionStore, //uses the session storage established with express-session and connect-mongo modules
    strict: false,
    cookie: {
      expires: new Date(253402300000000),
      sameSite: true,
      secure: false
    },
  })
)

// app.use(userPackage)

app.listen(port, (err) => {
  try {
    console.log("Connected to port " + port)
  } catch (err) {
    throw err
  }
})

app.get('/', (req, res) => {
  const dashView = req.session.userId ? 'auth' : 'no-auth'
  const userInfo = req.session.userId ? req.session.userInfo : false
  console.log(req.session.userInfo)
  res.render(dashView, { userInfo: userInfo, layout: './layouts/dashboard' })
  // console.log(req.session.userId)
})

app.post('/api/username', async (req, res) => {
  const { username } = req.body

  if (!username) { return }

  userFound = await Player.findOne({ username })

  if (userFound) {
    res.send({ type: 'err', msg: 'Username taken.' })
  } else {
    console.log(username)
    const newUser = new Player({ username })
    newUser.save()
    req.session.userId = newUser._id
    req.session.save(() => {
      req.session.userInfo = { username: newUser.username, points: newUser.points, xpGoal: 100 }
      res.send({ type: 'succ', msg: 'Username set.', user: req.session.userInfo })
    });
  }
})

app.get('/api/new-room', async (req, res) => {
  try{
    const player = await Player.findById(req.session.userId)
    if(!player){return}
    const roomFound = await Room.findOne({inviteUser: player._id})
    if(roomFound){
      await roomFound.remove()
    }

    const room = new Room({
      roomUrl: uuid(),
      inviteUser: player._id
    })
    room.save(() => {
      res.send(room)
    })
  } catch(err){
    throw err;
  }
})

app.get('/destroy', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

app.post('/api/win', async (req, res) => {
  const { pointsRes, winState } = req.body
  try {
    const user = await Player.findById(req.session.userId)
    if (user) {
      if(winState){
        user.points = user.points + pointsRes > 1500 ?
        1500 : user.points + pointsRes
      } else{
        user.points = user.points - pointsRes < 0 ? 
        0 : user.points - pointsRes
      }
      user.save(() => {
        req.session.userInfo.points = user.points
        const goal = xpGoal(req.session.userInfo.points, winState)
        const newGoal = goal !== req.session.userInfo.xpGoal ? goal : false
        req.session.userInfo.xpGoal = goal !== req.session.userInfo.xpGoal ? goal : req.session.userInfo.xpGoal
        res.send({ points: req.session.userInfo.points, newGoal, goal })
      })
    }
  } catch (err) {
    throw err;
  }
})

app.get('/:room', async (req, res) => {
  try{
    const {room} = req.params
    const roomFound = await Room.findOne({roomUrl: room})
    if(!roomFound){res.send('404'); return}
    res.render('auth-vs', { userInfo: req.session.userInfo, layout: './layouts/dashboard' })
  } catch(err){
    throw err
  }
})

function xpGoal(points, winState) {

if(winState){
  if (points >= 1000) {
    return 1500;
  }
  if (points >= 500) {
    return 1000;
  }
  if (points >= 250) {
    return 500
  }
  if (points >= 100) {
    return 250
  }
  else {
    return 100
  }
} else{
  if(points < 100){
    return 100 
  }
  if(points < 250){
    return 250
  }
  if(points < 500){
    return 500
  }
  if(points < 1000){
    return 1000
  }
  if(points < 1500){
    return 1500
  }
}
}