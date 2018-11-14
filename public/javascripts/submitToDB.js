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

//for editing order item's notes
$(document).ready(function () {
	$('.edit-item').on('click', removeFromOrderPop);
});

//asks the user whether they're sure if they want to delete this item
function removeFromOrderPop(){
	if(confirm('Are you sure you want to edit this item?')){
		document.querySelector('.bg-modal').style.display = 'flex';

		var objId = $(this).data('parent');
		var index = $(this).data('id');
		var textNotes = $(this).data('columns');
		if(textNotes == "empty"){//if it is 'empty' then we want to pass in the nothing string
			textNotes = "";
		}
		document.querySelector('.bg-modal').style.display = 'flex';
		$.ajax({
			url: "/getMenuItemById/" + $(this).data('parent'),
			type: "POST",
			success: function (responseData) {
				console.log(responseData[0].Name);
				document.querySelector('.modal-menu-name').innerHTML = responseData[0].Name;
				document.querySelector('.modal-menu-img').src = 'http://localhost:3000/images/' + responseData[0].ImageName;
				document.querySelector('.modal-menu-img').alt = responseData[0].Name;
				var d = new Date();
				var hour = d.getHours();
				//CHANGE HAPPY HOUR HERE
				if (hour == 15) {
					document.querySelector('.modal-menu-price').innerHTML = '$' + responseData[0].HappyHour;
				}
				else {
					document.querySelector('.modal-menu-price').innerHTML = '$' + responseData[0].Price;
				}

				document.querySelector('.modal-menu-desc').innerHTML = responseData[0].Description;
				//sets the modal's submit button to contain index information
				var id = document.querySelector('.modal-submit');
				console.log("Attribute is set as " + index);
				id.setAttribute('data-id', index);
				//sets the text box based on what the notes were
				document.querySelector('.clear-this').value = textNotes;
				//console.log(document.querySelector('.modal-submit').data-id);
			},
			error: console.error
		});
	}
}


//for submitting the editied order item's notes
$(document).ready(function () {
	$('.submit-edited-item').on('click', submitEdit);
});

//submites the edited notes/allergies
function submitEdit(){
	var index = $(this).data('id');
	
	//takes the notes from the box, parses it for whitespace, changes to empty if none
	var notes = document.getElementsByName('notes')[0].value;
	if (!notes.replace(/\s/g, '').length) {
		notes = "empty"
	}
	console.log(index + " " + notes);

	//make ajax call to editOrder/index and reload the page upon success
	$.ajax({
		url: "/editOrder/" + index + "/" + notes,
		type: "POST",
		success: function (responseData) {
			alert("Your order has been edited.");
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

//imported from customer.js
function showDrinks() {
	document.getElementById("ass-drop").classList.toggle("show");
}
function showFilters() {
	document.getElementById("filter_items").classList.toggle("show");
}

window.onclick = function (event) {
	if (!event.target.matches('.ass-dropbtn')) {

		var dropdowns = document.getElementsByClassName("ass-dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}
/*var index = $(this).data('id');
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
});*/



//closes the modal if clicked on
document.querySelector('.close').addEventListener('click', function () {
	document.querySelector('.bg-modal').style.display = 'none';
});