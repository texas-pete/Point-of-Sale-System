function edit_remove(whichOperation) {

    let item = whichOperation[whichOperation.length - 1];
    if (whichOperation.length == 7) { //we need to remove the element from our submitted_orders
        //route to remove from database
        let content = $("#item_name" + item).text();
        let desc = $("#item_desc" + item).text();//converted name.
        //we need to convert from a name to a string version of the object ID

        var sidebarTblNum = $("#tblNumber").text(); //we need to clean up our input. No random garbage
        for (let index = 0; index < 16; index++) {
            if (sidebarTblNum == index) {
                sidebarTblNum = index;
            }
        }

        $.ajax({
            url: "/fromNameToID/" + content,
            type: "POST",
            success: function (responseData) {
                console.log(responseData);

                $.ajax({
                    url: "/removeSubmitted/" + responseData + "/" + desc + "/" + sidebarTblNum, //I realized the fields inside of an array of objects
                    type: "POST",
                    sucess: function (responseData) {
                        //we need to refresh the page
                    },
                    error: function (responseData) {
                        //we need to refresh the page
                    }
                });

            },
            error: function (responseData) { //if we have a fake item in our dbase, we can still remove it
                $.ajax({
                    url: "/removeSubmitted/" + content + "/" + desc + "/" + sidebarTblNum, //I realized the fields inside of an array of objects
                    type: "POST",
                    sucess: function (responseData) {
                        //we need to resfresh the page
                    },
                    error: function (responseData) {
                    }
                });
            }
        });


        //refresh current look
    }
    else if (whichOperation.length == 5) {
        //we need to get the content within the #item_desc(num) content
        let content = $("#item_name" + item).text();
        let desc = $("#item_desc" + item).text();//converted name.
        //we need to convert from a name to a string version of the object ID

        var sidebarTblNum = $("#tblNumber").text(); //we need to clean up our input. No random garbage
        for (let index = 0; index < 16; index++) {
            if (sidebarTblNum == index) {
                sidebarTblNum = index;
            }
        }
        let newDescription = "ttest";
        $.ajax({
            url: "/fromNameToID/" + content,
            type: "POST",
            success: function (responseData) {
                console.log(responseData);

                $.ajax({
                    url: "/editSubmitted/" + responseData + "/" + desc + "/" + sidebarTblNum + "/" + newDescription, //I realized the fields inside of an array of objects
                    type: "POST",
                    sucess: function (responseData) {
                        //we need to refresh the page
                    },
                    error: function (responseData) {
                        //we need to refresh the page
                    }
                });

            },
            error: function (responseData) { //if we have a fake item in our dbase, we can still remove it
                $.ajax({
                    url: "/editSubmitted/" + content + "/" + desc + "/" + sidebarTblNum + "/" + newDescription, //I realized the fields inside of an array of objects
                    type: "POST",
                    sucess: function (responseData) {
                        //we need to resfresh the page
                    },
                    error: function (responseData) {
                    }
                });
            }
        });



    }
    else {
        //We should never get here.
    }

}