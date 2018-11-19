var currentID = 0;

//for removing order item
$(document).ready(function () {
	$('#Ready').on('click', removeFromOrder);

	$("#Cooking").click(function () {

		//if Cooking is clicked, turn status indicator on for the currently selected order 
		if(currentID !== 0 ){
			$('#__'+currentID).toggle();
		}
	 });

	$(".order_display_sidebar").click(function () {
		let id = $(this).attr("id");
		currentID = id;
		divID = "_" + id;
		divID2 = "__" + id;
		console.log(divID);

		// hide the others
		$(".order_display_main").hide();
		// show this one
		$("#"+divID).show();

	});
});

//asks the user whether they're sure if they want to delete this item
function removeFromOrder(){
	if(confirm('Are you sure this item is ready?')){
		var index = id;
		console.log("Item ready " + index);

		//communicates w/ server that we want to remove the index value from current active orders
		$.ajax({
			url: "/removeFromOrder/" + index,
			type: "POST",
			success: function(responseData){//reloads the order to reflect changes
				alert("The item has been cleared since it is ready.");
				location.reload();
			},
			error: console.error
		});
	}
}





