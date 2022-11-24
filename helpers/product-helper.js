
var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('mongodb')
const { logicalOr } = require('../hbsHelpers')

module.exports = {
  addProducts: (details) => {

    details.price = parseInt(details.price)
    details.stock = parseInt(details.stock)
    details.brand = ObjectId(details.brand)

    details.status = true
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(details.brand) }).then((result) => {
        if (result.offerDisplay) {
          let percentage = parseInt(result.offerPercentage)
          details.offerPercentage = result.offerPercentage,
            offerPrice = (details.price * percentage) / 100,

            details.originalPrice = details.price
          details.price = details.price - offerPrice,
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(details).then((data) => {

              resolve(data.insertedId)
            })
        } else {
          db.get().collection(collection.PRODUCT_COLLECTION).insertOne(details).then((data) => {

            resolve(data.insertedId)
          })
        }

      })

    })
  },


  getAllProducts: (skip,limit) => {
    return new Promise(async (resolve, reject) => {

      let datas = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
        $skip:skip
      },
      {
        $limit:limit
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
          wishList:1,
          img:1,
          name: 1,
          price: 1,
          discription: 1,
          originalPrice:1,
          cartPresent:1,
          image:1 ,
          brand: { $arrayElemAt: ["$brandName", 0] },
          stock: 1,
          status: 1



        }
      }
      ]).toArray()

       console.log(datas);
      resolve(datas)
    })

  },


  gethomeProducts:()=>{
    return new Promise(async (resolve, reject) => {

      let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        
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
          originalPrice:1,
          cartPresent:1,
          image: { $arrayElemAt: ["$img", 0] },
          brand: { $arrayElemAt: ["$brandName", 0] },
          stock: 1,
          status: 1

        }
      },{
        $sort:{_id:1}
      },
      ]).toArray()


      resolve(products)
    })
   
  },


  getadminAllProducts: () => {
    return new Promise(async (resolve, reject) => {

      let datas = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
       
        
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
          originalPrice:1,
          cartPresent:1,
          image: { $arrayElemAt: ["$img", 0] },
          brand: { $arrayElemAt: ["$brandName", 0] },
          stock: 1,
          status: 1



        }
      }
      ]).toArray()


      resolve(datas)
    })

  },



  getAllBrand: () => {
    return new Promise(async (resolve, reject) => {
      let response = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(response)
    })
  },


  geteditProduct: ((proId) => {

    return new Promise(async (resolve, reject) => {
      let result = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
          $match: { _id: ObjectId(proId) }

        },
        {
          $lookup: {
            from: collection.CATEGORY_COLLECTION,
            localField: "brand",
            foreignField: "_id",
            as: "brand"
          }
        },
        {
          $project: {
            originalPrice:1,
            name: 1,
            price: 1,
            discription: 1,
            stock: 1,
            img:1,
            
            brand: { $arrayElemAt: ["$brand", 0] },
          }

        }

      ]).toArray()
          console.log(result);
      resolve(result[0])

    })

  }),


  editProduct: ((datas) => {
    
    datas.brand = ObjectId(datas.brand)
    datas.price = parseInt(datas.price);
    datas.stock = parseInt(datas.stock)

    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(datas.brand)}).then((response)=>{
        if(response.offerDisplay==true){
          offerPrice=(datas.price*response.offerPercentage)/100
          price=datas.price-offerPrice
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(datas.ProId)}, {
            $set: {
              name: datas.name,
              price: price,
              stock: datas.stock,
              discription: datas.discription,
              img: datas.img,
              brand: datas.brand,
              originalPrice:datas.price
            }
          }).then((response)=>{
            resolve(response)
          })
        }else{
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(datas.ProId)}, {
            $set: {
              name: datas.name,
              price: datas.price,
              stock: datas.stock,
              discription: datas.discription,
              img: datas.img,
              brand: datas.brand
            }
          }).then((response) => {
          resolve(response)
        })
        }
      })
       
    })

  }),

  nonvisibility: ((id) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, {
        $set: {
          status: false
        }
      }).then((response) => {
        resolve()
      })
    })
  }),

  visibility: ((id) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, {
        $set: {
          status: true
        }
      }).then((response) => {
        resolve()
      })
    })
  }),

  deleteProduct: ((id) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).remove({ _id: ObjectId(id) }).then((response) => {
        resolve()
      })
    })
  }),

  addBrand: (details) => {

    let response = {}

    return new Promise(async (resolve, reject) => {
      let brand = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ brand: { $regex: details.brand, $options: 'i' } })

      if (brand) {

        response.status = false
        response.err = "brand exist"
        resolve(response)
      }
      else {
        details.offerPrice = "",
          details.offerDisplay = false
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(details).then(() => {
          response.status = true
          console.log(details);
          resolve(response)
        })
      }

    })
  },

  getBrand: () => {
    return new Promise(async (resolve, reject) => {
      let brands = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()

      resolve(brands)

    })
  },

  updateStock: (details) => {
    details.stock = parseInt(details.stock)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(details.proId) }, {
        $set: {
          stock: details.stock
        }
      }).then((response) => {
        console.log(response);
        resolve()
      })
    })
  },



  geteditBrand: (brandId) => {


    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(brandId) }).then((response) => {
        resolve(response)
      })
    })
  },

  editBrand: (details) => {

    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(details.id) }, {
        $set: {
          brand: details.brand,
          img: details.img
        }
      }).then(() => {
        resolve()
      })
    })
  },

  removeBrand: (brandId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(brandId) }).then((response1) => {

        db.get().collection(collection.PRODUCT_COLLECTION).deleteMany({ brand: ObjectId(brandId) }).then((response2) => {

          resolve(response2)
        })
      })
    })
  },

  zoomProduct: (proId) => {

    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) }).then((response) => {
        resolve(response)
      })
    })
  },

  getBrandProduct: (brandId) => {

    return new Promise(async (resolve, reject) => {
      let result = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
          $match: { brand: ObjectId(brandId) }
        }, {
          $lookup: {
            from: collection.CATEGORY_COLLECTION,
            localField: 'brand',
            foreignField: '_id',
            as: 'brand'
          }
        }, {
          $project: {
            name: 1,
            price: 1,
            discription: 1,
            img: 1,
            brand: { $arrayElemAt: ["$brand", 0] },
            status: 1,
          }
        }
      ]).toArray()
    
      resolve(result)
    })
  },










  dailyReport: () => {

    return new Promise(async (resolve, reject) => {
      let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group: {
            _id: '$date',
            totalAmount: { $sum: "$total" },
          }
        }, { $sort: { _id: 1 } },
        { $limit: 7 }

      ]).toArray();

      resolve(result)
    })
  },




  monthlyReport: () => {

    return new Promise(async (resolve, reject) => {
      let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group: {
            _id: '$month',
            totalAmount: { $sum: "$total" },

          }
        }, { $sort: { _id: -1 } },
        {
          $limit: 12
        },
        { $sort: { _id: 1 } }

      ]).toArray();

      resolve(result)
    })
  },


  yearlyReport: () => {
    return new Promise(async (resolve, reject) => {
      let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group: {
            _id: '$year',
            totalAmount: { $sum: "$total" },

          }
        }, { $sort: { _id: -1 } }, {
          $limit: 5
        },
        { $sort: { _id: 1 } }

      ]).toArray();

      resolve(result)
    })
  },








  //........ashik



  getDailyReport: () => {
    console.log('rrrrrrrrrr');
    return new Promise((resolve, reject) => {

      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            'PaymentStatus': { $nin: ['Pending'] }
          }
        },
        {
          $group: {
            _id: '$date',
            DailySaleAmount: { $sum: "$total" },
            count: { $sum: 1 },

          },

        },

        { $limit: 7 },

        { $sort: { date: -1 } },


      ]).toArray().then((weekReport) => {


        resolve(weekReport)

      })
    })
  },




  getMonthlyReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            'PaymentStatus': { $nin: ['Pending'] }
          }
        },
        {
          $group: {
            _id: '$month',
            MonthlySaleAmount: { $sum: "$total" },
            count: { $sum: 1 },
          }
        },
         {
          $sort:{date:-1}
         }

      ]).toArray().then((weekReport) => {
        resolve(weekReport)

      })
    })
  },

  getYearlyReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            'AdminStatus': { $nin: ['order cancelled'] }
          }
        },
        {
          $group: {
            _id: '$year',
            YearlySaleAmount: { $sum: "$total" },
            count: { $sum: 1 },
          }
        },
        {
          $sort:{date:-1}
         }
   
      ]).toArray().then((weekReport) => {

        console.log(weekReport);
        resolve(weekReport)

      })

    })
  },



