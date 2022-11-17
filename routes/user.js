const express = require('express');
const router = express.Router();
const collection = require('../config/collections')
const userHelpers = require('../helpers/user-helper')
const productHelper = require('../helpers/product-helper')
const { Message } = require('twilio/lib/twiml/MessagingResponse');
const userHelper = require('../helpers/user-helper');
const paypal = require('paypal-rest-sdk');
const { Db, ObjectId } = require('mongodb');
const { totalPrice } = require('../helpers/user-helper');
const { logicalOr } = require('../hbsHelpers');
const dotnet=require('dotenv').config()

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.client_id,
  'client_secret':process.env.client_secret
});

const sessionHandler = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}




  async function paginationResult(req,res,next){
    const limit=3
    const page= parseInt(req.query.page)  
    const startIndex=(page-1)*limit
    const endIndex=page*limit
    let result={}

   let productsCount= await userHelper.getProductCount() 
    if(endIndex<productsCount){
      result.next={
        page:page+1,
        limit:limit
       }
     } 
    if(startIndex>0){
    result.previous={
      page:page-1,
      limit:limit
     }
  }   
  result.products = await productHelper.getAllProducts(startIndex,limit) 
  result.pageCount =Math.ceil(parseInt(productsCount)/parseInt(limit)).toString() 
  result.pages =Array.from({length: result.pageCount}, (_, i) => i + 1)    
  result.currentPage =page.toString() 
  res.paginationResult=result
  next()  
 }

















// let Count





let ACCOUNT_SID = process.env.ACCOUNT_SID;
let AUTH_TOKEN = process.env.AUTH_TOKEN;
let SERVICE_ID = process.env.SERVICE_ID;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);




//.....................................................home.........................................//
router.get('/', async function (req, res, next) {
  productHelper.getBrand().then((brands) => {
    productHelper.gethomeProducts().then((products)=>{
      if (req.session.user) {
        userHelpers.wishlistCount(req.session.user._id).then(async (wishCount) => {
         let Count = await userHelpers.cartCount(req.session.user._id)
          res.render('homepage', { userHeader: true, brands,Count,userLogged: true, wishCount,homeTab:true,products});
        })
      } else {
        res.render('homepage', { userHeader: true, brands,homeTab:true,products });
      }
    }) 
  })
});

//......................................login........................................//
router.get('/login', (req, res) => {
let warning
let warningmessage
if(req.session.warning){
  warning=req.session.warning
  warningmessage=req.session.warningmessage
}
  if (req.session.userLogged) {
    res.redirect('/')
  } else {
    res.render('login', { warning, warningmessage})  
    warningmessage = false
    req.session.warning=false
  }
});
//.................................................login.........................................//
router.post('/login', (req, res) => {
  userHelpers.userlogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLogged = true
      req.session.user = response.user
      userLogged = true
      userHeader = true
      res.redirect('/')
    } else {
      req.session.userLogged = false
      req.session.warning = response.err
       req.session.warningmessage = true
        res.redirect('/login') 
    }
  })
});
//.................................................otp.........................//
router.get('/otp', (req, res) => {
  console.log(req.session);
  if (req.session.userLogged) { 
    res.redirect('/')
  } else {
    let userblock
     userblock=req.session.userblock
    res.render('otp', { userblock })
    req.session.userblock=false  
  }
});
//.......................................................getotp............................................//
router.post('/getotp', (req, res) => {
 userHelpers.getOtp(req.body).then((datas) => {
    if (datas.status) {
      req.session.datas=datas
      req.session.number=datas.number
       let number= req.session.number
      client.verify
        .services(SERVICE_ID)
        .verifications.create({
           to: `+91${number}`,
          channel: 'sms'
        })
        .then(() => {
          res.redirect('/otpvalidation')
        }).catch((err)=>{
         console.log(err)
        })
    } else {
       req.session.userblock = true
      res.redirect('/otp')
    }
  })
});

