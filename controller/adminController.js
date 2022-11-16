const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const productHelper = require('../helpers/product-helper');
const userHelper = require('../helpers/user-helper');
const { upload } = require('../public/javascripts/fileUpload');
const { post } = require('../routes/user');
 const dotenv=require('dotenv').config()

let credentials = {
  password: process.env.password,
  email:'abc@gmail.com'
}


let branderr
let brandExist = false

// ....................................adminLoginPage........................//
const adminLoginPage = function (req, res, next) {
  if (req.session.adminLogged) {
    res.redirect('/admin/login')
  } else
    err = req.session.err
  res.render('admin/admin-log', { err });
  req.session.err = null
}
//......................................AdminLoginPage...........................//
const getAdminLogin = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.returnCount().then((count) => {
      userHelper.customerCount().then((customerCount) => {
        userHelper.salesTotal().then((totalSales) => {
          userHelper.numOfProduct().then((proNumber) => {
            productHelper.monthlyReport().then((monthlyreport) => {
              productHelper.dailyReport().then((dailyreport) => {
                productHelper.yearlyReport().then((yearlyreport) => {
                  productHelper.PaymentMethodTotal().then((paymentMethodTotal)=>{
                  res.render('admin/admin-dashboard', { adminHeader: true, monthlyreport, dailyreport, yearlyreport, customerCount, totalSales, proNumber, count,paymentMethodTotal })
                })
              })
              })
            })
          })
        })
      })
    })
  } else {
    res.redirect('/admin')
  }
}
//.......................................................confirmAdmin....................// 
const confirmAdmin = (req, res) => {
 
  if (req.body.password ==credentials.password && req.body.email == credentials.email) {
    req.session.adminLogged = true
    req.session.admin = res.admin
    // console.log(req);
    res.redirect('/admin/login')
  } else {
    console.log('3333333333333');
    req.session.err = 'invalid details'
    res.redirect('/admin')
   
  
   
  }
}
//...................................................view Products............................//
const viewproducts = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.returnCount().then((count) => {
      productHelper.getadminAllProducts().then((products) => {
        res.render('admin/admin-viewproducts', { adminHeader: true, products, count })
      })
    })
  } else {
    res.redirect('/admin')
  }
}
//   ............................................addProductsPage............................//
const addProductPage = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.returnCount().then((count) => {
      productHelper.getBrand().then((response) => {
        res.render('admin/add-products', { adminHeader: true, response, count })
      })
    })
  } else {
    res.redirect('/admin',)
  }
}
//....................................................addProduct..........................//
const addProduct = (req, res) => {
  console.log(req.body);
  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const product = req.body
  product.img = fileName
  productHelper.addProducts(product).then((id) => {
    res.redirect('/admin/viewproducts')
  })
}

//.................................................editProductPage.........................//
const editPage = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.returnCount().then((count) => {
      productHelper.geteditProduct(req.params.id).then((datas) => {
        productHelper.getBrand().then((response) => {
          res.render('admin/edit-products', { datas, adminHeader: true, response, count })
        })
      })
    })
  } else {
    res.redirect('/admin')
  }
}

//   ............................................posteditpage.....................................//
const postEditPage = (req, res) => {
 
  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const product = req.body
  product.img = fileName
  productHelper.editProduct(product).then((response) => {
    res.redirect('/admin/viewproducts')
  })
}

// ...............................................blockproduct.....................................//
const blockProduct = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.returnCount().then((count) => { })
    productHelper.nonvisibility(req.params.id).then(() => {
      res.redirect('/admin/viewproducts')
    })
  }
  else {
    res.redirect('/admin')
  }
}

//   ................................................unblockproduct..................................//
const unblockProduct = (req, res) => {
  if (req.session.adminLogged) {
    productHelper.visibility(req.params.id).then(() => {
      res.redirect('/admin/viewproducts',)
    })
  } else {
    res.redirect('/admin')
  }
}

//   .....................................................deleteproduct........................//
const deleteProduct = (req, res) => {
  if (req.session.adminLogged) {
    productHelper.deleteProduct(req.params.id).then(() => {
      res.redirect('/admin/viewproducts')
    })
  } else {
    res.redirect('/admin')
  }
}

//.......................................................viewUsers................................//
const viewUsers = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.returnCount().then((count) => {
      userHelper.getallUsers().then((users) => {
        res.render('admin/admin-viewusers', { adminHeader: true, users, count }
        )
      })
    })
  } else {
    res.redirect('/admin')
  }
}