//..............................................................getDailyTotalSale.................................//
  getDailyTotalSale: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {  
            'PaymentStatus': { $nin: ['Pending'] }
          }
        },
        {
          $group: {
            _id: '$orderYear',
            dailyTotalSaleAmount: { $sum: "$total" },
          }
        },
        {
          $group: {
            _id: "",
            dailyTotalAmount: { $sum: "$dailyTotalSaleAmount" }
          }
        }
      ]).toArray().then((weekReport) => { 
        resolve(weekReport)
      })

    })
  },

//................................................................getMonthlyTotalSale..........................//
  getMonthlyTotalSale: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            'PaymentStatus': { $nin: ['Pending'] }
          }
        },
        {
          $group: {
            _id: '$year',
            MonthlyTotalSaleAmount: { $sum: "$total" },
          }
        },
        {
          $group: {
            _id: "",
            MonthlyTotalAmount: { $sum: "$MonthlyTotalSaleAmount" }
          }
        },
       {
        $sort:{
          month:-1
        }
       }
      ]).toArray().then((weekReport) => {
        resolve(weekReport)
      })
    })
  },
//...................................................................getYearlyTotalSale............................//
  getYearlyTotalSale: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            'PaymentStatus': { $nin: ['Pending'] }
          }
        },
        {
          $group: {
            _id: '$year',
            yearlyTotalSaleAmount: { $sum: "$total" },

          }
        },
        {
          $group: {
            _id: "",
            yearlyTotalAmount: { $sum: "$yearlyTotalSaleAmount" }
          }
        },
        {$sort:{year:-1}}
      ]).toArray().then((weekReport) => {
        resolve(weekReport)
      })
    })
  },
  //.............................................................OfferDisplay..............................//
  OfferDisplay: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).find({
        offerDisplay: true
      }).toArray().then((result) => {

        resolve(result)
      })
    })
  },