//...............................................otpvalidation..................//
router.get('/otpvalidation', (req, res) => {
  if (req.session.userLogged) {
    res.redirect('/')
  } else {
    let otperr=req.session.otperr
    let otperrmsg=req.session.otperrmsg
    res.render('otpvalidation', { otperr, otperrmsg })
    req.session.otperr=false
  }
})
//.......................................................otpvalidation.........................................//
router.post('/otpvalidation', (req, res) => {
  if (req.session.userLogged) {
    res.redirect('/')
  } else {
    let number=req.session.number
    client.verify
      .services(SERVICE_ID)
      .verificationChecks.create({
        to: `+91${number}`,
        code: req.body.otp,
      })
      .then((data) => {
        if (data.valid == true) {
          req.session.userLogged = true
          req.session.user = req.session.datas
          userLogged = true
          res.redirect('/')
        }
        else {
          req.session.otperr=true
          req.session.otperrmsg='invalid otp'
          res.redirect('/otpvalidation')
        }
      });
  }
})
//......................................................resendotp......................................//
router.get("/resendotp", (req, res) => {
  if (number) {
    client.verify
      .services(SERVICE_ID)
      .verifications.create({
        to: `+91${number}`,
        channel: 'sms'
      })
      .then((data) => {
        res.redirect('/otpvalidation')
      })
  }
})
//.........................................signup........................................//
router.get('/signup', (req, res) => {
  let emailExist
  let err
   if(req.session.emailExist){
    emailExist=req.session.emailExist
     err=req.session.err
   }
  res.render('signup', { emailExist, err})
  emailExist = false
});
//.............................................................signup........................................//
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (response.userExist) {
      req.session.emailExist=true
      req.session.err = response.err
      res.redirect('/signup')
    } else {
      userLogged = true
      req.session.userLogged = true
      req.session.user = response.user
      res.redirect('/')
    }
  })
})
//......................................................logout...............................//
router.get('/logout', (req, res) => {
  req.session.destroy()
  userLogged = false
  res.redirect('/')
})
//.................................products...................................//
router.get('/products',paginationResult, (req, res) => {
  if (req.session.user) {
    let previous=res.paginationResult.previous
    let datas=res.paginationResult.products
   let next=res.paginationResult.next
   let pageCount=res.paginationResult.pageCount
   let pages=res.paginationResult.pages
   let currentPage=res.paginationResult.currentPage
      productHelper.getAllBrand().then(async (brands) => {
        Count = await userHelpers.cartCount(req.session.user._id)
        userHelpers.wishlistCount(req.session.user._id).then((wishCount) => {
          res.render('products', { userHeader: true, userLogged: true, Count, brands, wishCount,datas,next,pageCount,pages,currentPage,previous,productTab:true})
        })
     })
  } else {
    let previous=res.paginationResult.previous
    let datas=res.paginationResult.products
    let next=res.paginationResult.next
    let pageCount=res.paginationResult.pageCount
    let pages=res.paginationResult.pages
    let currentPage=res.paginationResult.currentPage
      productHelper.getAllBrand().then((brands) => {
        res.render('products', { userHeader: true, brands,datas,next,pageCount,pages,currentPage,previous,productTab:true })
      })
  }
})
//.......................................................zoomproducttesting..................................//
router.get('/zoomproducttesting/:id', (req, res) => {
  if (req.session.userLogged) {
    req.session.user.zoomid = req.params.id
    res.redirect('/zoomproduct')
  } else {
    req.session.zoomid=req.params.id
    res.redirect('/zoomproduct')
  }
})
//.......................................................zoomproduct........................................//
router.get('/zoomproduct', (req, res) => {
  if(req.session.user){
    let id=req.session.user.zoomid
    productHelper.zoomProduct(id).then((response) => {
      userHelpers.wishlistCount(req.session.user._id).then(async (wishCount) => {
        Count = await userHelpers.cartCount(req.session.user._id)
        res.render('zoomproduct', { response, Count, userLogged: true, userHeader: true, wishCount })
      })
    })
  }else{
    let id=req.session.zoomid
    productHelper.zoomProduct(id).then((response) => {  
        res.render('zoomproduct', { response,userHeader: true, })
    })
  }
})
//......................................................cart..................................//
router.get('/productToCart',(req,res)=>{
  if(req.session.user){  
  let productId=req.query.productId
  userHelpers.addToCart(productId,req.session.user._id).then((details)=>{
    let response={
      status:true
    }
    res.json(response)
  })
  }else{
    let response={
      status:false
    }
    res.json(response)
  } 
})
//.........................................................getcart..........................................//
router.get('/getcart/:id', sessionHandler, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then((count) => {
    cartCount = count
    res.redirect('/cart')
  })
})
//..........................................................cart..........................................//
router.get('/cart', sessionHandler, (req, res) => {
  userHelpers.getCart(req.session.user._id).then((products) => {
    if (products[0]) {
      userHelpers.wishlistCount(req.session.user._id).then((wishCount) => {
        userHelpers.totalPrice(req.session.user._id).then((grandTotal) => {
          let Totals = grandTotal[0].total   
         let  cartItems = products

          res.render('cart', { cartItems, userHeader: true, userLogged: true, Totals, display: true, wishCount })
        })
      })
    } else {
      res.render('cart', { userHeader: true, userLogged: true })
    }
  })
})
//.............................................change quantity....................................//
router.post('/change-product-quantity', (req, res) => {
  let obj = {}
  userHelpers.changeProductQuantity(req.body).then((response) => {
    obj.response = response
    userHelpers.totalPrice(req.session.user._id).then((grandTotal) => {
      obj.grandTotal = grandTotal 
      res.json(obj)
    })
  })
})
//............................remocve product................................................//
router.post('/remove-product', sessionHandler, (req, res) => {
 userHelpers.removeProduct(req.body).then((response) => {
    res.json(response)
  })
})
//..........................................checkout.................................................//
router.get('/checkout', sessionHandler, async (req, res) => {
  let total
  Count = await userHelpers.cartCount(req.session.user._id)
  if (Count > 0) {
    let userId = req.session.user._id
    let user= await userHelpers.getUser(req.session.user._id)
    userHelpers.getCart(req.session.user._id).then(async (cartItems) => {
     let couponDetails=req.session.user.couponDetails
      totalArray = await userHelpers.totalPrice(req.session.user._id)
      total = totalArray[0].total
      userHelpers.getAddress(userId).then((response) => {
        let Address = response
        if (total) {
         let err=req.session.user.err
          res.render('checkout', { userHeader: true, userLogged: true, cartItems, total, userId, Address, couponDetails, err ,user})
          req.session.user.err= null
        } else {
          res.render('checkout', { userHeader: true, userLogged: true, cartItems, userId, Address })
        }
      })
    })
  } else {
    res.redirect('/products')
  }
})
//............................................checkoutaddAddress..........................................//
router.get("/checkoutaddAddress", sessionHandler, (req, res) => {
  userId = req.session.user._id
  res.render('checkoutAddAddress', { userId,userLogged:true,userHeader:true })
})
//.........................................................postcheckoutaddAddress..................................//
router.post('/checkoutaddAddress', (req, res) => {
  userHelpers.checkoutaddAddress(req.body).then(() => {
    res.redirect('/checkout')
  })
})
//..........................................checkout....................................................//
router.post('/checkout', sessionHandler, async (req, res) => { 
  let offerAmount
  let userAddress = await userHelpers.getAddressDetail(req.body.Address)
   let userCart=await userHelpers.getUserCart(req.session.user._id)
  let userDetails=  await userHelpers.getUser(req.session.user._id)
  if (userDetails.couponDetails) {
    total = await userHelpers.totalPrice(userDetails._id)
      totalAmount=total[0].total
    offerAmount=total[0].total-(userDetails.couponDetails.Maxoffer)
  } else {
    total = await userHelpers.totalPrice(req.session.user._id)
    totalAmount = total[0].total
  }
  userHelpers.placeOrder(req.body, totalAmount, userAddress,userDetails,userCart,offerAmount).then((response) => {
    userHelpers.stockCheck(response.insertedId).then((result) => {
      result.forEach(element => { 
        userHelpers.stockUpdate(element)
      });
      if (req.body.paymentmethod === 'cod') {
      res.json({ sucessCod: true })
      } else if (req.body.paymentmethod == 'razorpay') {
        userHelpers.generateRazorpay(response.insertedId, totalAmount).then((response) => {
          response.sucessrazo = true
          response.userDetails=req.session.user
             res.json(response)
        })
      } else if(req.body.paymentmethod=='wallet'){
        userHelper.checkWalletBalance(req.body.paymentmethod,total,req.session.user._id,response.insertedId).then(()=>{
          res.json({ sucessCod: true })
        }).catch((err)=>{
          res.json({error:err})
        })
       }else if(req.body.paymentmethod=='paypal'){
        res.json({ orderId: response.insertedId, proQty: result[0].quantity, proId: result[0].proId,paypal:response.paypal})
      }
    })
  })
})
//......................................................pay.........................................//
router.post('/pay', (req, res) => {
  let orderId = req.body.orderId
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success?order=" + orderId,
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Red Sox Hat",
          "sku": "001",
          "price": "25.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "25.00"
      },
      "description": "Hat for the best team ever"
    }]
  }
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.json(payment.links[i].href);
        }
      }
    }
  });
})
//.................................................success...........................................//
router.get('/success', async (req, res) => {
const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };
  let result = await userHelpers.onlineStatusUpdate(req.query.order)
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      res.redirect('/successful')
    }
  });
});

