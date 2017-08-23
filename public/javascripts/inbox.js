var messagesArr;
var socket;

$(document).ready(function() {
    getMessages();
    var userhref = $('#profileHref').attr('href')
    socket = io();
    socket.emit('joinRoom', '/inbox' + userhref);

    $('.modalContent form').on('submit', function(event) {
        event.preventDefault();
    })

    $('.modalBg').click(closeModal);
    $('.modalClose').click(closeModal);

    $('#messageSubmit').on('click', sendMessage);
    $('#replySubmit').on('click', sendMessage);

    $('.mailList').on('click', '.message', readMessage)

    socket.on('newMessage', function(message) {
        $('#noMessages').hide();
        var li = createMessageLi(message);
        $('.mailList').prepend(li);
        messagesArr.push(message);
    });
});

var readMessage = function() {
    var mid = $(this).attr('data-mid');
    for(var i = 0; i < messagesArr.length; i++) {
        if(messagesArr[i].mid == mid)   {
            var message = messagesArr[i]
            break;
        }
    }
    $('#viewTitle').html(message.title);
    $('#viewFromUser').html(message.fromuser);
    $('#viewTimeStamp').html(jQuery.timeago(new Date(message.timestamp)));
    $('#viewMessage').html(message.message);
    $('#modal2').prop('checked', true);
    $('#replyUsername').attr('value', message.fromuser);

    //PATCH AS READ
    var message = $(this);
     $.ajax({
         url: '/messages/' + mid,
         type: 'PATCH',
         data: {hasRead: true}
     }).done(function() {
         var messageTitle = $(message).children()[1];
         console.log(messageTitle);
         $(messageTitle).css('font-weight', 'normal').css('color', '#6d6d6d');
     });
}

var getMessages = function() {
    $.ajax({
        url: '/messages',
        type: 'GET'
    }).done(function(json){
        messagesArr = json;
        if(messagesArr.length == 0) {
            $('#noMessages').show();
        } else {
            $.each(messagesArr, function(i, message) {
                var li = createMessageLi(message);
                $('.mailList').prepend(li);
            })
        }
    })
}

var createMessageLi = function(message) {

    var mid = message.mid;
    var fromUser = message.fromuser;
    var title = message.title;
    var hasRead = message.hasread;
    var timestamp = message.timestamp;

    var li = $('<li/>').addClass('message').attr('data-mid', mid);
    var fromUserDiv = $('<div/>').addClass('fromUserDiv').html(fromUser);
    var messageTitle = $('<div/>').addClass('messageTitle').html(title);
    if(!hasRead) {
        $(messageTitle).css('font-weight', 'bold').css('color', 'black');
    }
    var messageTime = $('<div/>').addClass('messageTime').html(jQuery.timeago(new Date(timestamp)));
    li.append(fromUserDiv).append(messageTitle).append(messageTime);
    return li;
}

var closeModal = function(event) {
    $('form input[type=text]').val('');
    $('form textarea').val('');
    $('#noUser').hide();
}

var sendMessage = function() {
    var form = $(this).parent();
    if($(form)[0].checkValidity()) {
        var type = $(this).attr('data-type');
        var toUser = $('#' + type + 'Username').val();
        var title = $('#' + type + 'Title').val();
        var message = $('#' + type + 'Text').val();
        $.ajax({
            url: "/messages",
            data: {toUser: toUser, title: title, message: message},
            type: "POST"
        }).done(function(result) {
            if(result.hasOwnProperty('error')) {
                $('#noUser').show();
            } else {
                $('.modalState').prop('checked', false);
                closeModal();
                console.log(result);
                socket.emit('addMessage', result);
            }
        });
    }
}
