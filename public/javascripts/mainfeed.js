var listPosts;
var mainList;
var voted;
$(document).ready(function(){
    mainList = $('.postList');
    getPosts();

    $('#title1').keyup({max: 300, currentID: '#current1', maxID: '#max1'}, textareaCounter);
    $('#title2').keyup({max: 300, currentID: '#current2', maxID: '#max2'}, textareaCounter);
    $('#text').keyup({max: 40000, currentID: '#current3', maxID: '#max3'}, textareaCounter);

    $('.modalBg').click(closeModal);
    $('.modalClose').click(closeModal);

    $('#name2UM').keypress(noSpaces);

    $(mainList).on('click', '.upvote', upvote);
    $(mainList).on('click', '.downvote', downvote);
    $(mainList).on('click', '.postInfo', selectPostInfo);

    $('.modalContent form').on('submit', function() {
        return false;
    })

    $('#modal1submit').on('click', postPost);
    $('#modal2submit').on('click', postPost);
    $('#modal3submit').on('click', postSUB4UM);
});

var getVoted = function() {
    $.ajax( {
        url: "http://localhost:3000/posts/voted/",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        voted = json;
        changeVoted();
    });
}

var changeVoted = function() {
    $.each(voted, function(index, obj){
        var pid = obj.pid;
        var type = obj.type;
        var post = $('.postList').find('[data-pid="' + pid + '"]');
        if(type == 'upvote') {
            $(post).find('.upvote').css('color','#40798C');
            $(post).find('.score').css('color','#40798C');
        } else {
            $(post).find('.downvote').css('color','#A83434');
            $(post).find('.score').css('color','#A83434');
        }
    })
}


var getPosts = function() {
    $.ajax( {
        url: "http://localhost:3000/posts",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        listPosts = json;
        loadList();
    });
}

var loadList = function() {
    mainList.html('');
    for(var postIndex = 0; postIndex < listPosts.length; postIndex++) {
        var postLi = createPostElem(listPosts[postIndex], postIndex + 1);
        mainList.append(postLi);
    }
    getVoted();
}

var createPostElem = function(post, rank) {
    var li =  $('<li/>').addClass('post').attr('data-pid', post.pid);
    var postNum = $('<div/>').addClass('postNum').html(rank);
    var scoreDiv = $('<div/>').addClass('scoreDiv');
    var upvote =  $('<i/>').addClass("fa fa-arrow-up fa-lg upvote").attr('aria-hidden', 'true');
    var scoreStr = createScoreString(post.score);
    var score = $('<div/>').addClass('score').html(scoreStr).attr('data-score', post.score);;
    var downvote =  $('<i/>').addClass("fa fa-arrow-down fa-lg downvote").attr('aria-hidden', 'true');

    scoreDiv.append(upvote).append(score).append(downvote);
    var postInfo = $('<div/>').addClass('postInfo');
    var title = $('<div/>').addClass('title').html(post.title);
    var timestamp = new Date(post.timestamp.replace(' ', 'T'));
    var tagline = $('<div/>').addClass('tagline').html('submitted on ' + timestamp + ' by ')
    var author = $('<a />', {
        href: post.username, //fix later
        text: post.username,
    }).addClass('author');
    var forum = $('<a />', {
        href: post.sname, //fix later
        text: post.sname
    }).addClass('forum');
    tagline.append(author).append(' to ').append(forum);
    var postButtons = $('<ul/>').addClass('postButtons');
    var comments = $('<li/>').addClass('comments').html(0 + ' comments'); //fix later
    var share = $('<li/>').addClass('share').html('share');
    var save = $('<li/>').addClass('save').html('save');
    var report = $('<li/>').addClass('report').html('report');
    postButtons.append(comments).append(share).append(save).append(report);
    postInfo.append(title).append(tagline).append(postButtons);
    li.append(postNum).append(scoreDiv).append(postInfo);
    return li;
}

var createScoreString = function(score) {
    if(score > 9999) {
        var scoreStr = (score/1000).toFixed(1) + 'K';
        return scoreStr.toString();
    }
    return score.toString();
}

var textareaCounter = function(event) {
    var len = $(this).val().length;
    if(len >= event.data.max) {
        $(event.data.currentID).css('color', '#A83434');
        $(event.data.maxID).css('color', '#A83434');
    } else {
        $(event.data.currentID).css('color', '#000');
        $(event.data.maxID).css('color', '#000');
    }
    $(event.data.currentID).text(len);
}

var closeModal = function(event) {
    $('form input[type=text]').val('');
    $('form textarea').val('');
    $('.current').html(0);
    $('form input[type=radio]').prop('checked', false);
}

var noSpaces = function(event) {
    if(event.which == 32) return false;
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
    })
}

var selectPostInfo = function(event) {
    $('.postInfo').css('background-color', 'transparent');
    $(this).css('background-color', '#d3d3d3');
}

var postPost = function(event) {
    var form = $(this).parent();
    var sname = $(form).find('#sname').val();
    var postData = {
        title: $(form).find('#title').val()
    }
    if($(form).attr('id') == 'postLinkForm') {
        postData.url = $(form).find('#url').val();
    }
    else if($(form).attr('id') == 'postTextForm') {
        postData.text = $(form).find('#text').val();
    }
    $.ajax({
        url: "http://localhost:3000/posts/" + sname,
        type: "POST",
        data: postData
    }).done(function(json) {
        listPosts.push(json);
        var li = createPostElem(listPosts[listPosts.length - 1], listPosts.length);
        mainList.append(li);
    });
}

var postSUB4UM = function(event) {
    var form = $(this).parent();
    var sname = $(form).find('#sname').val();
    var title = $(form).find('#title').val();
    var description = $(form).find('#desc').val();
    var type = $(form).find("[name='type']").val();
    var postData = {
        sname: sname, title: title, description: description, type: type
    }
    $.ajax({
        url: "http://localhost:3000/sub4ums",
        type: "POST",
        data: postData
    }).done(function(json) {
        console.log(json);
        console.log('added new sub4um!');
    });
}
