var commentsArr;
var room = (window.location.href).split('/s').pop();
var socket;

$(document).ready(function() {
    createTagLine();
    getComments();

    socket = io();
    socket.emit('joinRoom', room);

    $('form').on('submit', function(event) {
        event.preventDefault();
    })

    $('#submitCommentBtn').on('click', comment);
    $('.deleteBtn').on('click', deletePost);
    $('.upvote').on('click', upvote);
    $('.downvote').on('click', downvote);

    socket.on('newComment', function(comment) {
        console.log('comment was added');
        createCommentLi(comment);
    });
});


var createTagLine = function() {
    var tagline = $('#tagline');
    var timestamp = tagline.attr('data-timestamp');
    var timeago = jQuery.timeago(new Date(timestamp));
    var author = tagline.attr('data-author');
    var sname = tagline.attr('data-sname');
    var str = 'submitted ' + timeago + ' by <a class="author" href="/u/' + author + '">' + author + '</a> to <a class="forum" href="/s/' + sname + '">' + sname + '</a>';
    tagline.html(str);
}

var comment = function() {
    var text = $('#commentTextArea').val();
    var pid = $(this).attr('data-pid');
    $.ajax({
        url: "http://localhost:3000/posts/comments/" + pid,
        type: "POST",
        data: {text: text}
    }).done(function(json) {
        $('#commentTextArea').val('');
        createCommentLi(json);
        socket.emit('addComment', json);
    });
}

var getComments = function() {
    var pid = $('#submitCommentBtn').attr('data-pid');
    $.ajax({
        url: "http://localhost:3000/posts/comments/" + pid,
        type: "GET"
    }).done(function(comments) {
        commentsArr = comments;
        var a = $('<a />', {text: comments.length + ' comments', href:window.location.href});
        $('.comments').append(a);
        $.each(commentsArr, function(i, comment) {
            createCommentLi(comment);
        })
    })
}


var createCommentLi = function(comment) {
    var uid = comment.uid;
    $.ajax({
        url: "http://localhost:3000/users/" + uid,
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        var username = json.username;
        var li = $('<li/>').addClass('textDiv');
        var header = $('<div/>').addClass('commentHeader')
        var timeago  = jQuery.timeago(new Date(comment.timestamp));
        header.html('<a href="/u/' + username + '" class="author">' + username + '</a> ' + timeago);
        var textDiv = $('<div/>').addClass("text").html(comment.text);
        li.append(header).append(textDiv);
        $('#commentList').prepend(li);
    });
}

var deletePost = function(event) {
    var pid = $('#submitCommentBtn').attr('data-pid');
    $.ajax({
        url: "http://localhost:3000/posts",
        type: "DELETE",
        data: {pid: pid}
    }).done(function() {
        window.location = "/home";
    });
}

var upvote = function(event) {
    var score = $(this).next();
    var value;
    var type;
    if($(this).css('color') == 'rgb(0, 0, 0)') {
        $(this).css('color', '#40798C');
        $(score).css('color', '#40798C');
        var downvote = $(this).next().next();
        if($(downvote).css('color') == 'rgb(0, 0, 0)') { //increment score once
            value = 1;
        } else { //increment score twice
            $(downvote).css('color', '#000');
            value = 2;
        }
        type="upvote"
    } else {  //DECREMENT THE SCORE
        $(score).css('color', '#000');
        $(this).css('color', '#000');
        value = -1;
        type="none"
    }
    var currentScore = $(score).html();
    $(score).html(parseInt(currentScore) + value);
    var scoreDiv = $(this).parent();
    var post = $(scoreDiv).parent();
    var pid = $(post).attr('data-pid');
    vote(pid, value, type);
}

var downvote = function(event) {
    var score = $(this).prev();
    var value;
    var type;
    if($(this).css('color') == 'rgb(0, 0, 0)') {
        $(this).css('color', '#A83434');
        $(score).css('color', '#A83434');
        var upvote = $(this).prev().prev();
        if($(upvote).css('color') == 'rgb(0, 0, 0)') { //decrement score once
            value = -1;

        } else { //decrement score twice
            $(upvote).css('color', '#000');
            value = -2;
        }
        type="downvote"
    } else {  //INCCREMENT THE SCORE
        $(score).css('color', '#000');
        $(this).css('color', '#000');
        value = 1
        type="none"
    }
    var currentScore = $(score).html();
    $(score).html(parseInt(currentScore) + value);
    var scoreDiv = $(this).parent();
    var post = $(scoreDiv).parent();
    var pid = $(post).attr('data-pid');
    vote(pid, value, type);
}

var vote = function(pid, value, type) {
    $.ajax({
        url: "http://localhost:3000/posts/voted/" + pid,
        type: "POST",
        data: {value: value, type: type}
    })
}