//.......................................................successful.....................................//
router.get('/successful', sessionHandler, (req, res) => {
  req.session.user.couponDetails = null
  userHelpers.cartDelete(req.session.user._id).then(async() => {
    let user= await userHelpers.getUser(req.session.user._id)
    if(user.couponDetails){
      userHelpers.updateUserCollection(user.couponDetails,req.session.user._id) 
    res.render('successful')
    }else{
      res.render('successful') 
    } 
  })
})
//......................................................orderhistory.........................................//
router.get('/order-history', sessionHandler, async (req, res) => {
  userHelpers.wishlistCount(req.session.user._id).then(async (wishCount) => {
  let orders = await userHelpers.getorderCollection(req.session.user._id)
    let Count = await userHelpers.cartCount(req.session.user._id)
      res.render('order', { userLogged: true, userHeader: true, orders, wishCount,orderTab:true,Count })
  })
})
// ................................................view Details...................................//
router.get('/viewDetails/:orderId',(req,res)=>{
  let orderId=req.params.orderId
 userHelpers.getOrderDetails(orderId).then((orderDetails)=>{ 
    res.render('viewDetails',{userHeader:true,userLogged:true,orderDetails})
  })
})
//......................... cancelProduct..................................................//
router.post('/cancelProduct', (req, res) => {
  userHelpers.cancelProduct(req.body).then(() => {
    userHelpers.stockInc(req.body).then((result) => {
      result.forEach(element => {
        userHelpers.stockIncCancel(element)
      });
    })
    res.json({ status: true })
  })
})
//...........................................................cancelreturn.....................................//
router.get('/cancelreturn',sessionHandler,(req,res)=>{
  orderId=ObjectId(req.query.orderId)
  userHelpers.cancelReturn(req.query).then(()=>{
    res.redirect('/viewDetails/'+orderId)
  }) 
})
//........................................returnProduct........................//
router.post('/confirmReturn', sessionHandler, (req, res) => {
  userHelpers.updateReturnProduct(req.body, req.session.user._id).then((response) => { 
    res.json(response)
  })
})
//..............................................returnProductdetails.........................................//
router.get('/returnProductdetails',sessionHandler, (req, res) => {
  userHelpers.getReturnProduct(req.query).then((response) => {
   req.session.user.returnProduct = response
    res.redirect('/displayreturn')
  })
})
//...............................................................displayreturn................................//
router.get('/displayreturn', (req, res) => {
  let returnProduct=req.session.user.returnProduct
  res.render('returnproduct', { userLogged: true, userHeader: true, returnProduct })
})
//.....................................viewProduct..............................................//
router.get('/viewtable', (req, res) => {

   let viewProduct=req.session.user.viewProduct
  res.render('viewProduct', { userHeader: true, userLogged: true, viewProduct })
  req.session.user.viewProduct=null


})
//..........................................................viewProduct.....................................//
router.get('/viewProduct/:id', async (req, res) => {
  let proDetails = await userHelpers.viewOrderDetails(req.params.id)
   req.session.user.viewProduct=proDetails
  res.redirect('/viewtable')
})
//..............................................profile...........................//
router.get('/profile', sessionHandler, (req, res) => {
  userHelpers.wishlistCount(req.session.user._id).then((wishCount) => {
    userHelper.myDetails(req.session.user._id).then((mydetails)=>{
      console.log(mydetails);
      res.render('profile', { userHeader: true, userLogged: true, wishCount,mydetails })
    }) 
  })
})
//.....................................user-details.........................................//

