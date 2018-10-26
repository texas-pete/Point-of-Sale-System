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