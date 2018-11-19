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
		var index = currentID;
		if(currentID !== 0){
			$('#'+ currentID).hide();
			$('#_'+ currentID).hide();
			currentID = 0; 
		}
	}
	
}





