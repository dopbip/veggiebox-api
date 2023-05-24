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
      const fruitsInStore = await fruits.find({qty_in_store: {$gt: 0}})
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
          try {
            const queryData = await fruits
              .find({
                $and: [
                  { key_word: { $in: [fruitName.toLowerCase()] } },
                  { qty_in_store: { $gt: 0 } }
                ]
              })
              .exec();
              if (_.isEmpty(queryData)) {
                replyMsg += `${fruitName} out of stock, will notify you when available.`
              } else {
                if (parseInt(itemPacksQty) < 1 || itemPacksQty == null) {
                  itemPrice = parseInt(queryData[0].pack_price);
                  replyMsg += `1 pack of ${queryData[0].packed_items} ${fruitName} will cost k${itemPrice}\n`;
                } else {
                  console.log(queryData);
                  itemPrice = parseInt(queryData[0].pack_price) * parseInt(itemPacksQty);
                  replyMsg += `${itemPacksQty} packs of ${queryData[0].packed_items} ${fruitName} will cost k${itemPrice}\n`;
                }
              }
           
          } catch (error) {
            console.error(error);
            res.status(500).send('Something broke!');
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
      let package_type

      try {
        const queryData = await fruits.find({ key_word: { $in: [itemName.toLowerCase()] } }).exec();
        
        if (parseInt(itemPacksQty) < 1 || itemPacksQty == null) {
          itemPrice = parseInt(queryData[0].pack_price);
          package_type = queryData[0].package_type
          orderedItemList.push({
            "itemName": itemName,
            "itemPrice": itemPrice,
            "itemPacksQty": itemPacksQty,
            "package_type": package_type
          })
          totalAmount += itemPrice
        } else {
          itemPrice = parseInt(queryData[0].pack_price) * parseInt(itemPacksQty)
          package_type = queryData[0].package_type
          orderedItemList.push({
            "itemName": itemName,
            "itemPrice": itemPrice,
            "itemPacksQty": itemPacksQty,
            "package_type": package_type
          })
          totalAmount += itemPrice
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Something broke!');
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
          res.status(500).send("Something nt right, we are looking into it")
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