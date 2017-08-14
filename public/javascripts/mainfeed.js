/*
NEED TO TO
- Posts need to direct user to new page
- Post buttons are non-functioning rn (comments, share, save, report)
- Usernames on posts need to direct to new pages
*/

var listPosts = [];
var mainList;
var voted;
var sub4ums;
var subscribed;
var urlsname;
var sorted;
var subscribers;
var mods;
var forumsid;

$(document).ready(function(){
    urlsname = (window.location.href).split('/').pop();

    mainList = $('.postList');
    if(urlsname =='home') {
        getSubscribed();
        getSUB4UMS();
    } else {
        getsid()
        getForum();
        $('#deleteSub4um').on('click', deleteSub4um);
        $('#addModBtn').on('click', addMod);
        $('#removeModBtn').on('click', removeMod);

    }

    $('#title1').keyup({max: 300, currentID: '#current1', maxID: '#max1'}, textareaCounter);
    $('#title2').keyup({max: 300, currentID: '#current2', maxID: '#max2'}, textareaCounter);
    $('#text').keyup({max: 40000, currentID: '#current3', maxID: '#max3'}, textareaCounter);

    $('.modalBg').click(closeModal);
    $('.modalClose').click(closeModal);

    $(mainList).on('click', '.upvote', upvote);
    $(mainList).on('click', '.downvote', downvote);
    $(mainList).on('click', '.postInfo', selectPostInfo);

    $('.modalContent form').on('submit', function() {
        return false;
    })

    $('#modal1submit').on('click', postPost);
    $('#modal2submit').on('click', postPost);

    $('#topBtn').on('click', sortScore);
    $('#recentBtn').on('click', sortDate);
});

var getsid = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/sname/" + urlsname,
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        forumsid = json[0].sid;
        getMods()
        getSubscribers();
    });

}

var getSubscribed = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/subscribe",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        subscribed = json;
        getPosts();
    });
}

var getForum = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/sname/" + urlsname,
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        subscribed = json;
        getPosts();
    });
}

var getPosts = function() {
    var promises = [];
    $.each(subscribed, function(index, forum) {
        var sname = forum.sname;
        var request = $.ajax({
            url: "http://localhost:3000/posts/" + sname,
            type: "GET",
            dataType: "json"
        }).done(function(json) {
            listPosts = listPosts.concat(json);
        });
        promises.push(request);
    })
    $.when.apply(null, promises).done(function() {
        sortScore();
    })
}

var loadList = function() {
    mainList.html('');
    for(var postIndex = 0; postIndex < listPosts.length; postIndex++) {
        var postLi = createPostElem(listPosts[postIndex], postIndex + 1);
        mainList.append(postLi);
    }
    getVoted();
}

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
    var timestamp = jQuery.timeago(new Date(post.timestamp.replace(' ', 'T')));
    var tagline = $('<div/>').addClass('tagline').html('submitted ' + timestamp + ' by ')
    var author = $('<a />', {
        href: post.username, //fix later
        text: post.username,
    }).addClass('author');
    tagline.append(author)
    if(urlsname == 'home') {
        var forum = $('<a />', {
            href: '/s/' + post.sname,
            text: post.sname
        }).addClass('forum');
        tagline.append(' to ').append(forum);
    }
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
        if(sorted == 'score') {
            sortScore();
        } else {
            sortDate();
        }
    })
}

var selectPostInfo = function(event) {
    $('.postInfo').css('background-color', 'transparent');
    $(this).css('background-color', '#d3d3d3');
}

var postPost = function(event) {
    var form = $(this).parent();
    if(urlsname != 'home') {
        var sname = urlsname;
    } else {
        var sname = $(form).find('#sname').val();
    }
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
        if(sorted == 'date') {
            sortDate();
        } else {
            sortScore();
        }
        closeModal();
        $('.modalState').prop('checked', false);
    });
}

var getSUB4UMS = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/options",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        sub4ums = json;
        addOptions();
    });
}

var addOptions = function() {
    $.each(sub4ums, function(index, obj) {
        var sname = obj.sname;
        var option = $('<option/>').html(sname).attr('value', sname);
        $('.SUB4UMlist').append(option);
    })
}

var closeModal = function(event) {
    $('form input[type=text]').val('');
    $('form textarea').val('');
    $('.current').html(0);
    $('form input[type=radio]').prop('checked', false);
}

var sortDate = function() {
    sorted = 'date';
    listPosts.sort(function(a,b){
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    $('#topBtn').css('background', 'none').css('color', 'black');
    $('#recentBtn').css('background-color', '#59A7C1').css('color', '#fff');
    loadList();
}

var sortScore = function() {
    sorted = 'score';
    listPosts.sort(function(a,b){
        var scoreDiff = b.score - a.score;
        if(scoreDiff != 0) {
            return scoreDiff;
        }
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    $('#topBtn').css('background-color', '#59A7C1').css('color', '#fff');
    $('#recentBtn').css('background', 'none').css('color', 'black');
    loadList();
}

var deleteSub4um = function() {
    $.ajax({
        url: "http://localhost:3000/sub4ums/" + urlsname,
        type: "DELETE",
    })
}

var getSubscribers = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/subscribers/" + forumsid,
        type: "GET",
    }).done(function(json) {
        subscribers = json;
        addSubscribersOptions();
    });
}

var addSubscribersOptions = function() {
    $.each(subscribers, function(index, subscriber) {
        var uid = subscriber.uid;
        $.ajax({
            url: "http://localhost:3000/users/" + uid,
            type: "GET",
            dataType: "json"
        }).done(function(json) {
            var username = json.username;
            var option = $('<option/>').html(username).attr('value', username).attr('data-uid', subscriber.uid);
            $('#addModSelect').append(option);
        })
    })
}

var addMod = function() {
    var uid = $('#addModSelect option:selected').attr('data-uid');
    var username = $('#addModSelect option:selected').val();
    $.ajax({
        url: "http://localhost:3000/sub4ums/mod",
        type: "POST",
        data: {uid: uid, sid: forumsid}
    }).done(function(json) {
        $('#addModSelect option:selected').remove();
        var option = $('<option/>').html(username).attr('value', username).attr('data-uid', json.uid);
        $('#removeModSelect').append(option);
    });
}

var getMods = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/mods/" + forumsid,
        type: "GET",
    }).done(function(json) {
        mods = json;
        addModOptions();
    });
}

var addModOptions = function() {
    $.each(mods, function(index, mod) {
        var uid = mod.uid;
        $.ajax({
            url: "http://localhost:3000/users/" + uid,
            type: "GET",
            dataType: "json"
        }).done(function(json) {
            var username = json.username;
            var option = $('<option/>').html(username).attr('value', username).attr('data-uid', uid);
            $('#removeModSelect').append(option);
        })
    })
}

var removeMod = function() {
    var uid = $('#removeModSelect option:selected').attr('data-uid');
    var username = $('#removeModSelect option:selected').val();
    $.ajax({
        url: "http://localhost:3000/sub4ums/mod/" + uid,
        type: "DELETE",
    }).done(function(json) {
        $('#removeModSelect option:selected').remove();
        var option = $('<option/>').html(username).attr('value', username).attr('data-uid', uid);
        $('#addModSelect').append(option);
    })
}
