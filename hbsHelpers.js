const { text } = require("express");
const { options } = require("./routes/user");

module.exports = {
    ifEquals: (value1, value2, options) => {
console.log('rrrrrrrrrrrrrrr');
        if (value1 == value2) {
            return options.fn()
        }
        else {
            return options.inverse();
        }
    },




    indexing: (index) => {
        return parseInt(index) + 1;
    },


    statusColor: (value) => {
        if (value === 'Product cancelled') {
            return 'text-danger'
        } else if (value === 'placed') {
            return 'text-success'
        }
    },


    

    logicalOr: (AdminStatus, options) => {

        if (AdminStatus == 'order confirmed' || AdminStatus == 'orderPlaced' || AdminStatus == 'shipped' || AdminStatus == ' order placed') {
            console.log(AdminStatus);
            return options.fn()
        } else if (AdminStatus == 'order confirmed' || AdminStatus == 'Delivered') {
            return options.inverse();
        }
    },

    AdminlogicalOr: (AdminStatus, options) => {

        if (AdminStatus == 'order cancelled' || AdminStatus == 'Refund') {
            return options.fn()
        } else {
            return options.inverse();
        }
    },


    brandFilterboxChecked: (filteredProducts, brands, options) => {


        let brandId = filteredProducts.map((element) => {
            return element.brand._id

        })


        let boolean = brandId.some((elements) => {
            return elements.toString() == brands.toString()

        })
        if (boolean) {
            return options.fn()
        } else {
            return options.inverse();
        }

    },


    adminRefundPaymentMethodChecking: (paymentMethod, options) => {

        if (paymentMethod != 'cod') {
            return options.fn()
        } else {
            return options.inverse()
        }
    },

    productsPrev: (value1, value2, options) => {
        if (value1 == value2) {
            return options.fn()
        } else {
            return options.inverse()
        }

    },


    productsNext: (value1, value2, options) => {
        if (value1 == value2) {
            return options.fn()
        } else {
            return options.inverse()
        }
    },

    statusColor: (AdminStatus, options) => {
        if (AdminStatus == 'Successful' || AdminStatus == 'order cancelled') {
            return options.fn()
        } else {
            return options.inverse()
        }
    },


    orderConfirmedtrackOrder: (productStatus, options) => {
      
        if (productStatus == 'orderPlaced' || productStatus == 'Shipped' || productStatus == 'Delivered' ||productStatus=='Product cancelled') {
            return options.fn()
        } else {
            return options.inverse()
        }
    },



    shippedTrackOrder: (productStatus, options) => {
      
        if (productStatus == 'Shipped' || productStatus == 'Delivered'||productStatus=='Product cancelled') {
            return options.fn()
        } else {
            return options.inverse()
        }
    },


    deliveredTrackOrder: (productStatus, options) => {

        if (productStatus == 'Delivered') {
            return options.fn()
        } else if(productStatus=='Shipped' || productStatus=='orderPlaced') {
            return options.inverse()
        }
    },

    Productcancelled:(productStatus,options)=>{
        if(productStatus=='Product cancelled'){
            return options.fn()
        }else{
            return options.inverse() 
        }
    },

    trackOrderDisplay: (AdminStatus, options) => {
        if (AdminStatus == 'Return confirmed' || AdminStatus == 'Refund' || AdminStatus == 'order cancelled') {
            return options.fn()
        } else {
            return options.inverse()
        }
    },

    deliveryDate: (Date) => {
        let date = Date.slice(8, 10)
        parsedate = parseInt(date)
        let deliveryDate = parsedate + 5
        console.log(deliveryDate);
        let newDate = Date.slice(0, 7)
        finaldate = (newDate) + (-deliveryDate)
        console.log(finaldate);
        return (finaldate)

    },

    totalAftercoupon: (total,Maxoffer)=>{
        console.log(total);
        console.log(Maxoffer);
       let totalPurchaseAmt=total-Maxoffer
       console.log(totalPurchaseAmt);
        return (totalPurchaseAmt)
    },

    totalPrice:(proQty,proPrice)=>{
        console.log(proQty);
        let productTotalPrice=proQty*proPrice
        return(productTotalPrice)
    },
    invoiceQuantity:(productListArray,productId)=>{

    },

    Productstatus:(productStatus,options)=>{
        console.log(productStatus);
        if(productStatus==='Product cancelled'|| productStatus==='Return request'){
            return options.fn()
        }else{
            return options.inverse()
        }
       
    },

    totalPrice(quantity,price){
        let totalPrice=quantity*price
        return(totalPrice)
    },

    adminChangeStatus:(productStatus,options)=>{
     if(productStatus=='Delivered'||productStatus=='Refunded'||productStatus=='Product cancelled'||productStatus=='Return request'){
        return options.fn()
     }else{
        return options.inverse()
     }
    },

    trackOrderDisplay:(productStatus,options)=>{
        if(productStatus=='Refunded'||productStatus=='Return confirmed'||productStatus=='Return request'){
            return options.fn()
        }else{
            return options.inverse()
        }
    },

    orderHistoryviewCart:(paymentStatus,options)=>{
        if(paymentStatus=='Pending'){
            return options.fn()
        }else{
            return options.inverse()
        }
    }
}

   

