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
const items = require('./db/items');
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
            res.status(500).send('Something bro00ooke!🤖⚡. We are looking into it\nPlease again later');
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

  app.get('/api/all_items', async (req, res) => {
    try {
      const itemsInStore = await items.find({qty_in_store: {$gt: 0}})
      console.log(items.find({}))
      if (_.isEmpty(itemsInStore)) {
        res.status(404).send('Out of stock')
      } else {
        res.status(200).json(itemsInStore)
      }  //.lean().select("_id role")
      
    }
    catch(e) {
      console.error(e)
    }
  })

  app.post('/api/products/price', async(req,res) => {
    let  data = req.body
    console.log(data)
        let replyMsg = ``
        for (let i = 0; i < data.length; i++) {
         
          const element = data[i];
          let itemName = element[0]
          let itemPacksQty = element[1]
          let itemPrice
          try {
            const queryData = await items
              .find({
                $and: [
                  { key_word: { $in: [itemName.replaceAll(" ", "").toLowerCase()] } },
                  { qty_in_store: { $gt: 0 } }
                ]
              })
              .exec();
              if (_.isEmpty(queryData)) {
                replyMsg += `${itemName} _out of stock, will notify you when available._`
              } else {
                if (parseInt(itemPacksQty) < 1 || itemPacksQty == null) {
                  itemPrice = parseInt(queryData[0].pack_price);
                  replyMsg += `1 ${queryData[0].package_type} of ${queryData[0].packed_items} ${itemName} will cost k${itemPrice}\n`;
                } else {
                  console.log(queryData);
                  itemPrice = parseInt(queryData[0].pack_price) * parseInt(itemPacksQty);
                  replyMsg += `${itemPacksQty} ${queryData[0].package_type} of ${queryData[0].packed_items} ${itemName} will cost k${itemPrice}\n`;
                }
              }
           
          } catch (error) {
            console.error(error);
            res.status(500).send('Something bro00ooke!🤖⚡. We are looking into it\nPlease again later');
          }
          
        } 
        console.log(replyMsg)
        res.status(200).send(replyMsg)
    res.status(200)
  })

  app.post('/api/products/saveOrder', async (req, res) => {
    const data = req.body
    console.log(JSON.stringify(data, undefined,2))
    console.log(data['oderdetails']['cart'])
    console.log('################000')
    const {phoneNumber} = data['oderdetails']
    const {location} = data['oderdetails']
    let orderedItemList = []
    let totalAmount = 0
    for (let i = 0; i < data['oderdetails']['cart'].length; i++) {
      const element = data['oderdetails']['cart'][i];
      console.log(element)
      console.log('################')
      let itemName = element[0]
      let itemPacksQty = element[1]
      let itemPrice
      let packageType

      try {
        const queryData = await items.find({ key_word: { $in: [itemName.replaceAll(" ", "").toLowerCase()] } }).exec();
        
        if (parseInt(itemPacksQty) < 1 || itemPacksQty == null) {
          itemPrice = parseInt(queryData[0].pack_price);
          packageType = queryData[0].package_type
          orderedItemList.push({
            "itemName": itemName,
            "itemPrice": itemPrice,
            "itemPacksQty": itemPacksQty,
            "packageType": packageType
          })
          totalAmount += itemPrice
        } else {
          itemPrice = parseInt(queryData[0].pack_price) * parseInt(itemPacksQty)
          packageType = queryData[0].package_type
          orderedItemList.push({
            "itemName": itemName,
            "itemPrice": itemPrice,
            "itemPacksQty": itemPacksQty,
            "packageType": packageType
          })
          totalAmount += itemPrice
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Something bro00ooke!🤖⚡. We are looking into it\nPlease again later');
      }

    }
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
          res.status(500).send('Something bro00ooke!🤖⚡. We are looking into it\nPlease again later');
        })
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