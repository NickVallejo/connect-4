require("dotenv").config()
const express = require('express')
const session = require("express-session")
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const MongoStore = require("connect-mongo")
const { Session } = require("express-session")
const app = express()

const port = 3100

//middleware & view engine setup
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const db_connect = mongoose.createConnection(
    process.env.db_connect,
    { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        try{
            console.log('Connected to database.')
        }
      catch(err){
          throw err;
      }
    })

const Player = db_connect.model('Players', require('./models/player'), "players")

//! CREATES A STORAGE COLLECTION FOR SESSIONS USING THE DATABASE CONNECTION ESTABLISHED ABOVE
const sessionStore = MongoStore.create({
    mongoUrl: process.env.db_connect,
    collection: process.env.SESSION_COLLECTION
  })
  
  //! ESTABLISHES THE SESSION MIDDLEWARE THAT PLANTS A SESSION COOKIE ON THE BRWOSER & ADDS A NEW ENTRY TO SESSION STORAGE ON THE SERVER
  app.use(
    session({
      secret: process.env.SESS_SECRET,
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


async function userPackage(req, res, next){
  // if(!req.session.userId || req.session.userInfo){next()}
  try{
    if(req.session.userId){
      const user = await Player.findById(req.session.userId)
      req.session.userInfo.points = user.points
      req.session.save()
      
    } 
    next()
  } 
  catch(err){
    throw err;
  }
}

app.get('/', (req, res) => {
    const dashView = req.session.userId ? 'auth' : 'no-auth'
    const userInfo = req.session.userId ? req.session.userInfo : false
    console.log(req.session.userInfo)
    console.log(dashView)
    res.render(dashView, { userInfo: userInfo, layout: './layouts/dashboard' })
    // console.log(req.session.userId)
})

app.post('/api/username', async (req, res) => {
  const {username} = req.body

  if(!username){return}

  userFound = await Player.findOne({username})

  if(userFound){
    res.send({type: 'err', msg: 'Username taken.'})
  } else{
    console.log(username)
    const newUser = new Player({username})
    newUser.save()
    req.session.userId = newUser._id
    req.session.save();
    req.session.userInfo = {username: newUser.username, points: newUser.points}
    res.send({type: 'succ', msg: 'Username set.', user: req.session.userInfo})
  }
})

app.get('/destroy', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.post('/api/win', async (req, res) => {
  const {pointsWon} = req.body
  try{
    const user = await Player.findById(req.session.userId)
    if(user){
      user.points += pointsWon
      user.save(() => {
        req.session.userInfo.points = user.points
        res.send({points: req.session.userInfo.points})
      })
    }
  } catch(err){
    throw err;
  }
}) 