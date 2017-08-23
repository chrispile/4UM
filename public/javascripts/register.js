var token;
$(function() {
	token = (window.location.href).split('/').pop();

	$('#resetForm').submit(function(event) {
		event.preventDefault();
	});

	$('#resetBtn').click(resetPass);

	$('form input').keypress(function(e) {
        if (e.which == 32)
            return false;
    });
});


function matchPassword(input) {
	if(input.value != $('#password1').val() ) {
		input.setCustomValidity('Passwords must match!');
	} else {
		input.setCustomValidity('');
	}
}

var resetPass = function() {
	if($('#resetForm')[0].checkValidity()) {

		var newpassword = $('#password1').val();
		var email;
		$.ajax({
			url: "/reset/" + token,
			type: "GET"
		}).done(function(json) {
			email = json.email;
			$.ajax({
				url: "/users/",
				data: {
					'email': email,
					'password': newpassword
				},
				type: "PATCH"
			}).done(function() {
				$.ajax({
					url: "/reset/" + token,
					type: "DELETE"
				}).done(function() {
					$('#recover').toggle();
					$('#success').toggle();
				})
			});
		});
	}
}
