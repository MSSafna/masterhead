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

//......................................testingAdminLogin.............................//

router.get('/',adminLoginPage);

// .................................... get AdminLoginPage...............................//
router.get('/login',getAdminLogin) 

// ........................................Confirm Admin................................//
router.post('/login',confirmAdmin );

//.............................................view Products.......................................//
router.get('/viewproducts',viewproducts );

//..........................................addProductsPage.............................................//
router.get('/addproduct',addProductPage);

//............................................addProduct.......................................//
router.post('/addproduct', upload.array('image'),addProduct );

//............................................editProductPage............................//
router.get('/edit-product/:id',editPage );

//..............................................postedit............................//
router.post('/editproduct', upload.array('image'),postEditPage)

// ...............................................blockproduct..............................//
router.get('/block/:id',blockProduct)

//.................................................unblockproduct.................................//
router.get('/unblock/:id',unblockProduct)

//............................................deleteProduct...................................//
router.get('/delete/:id',deleteProduct)

// ..............................................viewUsers................................//
router.get('/viewusers',viewUsers)

// .....................................................adduserPage.................................//
router.get('/adduser',getaddUser )

// ....................................................postaddUser.................................//
router.post('/adduser',postAddUser)

// .......................................................bllockUser................................//
router.get('/blockuser/:id',blockUser)

// .........................................................unblockUser.................................//
router.get('/unblockuser/:id',unblockUser)

// .......................................................dashboard.....................................//
router.get('/dashboard',dashboard)

// ...............................................................logout...........................//
router.get('/logout',logout)

// .........................................................orderDetails.................................//
router.get('/orders',orderDetils)

// ..........................................................orderMoreDetails..........................//
router.get('/more/:id',more)

// .........................................................changeStatus.............................//
router.post('/changeStatus',changeStatus)

// .........................................................category.................................//
router.get('/category',categories)

// ..............................................................getAddBrand............................//
router.get('/addBrand',addBrand)

// .......................................................postAddBrand...........................//
router.post('/addBrand', upload.any('image'),postAddBrand)

// ..............................................deletebrand.......................................//
router.post('/deletebrand',deleteBrand)

// ............................................geteditBrand........................................//
router.get('/edit/:Id',getEditBrand)

// .............................................posteditBrand.....................................//
router.post('/edit', upload.any('image'),postEditBrand)

// .............................................salesReport...........................................//
router.get('/salesReport',salesReport)

// ................................................stockupdate...........................................//
router.post('/stockupdate',stockUpdate)

// ......................................................returnProducts...................................//
router.get('/returnProducts',returnProducts)

// ........................................................brandOfferManagement................................//
router.get('/brandofferManagement',brandOfferManagement)

// ..........................................................offerSetting......................................//
router.post('/offerSetting',offerSetting)

// ........................................................deleteOffer.....................................//
router.get('/deleteOffer:id',delteOffer)

// .....................................................returnProductDetails..............................//
router.get('/return-product-details',returnProductDetails)

// ................................................postreturnConfirmed...............................//
router.get('/returnConfirmed',postReturnProduct)

// .................................offerCategories.............................................//
router.get('/offer-categories',offerCategories)

// ......................................couponOfferManagement....................................//
router.get('/couponOfferManagement',couponOfferManagement)

//........................................coupondetails...........................................//
router.post('/couponDetails',postCouponDetails )

// .................................deleteCoupon...............................................//

router.get('/deleteCoupon:Id',deleteCoupon )

//..................................................adminRegundApproved...............................//
router.post('/adminRefundApproved',adminReFundApproved )


module.exports = router;
