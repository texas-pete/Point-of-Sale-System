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
		divID3 = "___" + id;
		
		let x = $('#' + divID3).html();
		console.log(x);
		console.log(x.length);
		// hide the others
		$(".order_display_main").hide();
		$.ajax({ //there is a way to do this via $.post("/getTableOrder/" + sidebarVal) but keeping ajax as such
              url: "/getItemName/" + $('#' + divID3).html(),
              type: "POST",
              success: function (retVal) { //responseData contains the returned 'name' from our ID



            	$('#' + divID3).html(retVal); //we know we are only returning a string for a name.
                //anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
              },
              error: function () { //if we can't find the name in our database
			 	 $('#' + divID3).html($('#' + divID3).html());	
                //anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
              }
            });

		//  ___divid.innerhtml = retval  


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