router.get('/user-details', (req, res) => {
  userHelpers.getUser(req.session.user._id).then((response) => {
    console.log(req.session.user);
    let err=req.session.user.err
    res.render('userDetails', {  response, err })
   req.session.user.err =null

  })
})
//...............................................................postdetails..............................//
router.post('/user-details', (req, res) => {
  userHelpers.updateProfile(req.body).then((response) => {
    req.session.user.err = response
    res.redirect('/user-details')
  })
})
//..................................................addAddreas......................................//
router.get('/addAddress', sessionHandler, (req, res) => {
  res.render('addAddress', { userLogged: true, userHeader: true })
})
//.......................................................postaddAddress................................//
router.post('/addAddress', (req, res) => {
  userId = req.session.user._id
  userHelpers.addAddress(req.body, userId).then(() => {
    res.redirect('/user-details')
  })
})
//...................................................removeAddress..................................//
router.get('/remove/:id', (req, res) => {
  userHelpers.removeAddress(req.params.id).then(() => {
    res.redirect('/checkout')
  })
})
//............................................................editAddress...................................//

router.get('/edit/:id', (req, res) => {
  userHelpers.getAddressDetail(req.params.id).then((details) => {
   req.session.addressedit=details 
    res.redirect('/editAddress')
  })
})
//.............................................................editAddress...................................//
router.get('/editAddress', (req, res) => {
  let addressedit=req.session.addressedit
  res.render('editAddress', { addressedit }) 
})
//..............................................................posteditAddress.............................//
router.post('/editAddress', (req, res) => {
  userHelpers.editAddress(req.body).then(() => {
    res.redirect('/checkout')
  })
}),
  //............................................brandProduct............................................//

  router.get('/brandProduct/:Id', (req, res) => {
  if(req.session.user){
    productHelper.getBrandProduct(req.params.Id).then((datas) => {
      console.log(datas);
      req.session.brandProduct=datas
      
        let brandProduct=req.session.brandProduct
      productHelper.getBrand().then((brands) => {
       

        res.render('brandProduct', { brandProduct, userHeader: true, userLogged: true, brands })
      })
    })
  }else{
    productHelper.getBrandProduct(req.params.Id).then((datas) => {
      req.session.brandProduct=datas
      let brandProduct=req.session.brandProduct
      productHelper.getBrand().then((brands) => {
        res.render('brandProduct', { brandProduct, userHeader: true, brands })
      })
    })
  }  
  })
