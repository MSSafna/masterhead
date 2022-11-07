const { options } = require("./routes/user");

module.exports={
    ifEquals:(value1,value2,options)=>{
        
        if(value1==value2){           
           return options.fn()
        }
        else{  
            return options.inverse();   
        }
    },


    indexing:(index)=>{
        return parseInt(index)+1;
    },


    statusColor:(value)=>{
        if(value==='cancelled'){
            return 'text-danger'
        }else if(value==='placed'){
            return 'text-success'
        }
    },


    wishlistHeartIcon:(productId,wishlistArray,options)=>{
        if(wishlistArray){
            function doesAnyWishlistIdMatch(wishlist){
                return productId == wishlist._id
            }
            if(wishlistArray.some(doesAnyWishlistIdMatch)){
                return options.fn()
            }else{
                return options.inverse();   
            }
        }else{
            return options.inverse();   
        }
        
    },

    logicalOr:(AdminStatus,options)=>{
        
        if(AdminStatus=='order confirmed'||AdminStatus=='placed'||AdminStatus=='shipped'||AdminStatus==' order placed'){
            console.log(AdminStatus);
            return options.fn()
        }else if(AdminStatus=='order confirmed'||AdminStatus=='Delivered'){
            return options.inverse();
        }
    },

    AdminlogicalOr:(AdminStatus,options)=>{
        
        if(AdminStatus =='order cancelled'||AdminStatus =='Refund'){
            return options.fn()
        }else {
            return options.inverse();
        }
    },


    brandFilterboxChecked:(filteredProducts,brands,options)=>{
        

        let brandId=filteredProducts.map((element)=>{
            return  element.brand._id
            
        })
       
       
       let boolean=brandId.some((elements)=>{
        return elements.toString()==brands.toString()
           
       })
       if(boolean){
        return options.fn()
       }else{
        return options.inverse();
       }
       
    },


    adminRefundPaymentMethodChecking:(paymentMethod,options)=>{
       
        if(paymentMethod!='cod'){
            return options.fn()
        }else{
            return options.inverse()
        }
    } ,
    
    productsPrev:(value1,value2,options)=>{
        if(value1==value2){
            return options.fn()
        }else{
            return options.inverse()
        }
        
    },


productsNext:(value1,value2,options)=>{
        if(value1==value2){
            return options.fn()
        }else{
            return options.inverse()
        }
    },
    
statusColor:(AdminStatus,options)=>{
    if(AdminStatus=='Return confirmed'||AdminStatus=='order cancelled'){
        return options.fn()
    }else{ 
        return options.inverse()
    }
},

orderConfirmedtrackOrder:(AdminStatus,options)=>{
    
    if(AdminStatus=='order confirmed'||AdminStatus=='Shipped'||AdminStatus=='Delivered'){
        return options.fn()
    }else{
        return options.inverse()
    }
},



shippedTrackOrder:(AdminStatus,options)=>{
     console.log(AdminStatus);
    if(AdminStatus=='Shipped'||AdminStatus=='Delivered'){
        return options.fn()
    }else{
        return options.inverse()
    }
},


deliveredTrackOrder:(AdminStatus,options)=>{
    
    if(AdminStatus=='Delivered'){
        return options.fn()
    }else{
        return options.inverse()
    }
},

trackOrderDisplay:(AdminStatus,options)=>{
    if(AdminStatus=='Return confirmed'||AdminStatus=='Refund'||AdminStatus=='order cancelled'){
          return options.fn()
    }else{
        return options.inverse()
    }
},

deliveryDate:(Date)=>{
    let date=Date.slice(8,10)
    parsedate=parseInt(date)
    let deliveryDate=parsedate+5
    console.log(deliveryDate);
    let newDate=Date.slice(0,7)
    finaldate=(newDate)+(-deliveryDate)
    console.log(finaldate);
    return (finaldate)
  
}

}

