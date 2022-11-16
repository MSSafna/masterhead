var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var fileUpload=require('express-fileupload')
const hbs =require('express-handlebars')
var session = require('express-session')
var usersRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const nocache = require('nocache');
const hbsHelpers= require('./hbsHelpers')
 const env=require('dotenv').config()
var app = express();





// view engine setup

const expressHelpers=hbs.create({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials',
      helpers:{
        ifEquals:hbsHelpers.ifEquals,
        indexing:hbsHelpers.indexing,
        statusColor:hbsHelpers.statusColor,
        wishlistHeartIcon:hbsHelpers.wishlistHeartIcon,
        logicalOr:hbsHelpers.logicalOr,
        AdminlogicalOr:hbsHelpers.AdminlogicalOr,
        brandFilterboxChecked:hbsHelpers.brandFilterboxChecked,
        adminRefundPaymentMethodChecking:hbsHelpers.adminRefundPaymentMethodChecking,
        productsPrev:hbsHelpers.productsPrev,
        productsNext:hbsHelpers.productsNext,
        indexing:hbsHelpers.indexing,
        statusColor:hbsHelpers.statusColor,
        shippedTrackOrder:hbsHelpers.shippedTrackOrder,
        orderConfirmedtrackOrder:hbsHelpers.orderConfirmedtrackOrder,
        deliveredTrackOrder:hbsHelpers.deliveredTrackOrder,
        trackOrderDisplay:hbsHelpers.trackOrderDisplay,
        deliveryDate:hbsHelpers.deliveryDate,
        totalAftercoupon:hbsHelpers.totalAftercoupon,
        totalPrice:hbsHelpers.totalPrice,
        Productstatus:hbsHelpers.Productstatus,
        Productcancelled:hbsHelpers.Productcancelled,
        totalPrice:hbsHelpers.totalPrice,
        adminChangeStatus:hbsHelpers.adminChangeStatus,
        trackOrderDisplay:hbsHelpers.trackOrderDisplay,
        orderHistoryviewCart:hbsHelpers.orderHistoryviewCart
      }
})
app.engine('hbs', expressHelpers.engine)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.engine('hbs',expbs.engine({
//   extname:'hbs',
//   defaultLayout:'layout',
//   layoutsDir:__dirname+'/views/layout/',
//   partialsDir:__dirname+'/views/partials'
// }));





app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge:600000 }
}));
app.use(nocache());
// app.use(fileUpload())

var db=require('./config/connection')

db.connect((err)=>{
  if(err)
  console.log('connection error' +err)
  else
  console.log('database connected')
})


app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
