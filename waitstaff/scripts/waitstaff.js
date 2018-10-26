// applies functionality for table buttons to all table buttons
$(document).ready(function () {
    // boxButton onClick
    $('.boxButton').click(function () {

      // table number of button being pressed
      var btnTblNum = $(this).first().text();
      // table number on sidebar
      var sidebarTblNum = $('#tblNumber').text();

        if( $('#sidebar').hasClass('active') ){
          // if table is already on screen, hide sidebar
          if( btnTblNum === sidebarTblNum ){
            $('#sidebar').toggleClass('active');
            $(this).toggleClass('boxButtonSelected');
          }else{ //else, put new info in sidebar
            $('.boxButtonSelected').toggleClass('boxButtonSelected');
            $('#tblNumber').text(btnTblNum);
            $(this).toggleClass('boxButtonSelected');
          }
        }else{ //else, put new number and show
          $('#tblNumber').text(btnTblNum);
          $('#sidebar').toggleClass('active');
          $(this).toggleClass('boxButtonSelected');
        }

    });

});
