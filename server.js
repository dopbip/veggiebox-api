require('dotenv').config();
const _ = require('lodash/lang')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('express-jwt');
const dayjs = require('dayjs');
const cookieParser = require('cookie-parser');
const jwtDecode = require('jwt-decode');
const mongoose = require('mongoose');

const {
    createToken,
    createTokenMobileApp,
    hashPassword,
    verifyPassword
  } = require('./util');
const user = require('./db/users');
const fruits = require('./db/fruits');
  const app = express()
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json());
  app.use(cookieParser());

  const port = process.env.PORT || 3001;
  app.get('/', (req, res) => {
    res.send('Holle from Team Dopbip!')
  })

  //Post unverified user
  app.post('/api/checkUser', async (req, res) => {
    const { phoneNumber } = req.body;
    try {  
      const userData = await user.find({phoneNumber:phoneNumber})
      
      if (_.isEmpty(userData)) {
        user.create({ phoneNumber }, async (error, data) => {
          if (error) {
            console.error(error);
            res.status(500).send('Something broke!');
          }
          res.status(201)       
        })
      } else {
        res.status(201)
      }
      
    }
    catch(e) {
      console.error(e)
    }
  })

  app.get('/api/getFruitsData', async (req, res) => {
    try {

      await fruits.find({ _id: "645fb3a8690f03930224820b" }, (error, data) => {
        if (error) {
          console.error(error);
          res.status(500).send('Something broke!');
        }
        console.log(data[0])
        res.status(200).json(data)
      })
      // const fruitsInStore = await fruits.find({_id: '645fb3a8690f03930224820b'})
      // console.log( fruits.find({_id: '645fb3a8690f03930224820b'}))
      // if (_.isEmpty(fruitsInStore)) {
      //   res.status(404).send('Out of stock')
      // } else {
      //   res.status(200).json(fruitsInStore)
      // }  //.lean().select("_id role")
      
    }
    catch(e) {
      console.error(e)
    }
  })

  async function connect() {
    try {
      mongoose.Promise = global.Promise;
      mongoose.connect(process.env.ATLAS_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      });
    } catch (err) {
      console.log('Mongoose error', err);
    }
    app.listen(port, () => {
      console.log("App is running on port " + port);
  });
  }
  
  connect();