//......................................................bookedAddress.....................................//
router.get('/bookedAddress', sessionHandler, (req, res) => {
  userHelpers.getAddress(req.session.user._id).then((response) => {
    res.render('bookedAddress', { response, userHeader: true, userLogged: true })
  })
})
//.....................................................deleteAddress.......................................//
router.get('/deleteAddress/:id', (req, res) => {
  userHelpers.removeAddress(req.params.id).then(() => {
    res.redirect('/bookedAddress')
  })
})
//..............................................................verify-payment.................................//
router.post('/verify-payment', sessionHandler, (req, res) => {
userHelpers.verifyPayment(req.body, req.session.user._id).then((response) => {
 if(response.payment){
  userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
    res.json({ status: true })
  })
 }  
  }).catch((err) => {
    var rzp1 = new Razorpay(options);
    res.json({ status: false })
  })
})
// ....................................................coupon.............................................//
router.post('/applyCoupon',sessionHandler, (req, res) => {
  userHelpers.getCart(req.body.userId).then((cartDetails)=>{
    let totalAmount=cartDetails[0].total
    userHelpers.applyCoupon(req.body,totalAmount).then(({couponPercentage,Maxoffer,Minpurchase}) => {
       response={
        cartTotal:totalAmount,
        couponPercentage:couponPercentage,
        Maxoffer:Maxoffer,
        Minpurchase:Minpurchase
      }
      res.json(response)
       }).catch((response) => {
       res.json(response)
      })
}) 
})
//.....................................................removeCoupon.........................................//
router.post('/removeCoupon',sessionHandler,(req, res) => {
  userHelpers.removeCoupon(req.session.user._id).then((response) => { 
      res.json(response)
  })
})
// ......................................................wishlist..................................//
router.get('/wishlist/:id', sessionHandler, (req, res) => {
  userHelpers.addProductWishList(req.params.id, req.session.user._id).then(() => {
    res.redirect('/products?page=1')
  })
})

