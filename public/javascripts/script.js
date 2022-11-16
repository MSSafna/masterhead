

function changeQuantity(cartId, productId, count) {
  let quantityf = parseInt(document.getElementById(productId).innerHTML);
  let countf = parseInt(count);
  console.log(quantityf);
  console.log(countf);
  $.ajax({
    url: "/change-product-quantity",
    data: {
      cart: cartId,
      product: productId,
      count: countf,
      quantity: quantityf,
    },
    method: "post",
    success: (response) => {
      console.log(response);
      if (response.response.stockerr) {
        document.getElementById('stockerr' + response.response._id).style.display = 'block'
        //  location.reload()

      } else if (response.response.inc) {

        let price = document.getElementById("price" + productId).innerHTML;


        let newqty = (document.getElementById(productId).innerHTML =
          quantityf + count);
        let total = (document.getElementById("total" + productId).innerHTML =
          price * newqty);
        console.log(total);
        document.getElementById("grandTotal1").innerHTML =
          response.grandTotal[0].total;
        document.getElementById("grandTotal2").innerHTML =
          response.grandTotal[0].total;
        document.getElementById("stockerr" + response.response.proId).style.display = "none";
      }
      // else {

      //   document.getElementById("stockerr"+response.response.proId).style.display = "block";
      // }
    },
  });
}

//.........................................................ordercancellation..................................//


function cancelProduct(proId,orderId){
 
  swal({
    title: "Are you sure?",
    text: "Do you want to cancel this product",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })

    .then((willDelete) => {
      if (willDelete) {

        $.ajax({
          url: '/cancelProduct',
          data: {
            product: proId,
            order:orderId 
          },
          method:"post",
          success: (response) => {

            swal("", {
              icon: "success",

            }).then(function () {
              location.reload();
            })
          }

        })

      } else {
        swal("Order is placed",{
          icon:'success'
        });
      }
    })
}
//.................................//......................................
function changeStatus(orderId,proId) {
  
  let value = document.getElementById("changestatus"+proId).value;
  
  $.ajax({
    url: "/admin/changeStatus",
    data: {
      orderId:orderId,
      status: value,
      proId:proId
    },
    method: "post",
    success: (response) => {
      location.reload();
    },
  });
}

//.......................................

$("#checkoutform").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/checkout",
    method: "post",
    data: $("#checkoutform").serialize(),
    success: (response) => {
      console.log(response);
      if (response.sucessCod) {
        alert("success");
        location.href = "/successful";
      } else if (response.error) {
        alert(response.error);
        location.reload();
      } else if (response.sucessrazo) {
        console.log(response);

        razorpay(response);
      } else {
        console.log(response);
        paypal(response);
      }
    },
  });
});

// $("#couponAplly").submit((e) => {
//   alert('wertyuiop')
//   e.preventDefault();
//   // $.ajax({
//   //   url: "/applyCoupon",
//   //   method: "post",
//   //   data: $("#couponAplly").serialize(),
//   //   success: (response) => {
//   //     console.log(response);
//   //     if (response.status) {
//   //       alert("couponapllied");
//   //       console.log(response);
//   //       alert(response.response.total);
//   //       document.getElementById("total").innerHTML = response.response.total;
//   //       location.href = "/checkout?total=" + response.response.total;
//   //     }
//   //   },
//   // });
// });

function razorpay(details) {
  var options = {
    key: "rzp_test_TLImELoayCEs6j",
    amount: details.amount,
    currency: "INR",
    name: "Mater HEad",
    description: "Test Transaction",
    image: "assets/images/logo.png",
    order_id: details.id,
    handler: function (response) {
      verifyPayment(response, details);
    },
    prefill: {
      name: details.userDetails.name,
      email: details.userDetails.email,
      contact: details.userDetails.number,
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#528FF0",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
}

function verifyPayment(payment, order) {
  $.ajax({
    url: "/verify-payment",
    data: {
      payment: payment,
      order: order,
    },
    method: "post",
    success: (response) => {
      console.log(response);
      if (response.status) {
        location.href = "/successful";
      } else {
        // alert('paymentdfailes')
      }
    },
  });
}

function paypal(response) {
  alert("paupal");
  console.log(response);
  $.ajax({
    url: "/pay",
    data: {
      orderId: response.orderId,
      proQty: response.proQty,
      ProId: response.proId,
    },
    method: "post",
    success: (response) => {
      location.href = response;
    },
  });
}

function addToCart(productId) {
  $.ajax({
    url: "/productToCart",
    data: {
      productId: productId,
    },
    method: "get",
    success: (response) => {
      if (response.status) {
        // swal("Good job!", "Added to the cart!", "success");
        swal("Added to cart", {
          icon: "success",

        }).then(function () {
          let count = $("#cartCount").html()
          count = parseInt(count) + 1;
          $("#cartCount").html(count);
          location.reload();
        })

      } else {
        location.href = "/login";
      }
    },
  });
}

function orderDetails(orderId) {
  alert("uuuufdfghv");

  $.ajax({
    url: "/viewProduct",

    data: {
      order: orderId,
    },
    method: "post",
    success: (response) => {
      $("#myModal").modal("show");
    },
  });
}

function returnOrder(orderId) {
  alert(orderId);
  $.ajax({
    url: "/returnProductdetails",

    data: {
      order: orderId,
    },
    method: "post",
    success: (response) => {
      // location.href="/order-history"
    },
  });
}

function cancelOrder(orderId) {
  alert(orderId);
  console.log(orderId);
  $.ajax({
    url: "/cancelProduct",

    data: {
      order: orderId,
    },
    method: "post",
    success: (response) => {
      location.href = "/order-history";
    },
  });
}


// ......................................cart remove............................................//

function change(cartId, productId) {

  swal({
    title: "Are you sure?",
    text: "Do you want to remove this product",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })

    .then((willDelete) => {
      if (willDelete) {

        $.ajax({
          url: '/remove-product',
          data: {
            cart: cartId,
            product: productId
          },
          method: 'post',
          success: (response) => {

            swal("", {
              icon: "success",

            }).then(function () {
              location.reload();
            })
          }

        })

      } else {
        swal("Your product is in the cart",{icon:'success'});
      }
    });
}


// .........................................copuponValidation..................................//

 function couponvalidate(){
  $("#couponAplly").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/applyCoupon",
    method: "post",
    data: $("#couponAplly").serialize(),
     
    success: (response) => { 
        if(response.error){
        swal({
          title:(response.message),
     
        icon: "error",
        button: "Ok"}).then(()=>{
          location.reload()
        })
      }
      else{
     
         swal({
          title:("Thank you for using coupon"),
     
        icon: "success",
      button: "Ok"}).then(()=>{
          location.reload()
         })

      }
      
       }
  });
});

// ............................................removeCoupon.................................//




 }

