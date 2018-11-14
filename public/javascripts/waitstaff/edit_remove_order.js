function edit_remove(whichOperation) {

    let item = whichOperation[whichOperation.length - 1];
    if (whichOperation.length == 7) { //we need to remove the element from our submitted_orders
        //route to remove from database
        let content = $("#item_name" + item).text();
        let desc = $("#item_desc" + item).text();//converted name.
        //we need to convert from a name to a string version of the object ID
        $.ajax({
            url: "/fromNameToID/" + content,
            type: "POST",
            success: function (responseData) {
                console.log(responseData);

                $.ajax({
                    url: "/removeSubmitted/" + 1, //we are going to need to pass in a table number. I think we can get this by retreiving the active class?
                    type: "POST",
                    sucess: function (responseData) {
                        console.log("yeah");
                    },
                    error: console.error
                });

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