//.....................................................wishlistProducts..................................//
router.get('/wishlistProducts', sessionHandler, (req, res) => {
  userHelpers.getwishList(req.session.user._id).then((response) => {
      console.log(response);
    res.render('wishlist', { response, userHeader: true, userLogged: true })
  })
})
//...................................................addwishproductcart.................................//
router.get('/addwishproductcart/:id', sessionHandler, (req, res) => {
  console.log(req.params.id);
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.redirect('/cart')
  })
})
// ............................................removewilistProduct...................................//
router.get('/removewhishListProduct/:id', sessionHandler, (req, res) => {
  userHelpers.removeWishListProduct(req.params.id, req.session.user._id).then(() => {
    res.redirect('/wishlistProducts')
  })
})
// ......................................................homewishlist..................................//
router.get('/homewishlist/:id',(req,res)=>{
  userHelpers.addProductWishList(req.params.id, req.session.user._id).then(() => {
    res.redirect('/')
  })
})
// ......................................................brandFilter................................//
router.post('/brandFilter', (req, res) => {
  if (req.session.user) {
    if (req.body.brandFilter) {
      userHelpers.getFiteredBrands(req.body).then((filteredProducts) => {
        userHelpers.wishlistCount(req.session.user._id).then(async (wishCount) => {
          Count = await userHelpers.cartCount(req.session.user._id)
          productHelper.getAllBrand().then((brands) => { 
            res.render('filteredProducts', { userHeader: true, userLogged: true, filteredProducts, brands, Count, wishCount})
          })
        })
      })
    } else {
      res.redirect('/products')
    }
  }
  else {
    if (req.body.brandFilter) {
      userHelpers.getFiteredBrands(req.body).then((filteredProducts) => {
        productHelper.getAllBrand().then((brands) => {  
          res.render('filteredProducts', { userHeader: true, filteredProducts, brands })
        })
      })
    } else {
      res.redirect('/products')
    }
  }
})

// ....................................................wallet..........................................//
router.get('/wallet', sessionHandler, (req, res) => {
   userHelpers.userDetails(req.session.user._id).then((details)=>{
    console.log(details);
    res.render('wallet',{details,user:req.session.user,userHeader:'true',userLogged:true})
   })
})

// ...........................................................removeWallet..............................//
router.get('/removeOrderWallet/:orderId',sessionHandler,(req,res)=>{
userHelpers.removeOrderWallet(req.params.orderId,req.session.user._id)
})


// ..........................................................search...............................//
router.post('/getProducts', async (req, res) => {
  let payload = req.body.payload.trim();
  userHelper.searchProduct(payload).then((search) => {
    console.log(search);
    search = search.slice(0, 5)
    res.send({payload: search })
   })
})
// ....................................................invoice...........................................//
router.get('/invoice/:orderId',(req,res)=>{ 
  console.log(req.params.orderId);
  userHelper.getOrderInvoice(req.params.orderId).then((order)=>{
      res.render('invoice',{order})
  })
})


// ...............................................trackorder.........................................//
router.get('/trackOrder',(req,res)=>{
  userHelper.getTrackOrder(req.query.orderId,req.query.proId).then((orderDetails)=>{
   userHelper.getProductDetails(req.query.proId).then((productDetails)=>{
   res.render('trackOrder',{orderDetails,userLogged:true,userHeader:true,productDetails})
   })  
  })
})

module.exports = router;