//   .........................................getadduserPage.........................................//
const getaddUser = (req, res) => {
  if (req.session.adminLogged) {
    res.render('admin/add-user')
  } else {
    res.redirect('/admin')
  }
}

//   ................................................postAddUser........................................//
const postAddUser = (req, res) => {
  userHelper.addUser(req.body).then(() => {
    res.redirect('/admin/viewusers')
  })
}

//   ....................................................blockUser....................................//
const blockUser = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.blockUser(req.params.id).then(() => {
      res.redirect('/admin/viewusers')
    })
  } else {
    res.redirect('/admin')
  }
}

//   .......................................................unblockUser.................................//
const unblockUser = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.unblockUser(req.params.id).then(() => {
      res.redirect('/admin/viewusers')
    })
  } else {
    res.redirect('/admin')
  }
}

//   .........................................................dashboard...................................//
const dashboard = (req, res) => {
  if (req.session.adminLogged) {
    userHelper.returnCount().then((count) => {
      userHelper.customerCount().then((customerCount) => {
        userHelper.salesTotal().then((totalSales) => {
          userHelper.numOfProduct().then((proNumber) => {
            productHelper.monthlyReport().then((monthlyreport) => {
              productHelper.dailyReport().then((dailyreport) => {
                productHelper.yearlyReport().then((yearlyreport) => {
                  productHelper.PaymentMethodTotal().then((paymentMethodTotal)=>{
                    res.render('admin/admin-dashboard', { adminHeader: true, count, customerCount, totalSales, proNumber, monthlyreport, dailyreport, yearlyreport,paymentMethodTotal })
                  })
                  
                })
              })
            })
          })
        })
      })
    })
  } else {
    res.redirect('/admin')
  }
}

//   ...................................................................logout...............................//
const logout = (req, res) => {
  req.session.destroy()
  res.redirect('/admin')
}

//   ......................................................orderDetails.............................//
const orderDetils = (req, res) => {
  userHelper.returnCount().then((count) => {
    userHelper.getAllOrders().then((details) => {
      res.render('admin/order-details', { adminHeader: true, details, count })
    })
  })
}

//   ..........................................................orderMoreDetails.......................//
const more = async (req, res) => {
  let details = await userHelper.getMoreDetails(req.params.id)
  let address = await userHelper.orderAddress(req.params.id)
  console.log(details);
  console.log(details[0].orderDetails.prodetails);
  console.log(details[0].productList);
  
  res.render('admin/order-summary', { adminHeader: true, details, address })
}

//................................................changeStatus.......................................//
const changeStatus = async (req, res) => {
  console.log(req.body);
  let result = await userHelper.changeStatus(req.body)
  if (req.body.status === 'Return confirmed') {
    userHelper.stockCheck(req.body.orderId).then((result) => {
      result.forEach(element => {
        userHelper.stockIncCancel(element)
        res.json('hai')
      });
    })
  } else {
    res.json('hai')
  }
}

// ...........................................................category................................//
const categories = (req, res) => {
  userHelper.returnCount().then((count) => {
    productHelper.getBrand().then((brands) => {
      res.render('admin/admin-category', { adminHeader: true, brands, count })
    })
  })
}

// .......................................................getAddBrand.............................//
const addBrand = (req, res) => {
  res.render('admin/brand', { adminHeader: true, brandExist, branderr })
  brandExist = false
}

// ........................................................postaddBrand...............................//
const postAddBrand = (req, res) => {
  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const product = req.body
  product.img = fileName
  productHelper.addBrand(req.body).then((response) => {
    if (response.status) {
      res.redirect('/admin/category')
    } else {
      brandExist = true
      branderr = response.err;
      console.log(branderr);
      res.redirect('/admin/addBrand')
    }
  })
}

// .........................................deleteBrand.........................................//
const deleteBrand = (req, res) => {
  productHelper.removeBrand(req.body.brand).then((response) => {
    res.json(response)
  })
}

// ....................................................getEditBrand....................................//
const getEditBrand = (req, res) => {
  productHelper.geteditBrand(req.params.Id).then((response) => {
    res.render('admin/edit-brand', { response, adminHeader: true })
  })
}

// ..................................................postEditBrand......................................//
const postEditBrand = (req, res) => {
  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const product = req.body
  product.img = fileName
  productHelper.editBrand(product).then(() => {
    res.redirect('/admin/category')
  })
}

