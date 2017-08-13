var token;
$(function() {
	token = (window.location.href).split('/').pop();

	$('#resetForm').submit(function(event) {
		event.preventDefault();
	});

	$('#resetBtn').click(resetPass);
});


function matchPassword(input) {
	if(input.value != $('#password1').val() ) {
		input.setCustomValidity('Passwords must match!');
	} else {
		input.setCustomValidity('');
	}
}

var resetPass = function() {
	var newpassword = $('#password1').val();
	var email;
	$.ajax({
		url: "http://localhost:3000/reset/" + token,
		type: "GET"
	}).done(function(json) {
		email = json.email;
		$.ajax({
			url: "http://localhost:3000/users/",
			data: {
				'email': email,
				'password': newpassword
			},
			type: "PATCH"
		}).done(function() {
			console.log('patched user passsword!');
			$.ajax({
				url: "http://localhost:3000/reset/" + token,
				type: "DELETE"
			}).done(function() {
				console.log('deleted reset object!');
				$('#recover').toggle();
				$('#success').toggle();
			})
		});
	});
}
