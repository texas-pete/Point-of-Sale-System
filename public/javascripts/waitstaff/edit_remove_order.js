function edit_remove(whichOperation) {

    let item = whichOperation[whichOperation.length - 1];

    if (whichOperation.length == 7) { //we need to remove the element from our submitted_orders
        //route to remove from database
        let content = $("#item_name" + item).text();
        console.log(content);

        $.ajax({
            url: "/removeSubmitted/" + content,
            type: "POST",
            sucess: function (responseData) {
                console.log("yeah");
            },
            error: console.error
        });
        //refresh current look
    }
    else if (whichOperation.length == 5) {
        //we need to get the content within the #item_desc(num) content
        let content = $("#item_desc" + item).text();
        console.log(content);

        // $.ajax({
        //     url: "/editSubmitted/" + "test",
        //     type: "POST",
        //     sucess: function (responseData) {
        //         console.log("yeah");
        //     },
        //     error: console.error
        // });



    }
    else {
        //We should never get here.
    }

}