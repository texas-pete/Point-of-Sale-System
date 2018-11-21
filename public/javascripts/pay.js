function calculateTip(){
	var serviceQual = document.getElementById("serviceQual").value;
	console.log(serviceQual);
	var billAmt = document.getElementById("singlePayTotal").innerText;
	console.log(billAmt);
	var numOfPeople = document.getElementById("peopleamt").value;
	//Check to see if this input is empty or less than or equal to 1
	if (numOfPeople === "" || numOfPeople <= 1) {
		numOfPeople = 1;
	}
	console.log(numOfPeople);
	
	var tax = parseFloat(billAmt * 0.0825);
	var splitTax = tax / numOfPeople;
	tax = tax.toFixed(2);
	splitTax = splitTax.toFixed(2);
	console.log(tax);
	//tax = Math.round(0.0825 * billAmt);
	var total = (parseFloat(billAmt) * serviceQual);
	//round to two decimal places
	total = Math.round(total * 100) / 100;
    //next line allows us to always have two digits after decimal point
	var splitTotal = total / numOfPeople;
	total = total.toFixed(2);
	splitTotal = splitTotal.toFixed(2);
	var overallTot = parseFloat(total) + parseFloat(tax) + parseFloat(billAmt);
	var splitOverall = overallTot / numOfPeople;
	overallTot = overallTot.toFixed(2);
	splitOverall = splitOverall.toFixed(2);
	//Display the tip
    document.getElementById("totalTip").innerHTML = total;
	document.getElementById("overallTotal").innerHTML = overallTot;
	document.getElementById("splitVal").innerHTML = splitOverall;
}	  
//click to call function
document.getElementById("calculate").onclick = function() {
  calculateTip();
};

function calculateTip2(){
	var serviceQual = document.getElementById("serviceQual2").value;
	console.log(serviceQual);
	var billAmt = document.getElementById("singlePayTotal2").innerText;
	console.log(billAmt);
	
	var tax = parseFloat(billAmt * 0.0825);
	tax = tax.toFixed(2);
	console.log(tax);
	//tax = Math.round(0.0825 * billAmt);
	var total = (parseFloat(billAmt) * serviceQual);
	//round to two decimal places
	total = Math.round(total * 100) / 100;
    //next line allows us to always have two digits after decimal point
	total = total.toFixed(2);
	var overallTot = parseFloat(total) + parseFloat(tax) + parseFloat(billAmt);
	overallTot = overallTot.toFixed(2);
	//Display the tip
    document.getElementById("totalTip2").innerHTML = total;
	document.getElementById("overallTotal2").innerHTML = overallTot;
}	 
//click to call function
document.getElementById("calculate2").onclick = function() {
	calculateTip2();
  };


$("#singleSub").click(function () {
	var total = document.getElementById("overallTotal").innerHTML;
	var tax = document.getElementById("totTax").innerHTML;
	var tips = document.getElementById("totalTip").innerHTML;
	console.log(total)
	console.log(tax)
	console.log(tips)



	$.ajax({ //there is a way to do this via $.post("/getTableOrder/" + sidebarVal) but keeping ajax as such
		url: "/guest-pay/submit/" + tax + '/' + total + '/' + tips+ '/',
		type: "POST",
		success: function (retVal) { //responseData contains the returned 'name' from our ID

		console.log("PS");

		//we know we are only returning a string for a name.
		//anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
		},
		error: function () { //if we can't find the name in our database
			console.log("FAIL");
		//anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
		}
	});

});

$("#cashSub").click(function () {
	var total = document.getElementById("overallTotal2").innerHTML;
	var tax = document.getElementById("totTax2").innerHTML;
	var tips = document.getElementById("totalTip2").innerHTML;
	console.log(total)
	console.log(tax)
	console.log(tips)



	$.ajax({ //there is a way to do this via $.post("/getTableOrder/" + sidebarVal) but keeping ajax as such
		url: "/guest-pay/submit/" + tax + '/' + total + '/' + tips+ '/',
		type: "POST",
		success: function (retVal) { //responseData contains the returned 'name' from our ID

		console.log("PS");

		//we know we are only returning a string for a name.
		//anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
		},
		error: function () { //if we can't find the name in our database
			console.log("FAIL");
		//anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
		}
	});

});