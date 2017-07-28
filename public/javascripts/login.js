$(document).ready(function(){
    $('#showRegister').click(fadeToggle);
    $('#showLogin').click(fadeToggle);
    $('#showRecover').click(fadeToggle);
    $('#showLogin2').click(fadeToggle);
});

var fadeToggle = function(event) {
    var elemID = event.target.id;
    var parent = $('#' + elemID).parent();
    parent.fadeOut('slow', function() {
        if(elemID == 'showRegister') {
            $('#register').fadeIn('slow');
        }
        else if(elemID == 'showLogin' || elemID == 'showLogin2') {
            $('#login').fadeIn('slow');
        }
        else if(elemID == 'showRecover') {
            $('#recover').fadeIn('slow');
        }
    });
}


function matchPassword(input) {
	if(input.value != $('#password1').val() ) {
		input.setCustomValidity('Passwords must match!');
	} else {
		input.setCustomValidity('');
	}
}