// .....................................................salesReport....................................//
const salesReport = (req, res) => {
  userHelper.returnCount().then((count) => {
    productHelper.getDailyReport().then((dailyReport) => {
      productHelper.getDailyTotalSale().then((dailyTotalAmount) => {
        productHelper.getMonthlyReport().then((monthlyReport) => {
          productHelper.getMonthlyTotalSale().then((monthlyTotalAmount) => {
            productHelper.getYearlyReport().then((yearlyReport) => {
              productHelper.getYearlyTotalSale().then((yearlyTotalAmount) => {
                res.render('admin/salesReport', { adminHeader: true, dailyReport, dailyTotalAmount, monthlyReport, monthlyTotalAmount, yearlyReport, yearlyTotalAmount, count })
              })
            })

          })
        })
      })
    })
  })
}

// ............................................stockUpdate..................................//
const stockUpdate = (req, res) => {
  productHelper.updateStock(req.body).then(() => {
    res.redirect('/admin/viewproducts')
  })
}

// ....................................................returnproducts.............................//
const returnProducts = (req, res) => {
  productHelper.getReturnProducts().then((details) => {
    res.render('admin/return-product', { adminHeader: true, details })
  })
}

// .............................................................brandofferManagement....................//
const brandOfferManagement = (req, res) => {
  userHelper.returnCount().then((count) => {
    productHelper.OfferDisplay().then((offer) => {
      productHelper.noOfferDisplay().then((notOffer) => {
        res.render('admin/offerManagement', { adminHeader: true, offer, notOffer, count })
      })
    })
  })
}

// ..............................................................offerSetting..................................//
const offerSetting = (req, res) => {
  productHelper.offerManagement(req.body).then((result) => {
    productHelper.orderUpdate(req.body).then(() => {
      result.forEach(element => {
        productHelper.priceOfferCut(element, req.body.offerpercentge).then(() => {
        })
      })
    })
    res.redirect('/admin/brandofferManagement')
  })
}

// ................................................................deleteOffer.................................//
const delteOffer = (req, res) => {
  productHelper.deleteOffer(req.params.id).then((result) => {
    result.forEach(async element => {
      await productHelper.offerDeleteProductUpdate(element)
    });
    res.redirect('/admin/brandofferManagement')
  })
}

// .....................................................returnProductDetails....................................//
const returnProductDetails = (req, res) => {
  console.log(req.query);
  productHelper.getReturnProductDetails(req.query).then((details) => {
    console.log(details);
    res.render('admin/return-product-details', { details, adminHeader: true })
  })
}

// ....................................................postreturproduct...............................//
const postReturnProduct = (req, res) => {
  productHelper.confirmReturnProduct(req.query).then((response) => {
    res.redirect('/admin/returnProducts')
  })
}

// ........................................................offerCategories...............................//
const offerCategories = (req, res) => {
  res.render('admin/offer-categories', { adminHeader: true })
}

// ................................................couponOfferMangaement.................................//
const couponOfferManagement = (req, res) => {
  productHelper.getCouponDetail().then((response) => {
    console.log(response);
    res.render('admin/coupon-offerManagement', { adminHeader: true, response, branderr })
    branderr = null
  })
}

//.......................................................postCouponDetails.................................//
const postCouponDetails = (req, res) => {
  productHelper.couponManagement(req.body).then(() => {
    res.redirect('/admin/couponOfferManagement')
  }).catch((error) => {
    branderr = error
    res.redirect('/admin/couponOfferManagement')
  })
}

//.......................................................deleteCoupon......................................//
const deleteCoupon = (req, res) => {
  productHelper.deleteCoupon(req.params.Id).then(() => {
    res.redirect('/admin/couponOfferManagement')
  })
}

//.................................................................adminRegundApproved.......................//
const adminReFundApproved = (req, res) => {
  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2');
  console.log(req.body);

  userHelper.refundApproved(req.body).then((orderDetails) => {
   
      let orderId = ObjectId(req.body.orderId)
      userHelper.stockCheck(orderId).then((result) => {
        result.forEach(element => {
          userHelper.stockIncCancel(element).then(()=>{
            let response={
              success:true
            }

            res.json(response)

          })
           

         
        })
      })
   
  })
}










module.exports = {
  adminLoginPage, getAdminLogin, confirmAdmin, viewproducts, addProductPage, addProduct, editPage, postEditPage, blockProduct, unblockProduct, deleteProduct, viewUsers,
  getaddUser, postAddUser, blockUser, unblockUser, dashboard, logout, orderDetils, more, changeStatus, categories, addBrand, postAddBrand, deleteBrand, getEditBrand, postEditBrand,
  salesReport, stockUpdate, returnProducts, brandOfferManagement, offerSetting, delteOffer, returnProductDetails, postReturnProduct, offerCategories, couponOfferManagement, postCouponDetails,
  deleteCoupon, adminReFundApproved 
}