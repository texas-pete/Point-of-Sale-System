
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

//for opening up the modal
$(document).ready(function () {
	$('.addToOrder').on('click', addToOrder);
});

//opens a modal to add to order and make any changes or note any allergies
function addToOrder() {
	console.log($(this).data('id'))
	var objId = $(this).data('id')
	document.querySelector('.bg-modal').style.display = 'flex';
	$.ajax({
		url: "/getMenuItemById/" + $(this).data('id'),
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
			//sets the modal's submit button to contain objId information
			var id = document.querySelector('.modal-submit');
			console.log("Attribute is set as " + objId);
			id.setAttribute('data-id', objId);
			//console.log(document.querySelector('.modal-submit').data-id);
		},
		error: console.error
	});
}

//for submitting order
$(document).ready(function () {
	$('.modal-submit').on('click', submitToOrder);
});


function submitToOrder() {
	//store objID in variable for ease-of-use and scope 
	var objId = $(this).data('id');
	var notes = document.getElementsByName('notes')[0].value;
	var price = document.getElementsByClassName('modal-menu-price')[0].innerHTML.replace("$", "");
	console.log("Sending in the price of: " + price);
	if (!notes.replace(/\s/g, '').length) {
		notes = "empty"
	}
	console.log("Attempting to submit order " + objId + " and notes as " + notes);
	//hide modal
	document.querySelector('.bg-modal').style.display = 'none';

	$.ajax({
		url: "/submitToOrder/" + objId + "/" + notes + "/" + price,
		type: "POST",
		success: function (responseData) {
			alert("Your order has been added. View and submit complete order in the 'View Order' tab.");
			document.querySelector('.clear-this').value = '';
		},
		error: console.error
	});
}

//closes the modal if clicked on
document.querySelector('.close').addEventListener('click', function () {
	document.querySelector('.bg-modal').style.display = 'none';
	document.querySelector('.clear-this').value = '';
});