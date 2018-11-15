function showOrderInfo(whichDiv){
var x = document.getElementsByClassName("order_display_main"); //This is the stuff we want to hide
var y = document.getElementsByClassName("order_display_main_selected"); //This will be what we toggle to show the info
var z = document.getElementsByClassName("order_display_sidebar"); 

//if order_display_sidebar item is clicked, enter this statement
if(whichDiv == "order_display_sidebar"){

    //if an order is selected in the side bar, show it in gray box in middle screen
    // if($(".order_dispplay_sidebar").click(function(){
        let id = $(this).attr("id");
        divID = "_" + id;
        console.log(divID);
        $("#"+divID).toggleClass('.order_display_main_selected');
        y.style.display="block"; 
    // }));  

}


}

//line 11 typo
