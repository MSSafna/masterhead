const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const productHelper = require('../helpers/product-helper');
const userHelper = require('../helpers/user-helper');
const { upload } = require('../public/javascripts/fileUpload');
 const dotnet=require('dotenv').config()

const {adminLoginPage, getAdminLogin,confirmAdmin,viewproducts,addProductPage,addProduct,editPage,postEditPage,blockProduct,unblockProduct,deleteProduct,viewUsers,
  getaddUser,postAddUser,blockUser,unblockUser,dashboard,logout,orderDetils,more,changeStatus,categories,addBrand,postAddBrand,deleteBrand,getEditBrand,postEditBrand,
  salesReport,stockUpdate,returnProducts,brandOfferManagement,offerSetting,delteOffer,returnProductDetails,postReturnProduct,offerCategories,couponOfferManagement,postCouponDetails,
  deleteCoupon,adminReFundApproved }=require('../controller/adminController')

  const adminsessionHandler = (req, res, next) => {
    if (req.session.adminLogged) {
      next()
    } else {
      res.redirect('/admin')
    }
  }

//......................................testingAdminLogin.............................//

router.get('/',adminLoginPage);

// .................................... get AdminLoginPage...............................//
router.get('/login',getAdminLogin) 

// ........................................Confirm Admin................................//
router.post('/login',confirmAdmin );

//.............................................view Products.......................................//
router.get('/viewproducts',adminsessionHandler,viewproducts );

//..........................................addProductsPage.............................................//
router.get('/addproduct',adminsessionHandler,addProductPage);

//............................................addProduct.......................................//
router.post('/addproduct',adminsessionHandler, upload.array('image'),addProduct );

//............................................editProductPage............................//
router.get('/edit-product/:id',adminsessionHandler,editPage );

//..............................................postedit............................//
router.post('/editproduct',adminsessionHandler, upload.array('image'),postEditPage)

// ...............................................blockproduct..............................//
router.get('/block/:id',adminsessionHandler,blockProduct)

//.................................................unblockproduct.................................//
router.get('/unblock/:id',adminsessionHandler,unblockProduct)

//............................................deleteProduct...................................//
router.get('/delete/:id',adminsessionHandler,deleteProduct)

// ..............................................viewUsers................................//
router.get('/viewusers',adminsessionHandler,viewUsers)

// .....................................................adduserPage.................................//
router.get('/adduser',adminsessionHandler,getaddUser )

// ....................................................postaddUser.................................//
router.post('/adduser',adminsessionHandler,postAddUser)

// .......................................................bllockUser................................//
router.get('/blockuser/:id',adminsessionHandler,blockUser)

// .........................................................unblockUser.................................//
router.get('/unblockuser/:id',adminsessionHandler,unblockUser)

// .......................................................dashboard.....................................//
router.get('/dashboard',adminsessionHandler,dashboard)

// ...............................................................logout...........................//
router.get('/logout',logout)

// .........................................................orderDetails.................................//
router.get('/orders',adminsessionHandler,orderDetils)

// ..........................................................orderMoreDetails..........................//
router.get('/more/:id',adminsessionHandler,more)

// .........................................................changeStatus.............................//
router.post('/changeStatus',adminsessionHandler,changeStatus)

// .........................................................category.................................//
router.get('/category',adminsessionHandler,categories)

// ..............................................................getAddBrand............................//
router.get('/addBrand',adminsessionHandler,addBrand)

// .......................................................postAddBrand...........................//
router.post('/addBrand',adminsessionHandler, upload.any('image'),postAddBrand)

// ..............................................deletebrand.......................................//
router.post('/deletebrand',adminsessionHandler,deleteBrand)

// ............................................geteditBrand........................................//
router.get('/edit/:Id',adminsessionHandler,getEditBrand)

// .............................................posteditBrand.....................................//
router.post('/edit',adminsessionHandler, upload.any('image'),postEditBrand)

// .............................................salesReport...........................................//
router.get('/salesReport',adminsessionHandler,salesReport)

// ................................................stockupdate...........................................//
router.post('/stockupdate',adminsessionHandler,stockUpdate)

// ......................................................returnProducts...................................//
router.get('/returnProducts',adminsessionHandler,returnProducts)

// ........................................................brandOfferManagement................................//
router.get('/brandofferManagement',adminsessionHandler,brandOfferManagement)

// ..........................................................offerSetting......................................//
router.post('/offerSetting',adminsessionHandler,offerSetting)

// ........................................................deleteOffer.....................................//
router.get('/deleteOffer:id',adminsessionHandler,delteOffer)

// .....................................................returnProductDetails..............................//
router.get('/return-product-details',adminsessionHandler,returnProductDetails)

// ................................................postreturnConfirmed...............................//
router.get('/returnConfirmed',adminsessionHandler,postReturnProduct)

// .................................offerCategories.............................................//
router.get('/offer-categories',adminsessionHandler,offerCategories)

// ......................................couponOfferManagement....................................//
router.get('/couponOfferManagement',adminsessionHandler,couponOfferManagement)

//........................................coupondetails...........................................//
router.post('/couponDetails',adminsessionHandler,postCouponDetails )

// .................................deleteCoupon...............................................//

router.get('/deleteCoupon:Id',adminsessionHandler,deleteCoupon )

//..................................................adminRegundApproved...............................//
router.post('/adminRefundApproved',adminsessionHandler,adminReFundApproved )


module.exports = router;
