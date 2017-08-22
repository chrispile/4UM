var instance;
var room;
module.exports = {
	getInstance: function() {
		return instance;
	},
	setup: function(server) {
		instance = require('socket.io')(server);
	    instance.on('connection', function(socket) {
	    	socket.on('joinRoom', function(roomName) {
	    		room = roomName;
	    		socket.join(room);
	    	});
            socket.on('addComment', function(comment) {
                socket.broadcast.to(room).emit('newComment', comment);
            });
	    });
	}
}
