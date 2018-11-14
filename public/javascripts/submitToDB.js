//for submitting entire order to db
$(document).ready(function () {
	$('.submit-db').on('click', submitToDB);
});

//submits the current table's order to submitted_orders collection
function submitToDB() {
	console.log("Trying to submit order");
	$.ajax({
		url: "/submitToDB",
		type: "POST",
		success: function (responseData) {
			alert("Your order has been submitted to the kitchenstaff.");
			$.ajax({
				url:"/guest-order",
				type: "GET",
				success: function(){//upon success, reloads the now empty order page
					location.reload();
				}
			});
		},
		error: console.error
	});
}

//for removing order item
$(document).ready(function () {
	$('.remove-item').on('click', removeFromOrder);
});

//asks the user whether they're sure if they want to delete this item
function removeFromOrder(){
	if(confirm('Are you sure you want to remove this item from your order?')){
		var index = $(this).data('id');
		console.log("Removing index " + index);

		//communicates w/ server that we want to remove the index value from current active orders
		$.ajax({
			url: "/removeFromOrder/" + index,
			type: "POST",
			success: function(responseData){//reloads the order to reflect changes
				alert("The item has been removed from your order.");
				location.reload();
			},
			error: console.error
		});
	}
}