//........................................................noOfferDisplay...................................//
  noOfferDisplay: () => {
    return new Promise((resolve, rejevt) => {
      db.get().collection(collection.CATEGORY_COLLECTION).find({
        offerDisplay: { $ne: true }
      }).toArray().then((result) => {
        resolve(result)
      })
    })
  },
//....................................................offerManagement........................................//
  offerManagement: (details) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
        $match: { brand: ObjectId(details.id) }
      }, {
        $project: {
          _id: 1,
          name: 1,
          brand: 1,
          price: 1,
          image: 1
        }
      }
      ]).toArray().then((result) => {
        resolve(result)
      })
    })
  },
//......................................................priceOfferCut.....................................//
  priceOfferCut: (proDetails, offerPercentage) => {
    let offerper = parseInt(offerPercentage)
    let offerPrice = (proDetails.price * offerper / 100)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proDetails._id) }, {
        $set: {
          price: proDetails.price - offerPrice,
          offerPercentage: offerPercentage,
          originalPrice: proDetails.price
        }
      }).then((result) => {
        resolve()
      })
    })
  },
//.........................................................orderUpdate....................................//
  orderUpdate: (details) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(details.id) }, {
        $set: {
          offerDisplay: true,
          offerPercentage: details.offerpercentge
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
//.................................................................deleteOffer..................................//
  deleteOffer: (brandId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).find({brand:ObjectId(brandId)}).toArray().then((result) => {
        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(brandId)},
        {
          $unset: {
            offerPercentage:""
          }
        }).then(() => {
          db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(brandId)},
          {
            $set: {
              offerDisplay:false
            }
          }).then(()=>{
            resolve(result)
          })
          
       })
        
      })
    })
  },
//.....................................................offerDeleteProductUpdate...............................//
  offerDeleteProductUpdate: (details) => {
   let offerpercentage = details.offerPercentage,
     price = details.price
   return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(details._id) },
        {
          $unset: {
            offerPercentage: offerpercentage,
            price: price
          }
        }).then((result) => {
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(details._id) }, {
            $rename: {
              'originalPrice': 'price'
            }
          }).
            then((result) => {                
              })
          })
    })
  },
//..........................................................getReturnProducts.............................//
  getReturnProducts:()=>{
    return new Promise(async(resolve,reject)=>{
      let returnDetails=await db.get().collection(collection.RETURN_COLLECTION).find().toArray()
        resolve(returnDetails)  
    })
  },
//................................................getReturnProductDetails....................................//
  getReturnProductDetails:({orderId,productId})=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.RETURN_COLLECTION).aggregate([
        {
         $match:{orderId:ObjectId(orderId)}
       
      },
        {$lookup:{

          from:collection.ORDER_COLLECTION,
          localField:'orderId',
          foreignField:'_id',
          as:'orderDetails'
        }
      },
       {$lookup:{
         from:collection.PRODUCT_COLLECTION,
         localField:'productId',
        foreignField:'_id',
        as:'productDetails'
       }}
    ]).toArray().then((result)=>{
       console.log(result);
      resolve(result)
    })
    })
  },
//.........................................................confirmReturnProduct.................................//
  confirmReturnProduct:({orderId,productId})=>{ 
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId),'prodetails.items':ObjectId(productId)},{
        $set:{
          'prodetails.$.productstatus':'Return confirmed'
        }
      }).then((response)=>{
        db.get().collection(collection.RETURN_COLLECTION).updateOne({orderId:ObjectId(orderId)},{
          $set:{
            productStatus:'Return confirmed'
          }
        })
       resolve(response)
      })
    })
  },
//................................................................couponManagement.........................//
  couponManagement:(details)=>{
    console.log(details);
    return new Promise(async(resolve,reject)=>{
     let code=await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:details.couponCode})
     if(code){
      reject('code exist')
     }else{
      db.get().collection(collection.COUPON_COLLECTION).insertOne(details).then(()=>{
        resolve()
      })
     }  
    })
  },
//................................................................getCouponDetail..................................//
  getCouponDetail:()=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((response)=>{
        resolve(response)
      })
    })
  },
//.....................................................deleteCoupon.......................................//
  deleteCoupon:(couponId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(couponId)}).then((response)=>{
      resolve() 
      })
    })
  },
//........................................................graphPaymentMethodTotal..................................//
  PaymentMethodTotal:()=>{
    return new Promise (async(resolve,reject)=>{  
    let result=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
      $match:{
        PaymentStatus:{$eq:'Successful'}
      }
    },{
      $group:{
        _id:'$paymentMethod',
        totalAmount: { $sum: "$total" },
      }
    }
  ]) .toArray()
    resolve(result)
    })
  
    
  }
}

