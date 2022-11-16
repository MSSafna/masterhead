var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay');
const collections = require('../config/collections')
const { Db, ObjectId } = require('mongodb');
const { log } = require('node:console');
const { resolveNaptr } = require('node:dns');
const { resolve } = require('node:path');
const dotenv = require('dotenv').config()
// ............................................................razorpay............................//
var instance = new Razorpay(
    {
        key_id: process.env.key_id,
        key_secret: process.env.key_secret
    })

module.exports = {
    // ....................................................signup...................................//
    doSignup: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let useremail = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            let usernumber = await db.get().collection(collection.USER_COLLECTION).findOne({ number: userData.number })
            if (useremail) {
                response.userExist = true
                response.err = 'email already exists'
                resolve(response)
            } else if (usernumber) {
                response.userExist = true
                response.err = 'number already exists'
                resolve(response)
            }
            else {
                userData.walletAmount = 0
                userData.password = await bcrypt.hash(userData.password, 10)
                userData.status = true
                let user = await db.get().collection(collection.USER_COLLECTION).insertOne(userData)
                response.userExist = false
                response.user = userData
                resolve(response)
            }
        })
    },
    // ......................................................allusers........................................//
    getallUsers: (() => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    }),
    // ................................................editUser..........................................//
    geteditUser: ((id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    }),
    // .....................................................updateUser...............................//
    updateUser: ((id, datas) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    name: datas.name,
                    email: datas.email,
                    number: datas.number
                }
            }).then(() => {
                resolve()
            })
        })
    }),
    // .........................................................adduser....................................//
    addUser: ((userDetails) => {
        userDetails.status = true
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then((response) => {
                resolve()
            })
        })
    }),
    //.................................................................blockuser............................//
    blockUser: ((id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    status: false,
                    loginStatus: 'block'
                }
            }).then(() => {
                resolve()
            })
        })
    }),
    //..........................................................unblockuser................................//
    unblockUser: ((id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    status: true,
                    loginStatus: 'unblock'
                }
            }).then(() => {
                resolve()
            })
        })
    }),

    //..............................................................otp....................................//
    getOtp: ((number) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).findOne({ number: number.number }).then((datas) => {
                resolve(datas)
            })
        })
    }),
    //.........................................................userLogin.....................................//
    userlogin: ((datas) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: datas.email })
            if (user) {
                if (user.status) {
                    bcrypt.compare(datas.password, user.password).then((status) => {
                        if (status) {
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            response.status = false
                            response.err = 'inavlid password  '
                            resolve(response)
                        }
                    })
                } else {
                    response.err = 'user is blocked '
                    response.status = false
                    resolve(response)
                }
            } else {
                response.err = 'invalid email'
                response.status = false
                resolve(response)
            }

        })
    }),

    //..................................................addtocart.............................................//
    addToCart: ((proId, userId) => {
        let proObj = {
            items: objectId(proId),
            quantity: 1,

        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.items == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.items': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: {
                                products: proObj
                            }
                        }
                    ).then((response) => {
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                            $set: {
                                cartPresent: true
                            }
                        }).then(() => {
                            resolve()
                        })
                    })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) },
                        {
                            $set: {
                                cartPresent: true
                            }
                        }).then(() => {
                            resolve()
                        })
                })
            }
        })
    }),
    //...................................................getCart...........................................//
    getCart: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }

                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        items: '$products.items',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'items',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        items: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ["$product", 0] },
                        cartPresent: 1

                    }

                },
                {

                    $project: {
                        items: 1,
                        quantity: 1,
                        product: 1,
                        total: { $multiply: ['$quantity', ('$product.price')] },
                        cartPresent: 1
                    }
                },

            ]).toArray()
            resolve(cartItems)
        })
    }),
    //...................................................................cartCount............................//
    cartCount: ((userId) => {
        let count = null
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                count = userCart.products.length
            }

            resolve(count)
        })
    }),

    //..................................................changeProductQuantity.............................//
    changeProductQuantity: (details) => {
        console.log("details");
        console.log(details);
        let response = {
        }

        let signofCount = Math.sign(details.count)
        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)
        return new Promise(async (resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                response.err = true
                resolve(response)
            }
            else {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(details.product) }).then((response) => {
                    if (response.stock > details.quantity) {
                        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.items': objectId(details.product) },

                            {
                                $inc: {
                                    'products.$.quantity': details.count

                                }
                            }

                        ).then((response) => {
                            response.inc = true
                            response.err = false
                            response.proId = objectId(details.product)
                            resolve(response)
                        })

                    } else if (signofCount == -1 && response.stock == details.quantity) {

                        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.items': objectId(details.product) },

                            {
                                $inc: {
                                    'products.$.quantity': details.count

                                }
                            }

                        ).then((response) => {
                            response.inc = true
                            response.err = false
                            response.proId = objectId(details.product)
                            resolve(response)
                        })
                    } else {
                        response.proId = details.product
                        response.outofStock = "out of stock"
                        response.stockerr = true
                        resolve(response)
                    }
                })

            }

        })
    },

    // ........................................removeProduct.......................................//
    removeProduct: (details) => {
        let response = {}
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(details.product) }, {
                $unset: {
                    cartPresent: true
                }
            }).then(() => {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) }, {
                    $pull: {
                        products: { items: objectId(details.product) }
                    }
                }).then(() => {

                    response.status = true
                    resolve(response)
                })
            })
        })
    },

    // ...................................................totalPrice........................................//
    totalPrice: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let totalPrice = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }

                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        items: '$products.items',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'items',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        items: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ["$product", 0] },
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', ('$product.price')] } }
                    }
                }

            ]).toArray()
           
            resolve(totalPrice)


        })
    }),

    // .........................................................getCartProduct...............................//
    getCartProduct: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) }).then((response) => {

                resolve(response)
            })
        })
    },
    //.............................................placeOrder.......................................//
    placeOrder: (details,total,userAddress,userDetails,userCart,offerAmount) => {
    
        userCart.products.forEach(element => {
            element.productstatus='orderPlaced'
           
        });
      
        let d = new Date()
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear()
        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;
        let time = [year, month, day].join('-');
        let monthofbusiness = [year, month].join('-');
        let yearofbusiness = year
        return new Promise((resolve, reject) => {
            let PaymentStatus =( details.paymentmethod === 'cod' ||details.paymentmethod ==='wallet') ? 'Successful' : 'Pending'
            let orderDetails = {
                displayReturn: false,
                userId: objectId(userDetails._id),
                cartId:userCart._id,
                Address: {
                    fullName: userAddress.fullName,
                    address: userAddress.address,
                    town: userAddress.town,
                    state: userAddress.state,
                    postcode: userAddress.postcode,
                    phone: userAddress.phone,
                    email: userAddress.email,
                },
                prodetails: userCart.products,
                paymentMethod: details.paymentmethod,
                total: total,
                offerAmount:offerAmount,
                cartId: userCart._id,
                PaymentStatus:PaymentStatus,
                date: time,
                month: monthofbusiness,
                year: yearofbusiness,
                couponDetails: userDetails.couponDetails
            }
            
            db.get().collection(collection.ORDER_COLLECTION).findOne({ cartId: objectId(userCart._id) }).then((response) => {
                if (response) {
                    db.get().collection(collection.ORDER_COLLECTION).deleteOne({ cartId: objectId(userCart._id) })

                        .then(() => {
                            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderDetails).then((response) => {

                                console.log(response);
                                resolve(response)
                            })

                        })
                } else {

                    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderDetails).then((response) => {
                        console.log(response);
                        resolve(response)
                    })
                }

            })
        })
    },

    // ....................................................................cartDelete.......................................//
    cartDelete: (user) => {
        return new Promise(async(resolve, reject) => {
         await db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(user)}) 
            resolve()        
 
          
        })
    },




    updateUserCollection:(couponDetails,userId)=>{
     couponDetails={
            userId:objectId(userId),
            couponDetails:couponDetails.couponCode,

        }
        return new Promise(async(resolve,reject)=>{
            let userdetails= await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                $unset:{
                    couponDetails:1
                }
            })
         await db.get().collection(collection.COUPONAPPLIED_COLLECTION).insertOne(couponDetails)
            resolve()
        })
    },

    
    //.......................................................getOrderDetails.....................................//
    getOrderDetails: (orderId) => {
       
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {

                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$prodetails'
                },

                {
                    $project: {
                        _id: 0,
                        orderId: '$_id',
                        orderProducts: '$prodetails',
                         total: '$total',
                         offerAmount:'$offerAmount',
                         couponDetails:'$couponDetails'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'orderProducts.items',
                        foreignField: '_id',
                        as: 'prodetails'
                    }
                },
                {
                    $unwind: '$prodetails'
                },
                {
                    $project: {
                        _id: 0,
                        orderId: 1,
                        proId: 1,
                        proQty: 1,
                        prodetails: 1,
                        offerPercentage: 1,
                        originalPrice: 1,
                        orderProducts: 1,
                        total: 1,
                        offerAmount:1,
                        orderDetails:1,
                        couponDetails:1,
                        productTotal: { $multiply: ['$prodetails.price', ('$orderProducts.quantity')] }



                    }
                },
                {
                    $group: {
                        _id: '$orderId', productList: { $push: { orderProducts: '$orderProducts', prodetails: '$prodetails', productTotal: '$productTotal',orderId:'$orderId',orderDetails:'$orderDetails' } }, total: { $push: { total: '$total' } },offerAmount:{$push:{offerAmount:'$offerAmount'}},couponDetails:{$push:'$couponDetails'}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        productList: 1,
                        total: { $arrayElemAt: ["$total", 0] },
                        couponDetails:1,
                        offerAmount:{ $arrayElemAt: ["$offerAmount", 0] },
                    }
                }
                // {
                //     $lookup: {
                //         from: collection.ORDER_COLLECTION,
                //         localField: '_id',
                //         foreignField: '_id',
                //         as: 'orderDetails'
                //     }
                // }, {
                //     $unwind: '$orderDetails'
                // },
                // {
                //     $sort: {
                //         _id: -1
                //     }
                // }

            ]).toArray()
         

            resolve(orders)
        })
    },

    // ..................................................orderView Details..............................//
    getorderCollection: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({_id:-1}).toArray().then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    //....................................................................cancelProduct..........................//
    cancelProduct: (orderDetails) => {
        cancel = false
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderDetails.order),'prodetails.items':objectId(orderDetails.product) },
                {
                    $set: {
                       'prodetails.$.productstatus' :'Product cancelled',
                       
                        
                    }
                }).then((response) => {
                   console.log(response);
                    resolve()
                })
        })
    },


    cancelReturn: (orderDetails) => {
        console.log('##################');
        console.log(orderDetails);
        cancel = false
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderDetails.orderId),'prodetails.items':objectId(orderDetails.proId) },
                {
                    $set: {
                       'prodetails.$.productstatus' :'Delivered',
                       
                        
                    }
                }).then((response) => {
                    db.get().collection(collection.RETURN_COLLECTION).deleteOne({$and:[{orderId:objectId(orderDetails.orderId)},{productId:objectId(orderDetails.proId)}]})
                   console.log(response);
                    resolve()
                })
        })
    },


    // ................................................productCancelStockInc.............................//
    productCancelStockInc:(details)=>{
        console.log(details);
        return new Promise(async(resolve,reject)=>{
          let result=await  db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {$match:{
                _id:objectId(details.order),'prodetails.items':objectId(details.product)
            }}
        ]).toArray()
        console.log(result);
        })
    },

    //............................................................................viewOrderDetails......................//
    viewOrderDetails: ((orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }

                },
                { $unwind: '$prodetails' },
                {
                    $project: {
                        proId: '$prodetails.items',
                        quantity: '$prodetails.quantity',
                        status: '$AdminStatus',
                        cancelDisplay: '$cancelDisplay',
                        displayReturn: '$displayReturn'

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'proId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        proId: 1,
                        quantity: 1,
                        status: 1,
                        cancelDisplay: 1,
                        displayReturn: 1,
                        product: { $arrayElemAt: ["$product", 0] },
                    }

                },

                {
                    $project: {

                        quantity: 1,
                        status: 1,
                        product: 1,
                        cancelDisplay: 1,
                        displayReturn: 1,
                        total: { $multiply: ['$quantity', ('$product.price')] }
                    }
                },

            ]).toArray()

            resolve(orderItems)
        })

    }),

    //............................................................getAllOrders.......................................//   
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let details = await db.get().collection(collections.ORDER_COLLECTION).find({PaymentStatus:{$eq:'Successful'}}).sort({ "_id": -1 }).toArray()
            resolve(details)
          
        })
    },
    //.................................................................getMoreDetails...................................//
    getMoreDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }

                },
                { $unwind: '$prodetails' },

                {
                    $project: {
                        _id: 0,
                        orderId: '$_id',
                        proId: '$prodetails.items',
                        quantity: '$prodetails.quantity',
                        productstatus:'$prodetails.productstatus',
                        status: '$AdminStatus',
                        total: '$total',
                        date: '$date',
                        orderStatus: '$orderStatus',
                       

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'proId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },

                {
                    $project: {
                        orderId: 1,
                        quantity: 1,
                        status: 1,
                        total: 1,
                        date: 1,
                        product: 1,
                        orderStatus: 1,
                        productstatus:1
                    }
                },
                {
                    $group: {
                        _id: '$orderId', productList: { $push: { product: '$product', quantity: '$quantity', total: '$total', date: '$date', orderStatus: '$orderStatus', status: '$status', couponDetails: '$couponDetails',productstatus:'$productstatus' } }
                    }
                },
                {
                    $lookup: {
                        from: collection.ORDER_COLLECTION,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'orderDetails'
                    }
                }, {
                    $unwind: '$orderDetails'
                },

            ]).toArray()
            resolve(orderItems)

        })
    },

    //........................................................................orderAddress.................................//
    orderAddress: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((response) => {

                resolve(response)
            })
        })
    },
    //............................................................changeStatus.........................................//
    changeStatus: (details) => {
        let
            orderId = details.orderId,
            newStatus = details.status,
            proId=details.proId
           

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId),'prodetails.items':objectId(proId) }, {
                $set: {

                    'prodetails.$.productstatus' :newStatus,
                },

            }).then((response) => {
              
                resolve(response)
            })
        })
    },
    //....................................................................getReturnProduct............................//
    getReturnProduct: ({proId,orderId}) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }

                },
                { $unwind: '$prodetails' },
                {
                    $match:{'prodetails.items':objectId(proId)}
                },

                {
                    $project: {
                        _id: 0,
                        orderId: '$_id',
                        proId: '$prodetails.items',
                        proQty: '$prodetails.quantity',
                        proStatus:'$prodetails.productstatus'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'proId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        orderId: 1,
                        proId: 1,
                        proQty: 1,
                        proStatus:1,
                        product: { $arrayElemAt: ["$product", 0] },
                    }
                },
                // {
                //     $project: {
                //         orderId: 1,
                //         proQty: 1,
                //         product: 1,
                //         // total: { $multiply: ['$proQty', ('$product.price')] },
                //     }
                // },
                // {
                //     $group: {
                //         _id: '$orderId', productList: { $push: { product: '$product', proQty: '$proQty', total: '$total' } }
                //     }
                // },
            ]).toArray()
             
            resolve(result)
        })
    },

    //.................................................................updateReturnProduct............................//
    updateReturnProduct: (returndetails, userId) => {
      
        return new Promise((resolve, reject) => {
           
                       
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(returndetails.orderId),'prodetails.items':objectId(returndetails.productId) }, {
                $set: {
                    'prodetails.$.productstatus' :'Return request',
                }
            }).then(async() => { 
                let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(returndetails.orderId)})
                let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(returndetails.orderId) }
    
                    },
                    { $unwind: '$prodetails' },
                    {
                        $match:{'prodetails.items':objectId(returndetails.productId)}
                    },
    
                    {
                        $project: {
                            _id: 0,
                            orderId: '$_id',
                            proId: '$prodetails.items',
                            proQty: '$prodetails.quantity',
                            proStatus:'$prodetails.productstatus'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'proId',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            orderId: 1,
                            proId: 1,
                            proQty: 1,
                            proStatus:1,
                            proQty:1,
                            product: { $arrayElemAt: ["$product", 0] },
                        }
                    }
                ]).toArray()
                    let details={
                        userId:objectId(userId),
                        orderId:objectId(returndetails.orderId),
                        productId:objectId(returndetails.productId),
                        productStatus:result[0].proStatus,
                        productQuantity:result[0].proQty,
                        returnReason:returndetails.reason,
                        paymentMethod:orderDetails.paymentMethod,
                        orderDate:orderDetails.date,
                       
                    }
                    db.get().collection(collection.RETURN_COLLECTION).insertOne(details).then((result) => {    
                        resolve(result)
                    })
                  
                
                    
            })
        })
    },
    //.......................................................................getUser..................................//
    getUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },
    //..........................................................................addAddress..............................//
    addAddress: (details, userId) => {
        details.userId = objectId(userId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(details).then(() => {
                resolve()
            })

        })
    },
    //................................................................checkoutaddAddress....................//
    checkoutaddAddress: (details) => {
        details.userId = objectId(details.userId)
        console.log(details);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(details).then(() => {
                resolve()
            })
        })
    },
    //.....................................................getAddress.......................................//
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let Address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
            resolve(Address)
        })
    },
    //...........................................................getAddressDetail................................//
    getAddressDetail: (addressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(addressId) }).then((response) => {
                resolve(response)
            })
        })
    },
    //................................................................removeAddress.......................................//   
    removeAddress: (addressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: objectId(addressId) }).then(() => {
                resolve()
            })
        })
    },

    //........................................................editAddress........................................//
    editAddress: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ _id: objectId(details.id) }, {
                $set: {
                    fullName: details.fullName,
                    address: details.address,
                    town: details.town,
                    state: details.state,
                    postcode: details.postcode,
                    phone: details.phone,
                    email: details.email,

                }
            }).then(() => {
                resolve()
            })
        })
    },
    //................................................................ stockCheck.....................................// 
    stockCheck: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }

                },
                {
                    $unwind: '$prodetails'
                },
                {
                    $project: {
                        id: '$prodetails.items',
                        quantity: '$prodetails.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {

                        quantity: 1,
                        product: { $arrayElemAt: ["$product", 0] },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        proId: '$product._id',
                        quantity: 1,

                    }

                }


            ]).toArray()
            resolve(result)
        })
    },

    //.....................................................stockUpdate..................................................//
    stockUpdate: ({ quantity, proId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) },
                {
                    $inc: {
                        stock: -(quantity)
                    }

                },
            ).then((response) => {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                    $unset: {
                        cartPresent: true
                    }
                })
                resolve()
            })
        })

    },
    //..................................................stockIncCancel.........................................//
    
    stockIncCancel:({quantity,proId})=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $inc:{
                    stock:+(quantity)
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    //.................................................................stockInc..................................//
    stockInc: (orderDetails) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderDetails.order), }
                }, {
                    $unwind: '$prodetails'
                },
                {
                    $project: {
                        id: '$prodetails.items',
                        quantity: '$prodetails.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {

                        quantity: 1,
                        product: { $arrayElemAt: ["$product", 0] },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        proId: '$product._id',
                        quantity: 1,

                    }

                }
            ]).toArray()

            resolve(result)
        })
    },
    //.........................................................updateProfile.....................................//
    updateProfile: (details) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.USER_COLLECTION).findOne({ $and: [{ email: details.email }, { _id: { $ne: objectId(details.id) } }] })
            if (result) {
                response.err = "email already exist"
                response.status = true
                resolve(response)
            } else {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.id) }, {
                    $set: {
                        name: details.name,
                        email: details.email,
                        number: details.number
                    }

                }).then(() => {
                    response.status = "details updated",
                        response.status = false
                    resolve(response)
                })

            }
        })
    },
    //....................................................generateRazorpay.............................................//
    generateRazorpay: (orderId, total) => {
        totalAmount = total
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: (totalAmount) * 100,
                currency: "INR",
                receipt: "" + orderId,
            }, (err, order) => {
                if (err) {
                   
                    console.log(err);

                } else {
                    resolve(order)
                }
            })
        })
    },
    //...................................................................verifyPayment....................................//
    verifyPayment: (details, userId) => {
        console.log(details);
        return new Promise(async (resolve, reject) => {
            const {
                createHmac
            } = await import('node:crypto');
            let hmac = createHmac('sha256', 'Ir9Ytn4b9QKl4s29SJa72Xti');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex');
            if (hmac == details['payment[razorpay_signature]']) {
                let response = {
                    payment: true
                }
                resolve(response)
            } else {
                let response = {
                    payment: false
                }
                reject(response)
            }
        })
    },
    //.................................................................onlineStatusUpdate.....................//
    onlineStatusUpdate: (orderId) => {
        orderId = objectId(orderId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    AdminStatus: 'order confirmed',
                },
            }).then(() => {
                resolve()
            })
        })
    },

    //.....................................................generatePaypal...........................................//
    generatePaypal: () => {
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": "5.00",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "5 .00"
                    },
                    "description": "Hat for the best team ever"
                }]
            }
        }), (err, orders) => {
            if (err) {
                console.log(err);
            } else {
                console.log('successs');
            }
        }
    },
    //.....................................................changePaymentStatus...................................//
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        PaymentStatus: 'Successful'
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    //......................................................................customerCount.........................//
    customerCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find().count().then((count) => {
                resolve(count)
            })
        })
    },
    //.......................................................returnCount.........................................//
    returnCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.RETURN_COLLECTION).countDocuments().then((result) => {
                resolve(result)
            })
        })
    },
    //.................................................salesTotal...........................................//
    salesTotal: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $group: {
                    _id:"",
                    totalSales: { $sum: '$total' }
                }
            }]).toArray().then((total) => {
                resolve(total)
            })

        })
    },
    //...............................................................numOfProduct.................................//
    numOfProduct: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).countDocuments().then((result) => {
                resolve(result)
            })
        })
    },
    //..................................................applyCoupon.........................................//
    applyCoupon: (details, cartTotal) => {
        let { couponCode, userId } = details
        let couponobj = {
            couponCode: details.couponCode
        }
        return new Promise(async (resolve, reject) => {
            let alreadyUseCoupon = await db.get().collection(collection.COUPONAPPLIED_COLLECTION).findOne({ $and: [{couponDetails: couponCode }, { userId: objectId(userId) }] })

            if (alreadyUseCoupon) {
               let  response={
                   error: true,
                   message:'Coupon already applied'
                }
                reject(response)
            } else {
                let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: couponCode })

                if (coupon) {
                    let couponDetails = {
                        userId: objectId(details.userId),
                        couponCode: [couponobj]

                    }
                    date = new Date().toISOString().slice(0, 10)
                    console.log(date);
                    if (date <= coupon.expiryDate) {
                        if (cartTotal >= parseInt(coupon.Minpurchase)) {
                            let productCouponOffer = cartTotal * coupon.couponPercentage / 100

                            if(productCouponOffer<=coupon.Maxoffer){
                                coupon.Maxoffer = productCouponOffer
                                let userCoupon = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.userId) }, {
                                    $set: {
                                        couponDetails: coupon
                                    }
                                })
                                originaltotalpriceaftercouponappled = cartTotal - coupon.Maxoffer
                                let response = {
                                    couponPercentage: coupon.couponPercentage,
                                    Maxoffer: coupon.Maxoffer,
                                    Minpurchase: coupon.Minpurchase
                                }
                                
                                resolve(response)

                         }
                                                                                   
                             else {
                                let userCoupon = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.userId) }, {
                                    $set: {
                                        couponDetails: coupon
                                    }
                                })
                                let response = {
                                    couponPercentage: coupon.couponPercentage,
                                    Maxoffer: coupon.Maxoffer,
                                    Minpurchase: coupon.Minpurchase
                                }
                               

                                resolve(response)
                            }

                        } else {
                            response = {
                                error: true,
                                message: 'Minimum purchase amount is Rs :' + coupon.Minpurchase
                            }
                            reject(response)
                        }

                    } else {
                        response = {
                            error: true,
                            message: 'Coupon Expired'
                        }
                        reject(response)
                    }
                }
                else {
                    response = {
                        error: true,
                        message: 'Invalid coupon Code'
                    }
                    reject(response)
                }
            }
        })
    },
    // ......................................................removeCoupon..............................//
    removeCoupon: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $unset: {
                    couponDetails: 1
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    // .............................................addProductWishList.......................................//
    addProductWishList: (proId, userId) => {
        details = {
            proId: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let wishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ userId: objectId(userId) })
            if (wishList) {
                let proExist = wishList.prodetails.findIndex(prodetails => prodetails.proId == proId)
                if (proExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ userId: objectId(userId), 'prodetails.proId': objectId(proId) }, {
                        $inc: { 'prodetails.$.quantity': 1 }
                    }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ userId: objectId(userId) }, {
                        $push: {
                            prodetails: details
                        }
                    }).then(() => {
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                            $set: {
                                wishList: true
                            }
                        }).then(() => {
                            resolve()
                        })

                    })
                }
            } else {
                let wishDetails = {
                    userId: objectId(userId),
                    prodetails: [details]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishDetails).then(() => {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                        $set: {
                            wishList: true
                        }
                    }).then(() => {
                        resolve()
                    })
                })
            }
        })
    },
    // ................................................................getwishList..................................//
    getwishList: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { userId: objectId(userId) }
                },

                {
                    $unwind: '$prodetails'
                },
                {
                    $project: {
                        items: '$prodetails.proId',
                        quantity: '$prodetails.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'items',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        items: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ["$product", 0] },
                    }
                },
                {
                    $project: {
                        items: 1,
                        quantity: 1,
                        product: 1,
                        total: { $multiply: ['$quantity', ('$product.price')] }
                    }
                },
            ]).toArray().then((wishListItems) => {
                resolve(wishListItems)
            })
        })
    }),
    // ...................................................removeWishListProduct...............................//
    removeWishListProduct: (proId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ userId: objectId(userId) },
                {
                    $pull: {
                        prodetails: { proId: objectId(proId) }
                    }
                }).then((response) => {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                        $unset: {
                            wishList: ""
                        }
                    })
                    console.log(response);
                    resolve()
                })
        })
    },
    // ..............................................................wishlistCount..................................//
    wishlistCount: ((userId) => {
        let wishcount = null
        return new Promise(async (resolve, reject) => {
            let userwishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ userId: objectId(userId) })
            if (userwishlist) {
                wishcount = userwishlist.prodetails.length
            }
            console.log(wishcount);
            resolve(wishcount)
        })
    }),
    // .............................................................getFiteredBrands...............................//
    getFiteredBrands: (brandId, skip, limit) => {
        return new Promise(async (resolve, reject) => {
            let arrayFilter
            const array = Array.isArray(brandId.brandFilter)
            if (array == false) {
                arrayFilter = Object.values(brandId)
            } else {
                arrayFilter = brandId.brandFilter
            }
            let arrayObj = arrayFilter.map((Id) => {
                return objectId(Id)
            })
            console.log(arrayObj);
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
                $match: { brand: { $in: arrayObj } }
            },

            {
                $lookup: {
                    from: collection.CATEGORY_COLLECTION,
                    localField: "brand",
                    foreignField: "_id",
                    as: "brandName"
                },
            },
            {
                $project: {
                    name: 1,
                    price: 1,
                    discription: 1,
                    originalPrice: 1,
                    cartPresent: 1,
                    image: { $arrayElemAt: ["$img", 0] },
                    brand: { $arrayElemAt: ["$brandName", 0] },
                    stock: 1,
                    status: 1
                }
            }
            ]).toArray()

            resolve(result)
        })
    },
    // ................................................................refundApproved....................................//
    refundApproved: ({_id,userId,orderId,productId,price,orderDate,ProductQty,returnId}) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId),'prodetails.items':objectId(productId)},
                {
                    $set: {
                        'prodetails.$.productstatus': 'Refunded'
                    }
                }
            ).then(() => {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((proDetails)=>{
                    let refundobj={
                        orderId:orderId,
                        price:price,
                        orderDate:orderDate,
                        ProductQty:ProductQty,
                        proDetails:proDetails
                    }

                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
                {
                    $inc:{    
                   walletAmount:parseInt(price) 
                    },
                     $push:{
                        refundDetails:refundobj
                    }
                },
                
                ).then((response)=>{
                    db.get().collection(collection.RETURN_COLLECTION).deleteOne({_id:objectId(returnId)}).then(()=>{
                        resolve(response)
                    })
                  
                })
                })
                
                
                

            })
        })
    },
   
    
    // .....................................................................userDetails.............................//
    userDetails: (userId) => {

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((userDetails)=>{
               resolve(userDetails)
            })
        })
        // return new Promise(async (resolve, reject) => {
        //     let result = await db.get().collection(collection.USER_COLLECTION).aggregate([
        //         {
        //             $match: {
        //                 _id: objectId((userId))
        //             }
        //         },
        //         {
        //             $unwind: '$refundDetails'
        //         },
        //         {
        //             $project: {
        //                 _id: 1,
        //                 walletAmount: 1,
        //                 refundDetails: 1
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: collection.ORDER_COLLECTION,
        //                 localField: 'refundDetails.orderId',
        //                 foreignField: '_id',
        //                 as: 'orderDetails'
        //             }
        //         },
        //         {
        //             $project: {
        //                 _id: 1,
        //                 walletAmount: 1,
        //                 refundDetails: 1,
        //                 orderDetails: 1
        //             }
        //         },
        //         {
        //             $group: {
        //                 _id: '$_id', orders: { $push: { orderDetails: '$orderDetails' } }, walletAmount: { $push: '$walletAmount' }
        //             }
        //         },
        //         {
        //             $sort: { _id: -1 }
        //         }, {
        //             $project: {
        //                 _id: 1,
        //                 orders: 1,
        //                 walletAmount: { $arrayElemAt: ["$walletAmount", 0] },
        //             }
        //         }
        //     ]).toArray()
        //     resolve(result)
        // })
    },
    // .................................................................searchProduct............................//
    searchProduct: (payload) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ name: { $regex: new RegExp('^' + '.*' + payload, 'i') } }).toArray().then((data) => {
                resolve(data)
            })
        })
    },
    // ................................................getwalletOrders............................................//
    getwalletOrders: ({ orderId, date }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((response) => {
                resolve(response)
            })
        })
    },
    //...............................................................checkWalletBalance...........................//
    checkWalletBalance: (wallet, total, userId, orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((result) => {
                if (result.walletAmount >= total[0].total) {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                        $inc: {
                            walletAmount: -(total[0].total)
                        }
                    }).then(() => {
                        db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                            $set: {
                                AdminStatus: ' order placed '
                            }
                        }).then((response) => {
                            resolve()
                        })
                    })
                } else {
                    reject('not enough balance')
                }
            })
        })
    },
    // .......................................................................getProductCount...............................//
    getProductCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).countDocuments().then((count) => {
                resolve(count)
            })
        })
    },



    getOrderInvoice: (orderId) => {

        return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {

                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$prodetails'
                },

                {
                    $project: {
                        _id: 0,
                        orderId: '$_id',
                        proId: '$prodetails.items',
                        proQty: '$prodetails.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'proId',
                        foreignField: '_id',
                        as: 'prodetails'
                    }
                },
                {
                    $unwind: '$prodetails'
                },
                {
                    $project: {
                        _id: 0,
                        orderId: 1,
                        proId: 1,
                        proQty: 1,
                        prodetails: 1,
                        offerPercentage:1,
                        originalPrice:1,
                        total: { $multiply: ['$proQty', ('$prodetails.price')] }
                    }
                },
                {
                    $group: {
                        _id: '$orderId', productList: { $push: { prodetails: '$prodetails', proQty: '$proQty', total: '$total' ,offerPercentage:'$offerPercentage',originalPrice:'$originalPrice'} }
                    }
                },
                {
                    $lookup: {
                        from: collection.ORDER_COLLECTION,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'orderDetails'
                    }
                }, {
                    $unwind: '$orderDetails'
                },
                

            ]).toArray()
            console.log(orders);
            resolve(orders)
        })
    },

    getInvoiceOrderAddress:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)}).then((orderAddress)=>{
                resolve(orderAddress)
            })
        })
    },





    myDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((details) => {
                resolve(details)
            })
        })
    },
    getTrackOrder: (orderId,proId) => {

        return new Promise(async(resolve, reject) => {
        let details= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
            $match:{_id:objectId(orderId)}
          },{
            $unwind:'$prodetails'
          },
        ]).toArray()
          let product =details.filter((product)=>{

           return product.prodetails.items==proId
          })
             resolve(product[0])
        })
    },

    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((productDetails) => {
                resolve(productDetails)
            })
        })
    },

    getUserCart:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)}).then((response)=>{
                resolve(response)
            })
        })
    },


    removeOrderWallet:(orderId,userId)=>{
        console.log(orderId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {

                $pull:{
                    refundDetails:{orderId: objectId(orderId)}
                }
            }).then((response)=>{
                console.log(response);
            })
        })
    }
}

