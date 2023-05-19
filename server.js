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
const { parseInt } = require('lodash');
const {
    createToken,
    createTokenMobileApp,
    hashPassword,
    verifyPassword
  } = require('./util');
const user = require('./db/users');
const fruits = require('./db/fruits');
const orders = require('./db/orders')
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

  app.get('/api/products/category/fruit_category', async (req, res) => {
    try {
      const fruitsInStore = await fruits.find({})
      console.log(fruits.find({}))
      if (_.isEmpty(fruitsInStore)) {
        res.status(404).send('Out of stock')
      } else {
        res.status(200).json(fruitsInStore)
      }  //.lean().select("_id role")
      
    }
    catch(e) {
      console.error(e)
    }
  })

  app.post('/api/products/price/fruit_category', async(req,res) => {
    let  data = req.body
    console.log(data)
        let replyMsg = ``
        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          let fruitName = element[0]
          let itemPacksQty = element[1]
          let itemPrice
          await fruits.find({key_word: { $in: [fruitName.toLowerCase()]}}, (error, queryData) => {
            if(error) {
              console.error(error)
              res.status(500).send('Something brokee!');
            }
            if(parseInt(itemPacksQty) < 1 || itemPacksQty == null) {
              itemPrice = parseInt(queryData[0].pack_price)
              replyMsg += `1 packs of ${queryData[0].packed_items} ${fruitName} will cost k${itemPrice}\n`
            } else
              {console.log(queryData)
              itemPrice = parseInt(queryData[0].pack_price) * parseInt(itemPacksQty)
              replyMsg += `${itemPacksQty} packs of ${queryData[0].packed_items} ${fruitName} will cost k${itemPrice}\n`}
          })
        } 
        console.log(replyMsg)
        res.status(200).send(replyMsg)
    res.status(200)
  })

  app.post('/api/products/saveOrder', async (req, res) => {
    const data = req.body
    console.log(JSON.stringify(data, undefined,2))
    console.log(data['oderdetails']['cart'])
    console.log('################')
    const {phoneNumber} = data['oderdetails']
    const {location} = data['oderdetails']
    let orderedItemList = []
    let totalAmount = 0
    for (let i = 0; i < data['oderdetails']['cart'].length; i++) {
      const element = data[i];
      console.log(element)
      console.log('################')
      let itemName = element[0]
      let itemPacksQty = element[1]
      let itemPrice
      await fruits.find({key_word: { $in: [itemName.toLowerCase()]}}, async(error, queryData) => {
        if(error) {
          console.error(error)
          res.status(500).send('Something brokee!');
        }
        if(parseInt(itemPacksQty) < 1 || itemPacksQty == null) {
          itemPrice = parseInt(queryData[0].pack_price)
          //replyMsg += `1 packs of ${queryData[0].packed_items} ${itemName} will cost k${itemPrice}\n`
          orderedItemList.push({
            "itemName": itemName,
            "itemPrice": itemPrice,
            "itemPacksQty": itemPacksQty
          })
          totalAmount += itemPrice
        } else
          {console.log(queryData)
          itemPrice = parseInt(queryData[0].pack_price) * parseInt(itemPacksQty)
          //replyMsg += `${itemPacksQty} packs of ${queryData[0].packed_items} ${itemName} will cost k${itemPrice}\n`
          orderedItemList.push({
            "itemName": itemName,
            "itemPrice": itemPrice,
            "itemPacksQty": itemPacksQty
          })
          totalAmount += itemPrice
        }
      })
      // Create order
      const orderDetails = Object.assign({}, {
        phoneNumber,
        location,
        itemOrdered: orderedItemList,
        totalAmount: totalAmount
      })
      const odersDocument = await orders.create(orderDetails)
      odersDocument.save()
        .then(()=> {
          res.status(200).json({orderedItemList})
        })
        .catch((error) => {
          console.log(error)
          res.status(500).send("Something nt right, we are looking into it")
        })

    } 
    res.status(200).json(data)
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