


function changeQuantity(cartId, productId, count) {


    let quantityf = parseInt(document.getElementById(productId).innerHTML)
    let countf = parseInt(count)
    console.log(quantityf);
    console.log(countf);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            cart: cartId,
            product: productId,
            count: countf,
            quantity: quantityf
        },
        method: 'post',
        success: (response) => {


            if (response.response.err) {


                location.reload()
            }
            else if (response.response.inc) {

                let price = document.getElementById("price" + productId).innerHTML

                console.log(price);
                let newqty = document.getElementById(productId).innerHTML = quantityf + count
                let total = document.getElementById('total' + productId).innerHTML = price * newqty
                console.log(total);
                document.getElementById("grandTotal1").innerHTML = response.grandTotal[0].total
                document.getElementById('grandTotal2').innerHTML = response.grandTotal[0].total
                document.getElementById('stock').style.display = "none"

            } else {
                document.getElementById('stock').style.display = "block"
            }

        }
    })
}



//.........................................................ordercancellation..................................//
function cancelProduct(orderId) {


    $.ajax({
        url: '/cancelProduct',

        data: {
            order: orderId
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                alert('order cancelled')
            }

        }
    })

}
//.................................//......................................
function changeStatus(id) {
    alert(id)

    let value = document.getElementById('changestatus').value
    
    $.ajax({
        url: '/admin/changeStatus',

        data: {
            orderId: id,
            status: value,
        },
        method: 'post',
        success: (response) => {

            location.reload()

        }
    })

}

//.......................................



$('#checkoutform').submit((e) => {
   
    e.preventDefault()
    $.ajax({
        url: '/checkout',
        method: 'post',
        data: $('#checkoutform').serialize(),
        success: (response) => {
            console.log(response);
            if (response.sucessCod) {
                alert('success')
                location.href = "/successful"
            } else if(response.error){
                alert(response.error)
                location.reload()
            }
            
            else if (response.sucessrazo) {

                console.log(response);

                razorpay(response)
            } else {
                console.log(response);
                paypal(response)

            }




        }
    })
})




$('#couponAplly').submit((e) => {

    e.preventDefault()
    $.ajax({
        url: '/applyCoupon',
        method: 'post',
        data: $('#couponAplly').serialize(),
        success: (response) => {
            console.log(response);
            if (response.status) {
                alert('couponapllied')
                console.log(response);
                alert(response.response.total)
                document.getElementById('total').innerHTML=response.response.total
                location.href='/checkout?total='+response.response.total
                
               
            }    
        }
    })
})




function razorpay(order) {

    alert(order.amount)
    console.log(order);
    var options = {
        "key": 'rzp_test_TLImELoayCEs6j',
        "amount": order.amount,
        "currency": "INR",
        "name": "Mater HEad",
        "description": "Test Transaction",
        "image": "assets/images/logo.png",
        "order_id": order.id,
        "handler": function (response) {


            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#528FF0"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment: payment,
            order: order
        },
        method: 'post',
        success: (response) => {
            console.log(response);
            if (response.status) {
                location.href = "/successful"
            } else {
                // alert('paymentdfailes')
            }
        }

    })
}



function paypal(response) {
alert('paupal')
    console.log(response);
    $.ajax({
        url: '/pay',
        data: {
            orderId: response.orderId,
            proQty: response.proQty,
            ProId: response.proId
        },
        method: 'post',
        success: (response) => {
            location.href = response

        }

    })
}














function orderDetails(orderId) {
    alert('uuuufdfghv')

    $.ajax({
        url: '/viewProduct',

        data: {
            order: orderId
        },
        method: 'post',
        success: (response) => {
            $('#myModal').modal('show')

        }
    })
}

function returnOrder(orderId) {
    alert(orderId)
    $.ajax({

        url: '/returnProductdetails',

        data: {
            order: orderId
        },
        method: 'post',
        success: (response) => {
            // location.href="/order-history"

        }
    })
}



function cancelOrder(orderId) {
    alert(orderId)
    console.log(orderId);
    $.ajax({
        url: '/cancelProduct',

        data: {
            order: orderId
        },
        method: 'post',
        success: (response) => {
            location.href = "/order-history"

        }
    })



}

//  function couponApply(){
//     alert('hello')
//     let values=document.getElementById('couponAplly').submit()
//     alert(values)
//  }



