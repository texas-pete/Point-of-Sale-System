function showDrinks(){
	document.getElementById("ass-drop").classList.toggle("show");
}

window.onclick = function(event){
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

$(document).ready(function(){
	$('.addToOrder').on('click', addToOrder);
});

//opens a modal to add to order and make any changes or note any allergies
function addToOrder(){
	console.log($(this).data('id'))
	document.querySelector('.bg-modal').style.display = 'flex';
	$.ajax({
		url: "/getMenuItemById/" + $(this).data('id'),
		type: "POST",
		success: function(responseData) {
			console.log(responseData[0].Name);
			document.querySelector('.modal-menu-name').innerHTML = responseData[0].Name;
			document.querySelector('.modal-menu-img').src = 'http://localhost:3000/images/appetizers/' + responseData[0].ImageName;
			document.querySelector('.modal-menu-img').alt = responseData[0].Name;
			document.querySelector('.modal-menu-price').innerHTML = '$' + responseData[0].Price;
			document.querySelector('.modal-menu-desc').innerHTML = responseData[0].Description;
		},
		error: console.error
	});

	/*$.ajax({
		type: 'POST',
		url: '.../addToOrder'+$(this).data('id')
	}).done(function(response){
		window.location.replace();
	});*/
}

//closes the modal if clicked on
document.querySelector('.close').addEventListener('click', function(){
	document.querySelector('.bg-modal').style.display = 'none';
});

/* in remove from order
	var confirmation = confirm('Are you sure?');

	if(confirmation){
		
	}
*/