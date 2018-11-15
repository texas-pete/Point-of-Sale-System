$(".order_display_sidebar").click(function () {
    let id = $(this).attr("id");
    divID = "_" + id;
    console.log(divID);

    // hide the others
    $(".order_display_main").hide();
    // show this one
    $("#"+divID).show();
});