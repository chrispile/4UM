$(document).ready(function() {
    createTagLine();
});


var createTagLine = function() {
    var tagline = $('#tagline');
    var timestamp = tagline.attr('data-timestamp');
    var timeago = jQuery.timeago(new Date(timestamp));
    var author = tagline.attr('data-author');
    var sname = tagline.attr('data-sname');
    var str = 'submitted ' + timeago + ' by <a class="author" href="' + author + '">' + author + '</a> to <a class="forum" href="/s/' + sname + '">' + sname + '</a>';
    tagline.html(str);
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
    var scoreDiv = $(this).parent();
    var post = $(scoreDiv).parent();
    var pid = $(post).attr('data-pid');
    vote(pid, value, type, score);
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
    var scoreDiv = $(this).parent();
    var post = $(scoreDiv).parent();
    var pid = $(post).attr('data-pid');
    vote(pid, value, type, score);
}

var vote = function(pid, value, type, scoreElem) {
    $.ajax({
        url: "http://localhost:3000/posts/voted/" + pid,
        type: "POST",
        data: {value: value, type: type}
    }).done(function(json) {
        var newScore = json.score;
        $(scoreElem).attr('data-score', newScore);
        $(scoreElem).html(createScoreString(newScore));
        for(var index = 0; index < listPosts.length; index++) {
            if(listPosts[index].pid == pid) {
                listPosts[index].score = newScore;
            }
        }
    })
}

var deletePost = function(event) {
    var post = $(this).parentsUntil($('ol .postList'), '.post')[0];
    var pid = $(post).attr('data-pid');
    $.ajax({
        url: "http://localhost:3000/posts",
        type: "DELETE",
        data: {pid: pid}
    }).done(function() {
        for(var i = 0; i < listPosts.length; i++) {
            if(listPosts[i].pid == pid) {
                listPosts.splice(i, 1);
            }
        };
        loadList();
    });
}
