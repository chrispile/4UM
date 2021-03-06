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
var userRequests;
var urlArr
var socket;
$(document).ready(function() {
    socket = io();
    urlArr = (window.location.href).split('/')
    urlsname = urlArr.pop();

    mainList = $('.postList');
    if(urlsname =='home') {
        getSubscribed();
        getSUB4UMS();
    } else {
        if(urlArr[3] == 's') {
            getsid()
            getForum();
            $('#deleteSub4um').on('click', deleteSub4um);
            $('#addModBtn').on('click', addMod);
            $('#removeModBtn').on('click', removeMod);
        } else {
            getUserPosts();
        }
    }

    $('.modalBg').click(closeModal);
    $('.modalClose').click(closeModal);

    $(mainList).on('click', '.upvote', upvote);
    $(mainList).on('click', '.downvote', downvote);
    $(mainList).on('click', '.postInfo', selectPostInfo);
    $(mainList).on('click', '.deleteBtn', deletePost);

    $('.modalContent form').on('submit', function(event) {
        event.preventDefault();
    })

    $('#modal1submit').on('click', postPost);
    $('#modal2submit').on('click', postPost);
    $('#approveUsersBtn').on('click', approveRequests);
    $('#inviteBtn').on('click', inviteUser);

    $('#topBtn').on('click', sortScore);
    $('#recentBtn').on('click', sortDate);
});

//FUNCTIONS USED FOR HOMEFEED

var getSubscribed = function() {
    $.ajax( {
        url: "/sub4ums/subscribe",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        subscribed = json;
        getPosts();
    });
}

var getForum = function() {
    $.ajax( {
        url: "/sub4ums/sname/" + urlsname,
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        subscribed = json;
        getPosts();
    });
}

var getSUB4UMS = function() {
    $.ajax( {
        url: "/sub4ums/subscribe",
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

//FUNCTIONS USED FOR SUB4UM FEED

var getsid = function() {
    $.ajax( {
        url: "/sub4ums/sname/" + urlsname,
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        forumsid = json[0].sid;
        getMods(forumsid);
        getSubscribers();
        getUserRequests();
    });
}

var getMods = function(sid) {
    $.ajax( {
        url: "/sub4ums/mods/" + sid,
        type: "GET",
    }).done(function(json) {
        mods = json;
        addModOptions();
    });
}

var addModOptions = function() {
    $.each(mods, function(index, mod) {
        var option = $('<option/>').html(mod.username).attr('value', mod.username).attr('data-uid',mod.uid);
        $('#removeModSelect').append(option);
    })
}

var getSubscribers = function() {
    $.ajax( {
        url: "/sub4ums/subscribers/" + forumsid,
        type: "GET",
    }).done(function(json) {
        subscribers = json;
        addSubscribersOptions();
    });
}

var addSubscribersOptions = function() {
    $.each(subscribers, function(index, subscriber) {
        var option = $('<option/>').html(subscriber.username).attr('value', subscriber.username).attr('data-uid', subscriber.uid);
        $('#addModSelect').append(option);
    })
}

var getUserRequests = function() {
    $.ajax({
        url: "/sub4ums/requests/" + forumsid,
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        userRequests = json;
        if(userRequests.length != 0) {
            $.each(userRequests, function(i, request) {
                var uid = request.uid;
                var username = request.username;
                var input = $('<input>').attr({type: 'checkbox', name: 'username', value: username});
                var inputStr = "<input type='checkbox' name='username' value='" + username + "' data-uid='" + uid + "'>";
                var label = $('<label/>').html(inputStr + " " + username);
                $(label).appendTo('#userRequestsList')
            });
        } else {
            $('#approveUsersBtn').hide();
            $('#noRequests').show();
        }
    })
}

var approveRequests = function(event) {
    $('#userRequestsList label input:checked').each(function() {
        var username = $(this).val();
        var uid = $(this).attr('data-uid');
        var label = $(this).parent();
        $.ajax({ //remove from requests
            url: "/sub4ums/requests/" + uid + "/" + forumsid,
            type: "DELETE",
            data: {sname: urlsname}
        }).done(function() {
            $(label).remove();
            for(var i = 0; i < userRequests.length; i++) {
                if(userRequests[i].uid == uid) {
                    userRequests.splice(i, 1);
                }
            }
            if(userRequests.length == 0) {
                $('#approveUsersBtn').hide();
                $('#noRequests').show();
            }
            closeModal();
        })
    })
}

var inviteUser = function(event) {
    var form = $(this).parent();
    if($(form)[0].checkValidity()) {
        var toUser = $('#inviteUsername').val();
        var accesscode = $('#inviteAccessCode').val();
        var title = 'PRIVATE SUB4UM INVITE'
        var sname = $(this).attr('data-sname');
        var message = 'Hello, you have been invited to join the SUB4UM: ' + sname + '. To accept the invite, use the following access code: ' + accesscode;
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
                socket.emit('addMessage', result);
            }
        });
    }
}

var deleteSub4um = function() {
    $.ajax({
        url: "/sub4ums/" + urlsname,
        type: "DELETE",
    })
}

var addMod = function() {
    var uid = $('#addModSelect option:selected').attr('data-uid');
    var username = $('#addModSelect option:selected').val();
    $.ajax({
        url: "/sub4ums/mod",
        type: "POST",
        data: {uid: uid, sid: forumsid}
    }).done(function(json) {
        $('#addModSelect option:selected').remove();
        var option = $('<option/>').html(username).attr('value', username).attr('data-uid', json.uid);
        $('#removeModSelect').append(option);
    });
}

var removeMod = function() {
    var uid = $('#removeModSelect option:selected').attr('data-uid');
    var username = $('#removeModSelect option:selected').val();
    $.ajax({
        url: "/sub4ums/mod/" + uid,
        type: "DELETE",
    }).done(function(json) {
        $('#removeModSelect option:selected').remove();
        var option = $('<option/>').html(username).attr('value', username).attr('data-uid', uid);
        $('#addModSelect').append(option);
    })
}


//FUNCTIONS USED FOR PROFILE FEED

    //Get sub4ums that the logged in user is has posted (does not need to be subscribed to SUB4UM)
var getUserPosts = function() {
    var username = $('#username').html();
    $.ajax({
        url: "/posts/username/" + username,
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        listPosts = json;
        if(listPosts.length == 0) {
            $('#noPosts').show();
        } else {
            sortScore();
        }
    });
}

//GENERAL FUNCTIONS

var getPosts = function() {
    var promises = [];
    $.each(subscribed, function(index, forum) {
        var sname = forum.sname;
        var request = $.ajax({
            url: "/posts/" + sname,
            type: "GET",
            dataType: "json"
        }).done(function(json) {
            listPosts = listPosts.concat(json);
        });
        promises.push(request);
    })
    $.when.apply(null, promises).done(function() {
        if(listPosts.length == 0) {
            $('#noPosts').show();
        } else {
            sortScore();
        }
    })
}

var loadList = function() {
    mainList.html('');
    if(listPosts.length == 0) {
        $('#noPosts').show();
    } else {
        for(var postIndex = 0; postIndex < listPosts.length; postIndex++) {
            var postLi = createPostElem(listPosts[postIndex], postIndex + 1);
            mainList.append(postLi);
        }
        getVoted();
    }
}

var getVoted = function() {
    $.ajax( {
        url: "/posts/voted/",
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
    var score = $('<div/>').addClass('score').html(post.score).attr('data-score', post.score);;
    var downvote =  $('<i/>').addClass("fa fa-arrow-down fa-lg downvote").attr('aria-hidden', 'true');
    scoreDiv.append(upvote).append(score).append(downvote);
    var postInfo = $('<div/>').addClass('postInfo');
    var title = $('<div/>').addClass('title');
    var url = '/s/' + post.sname + '/' + post.pid;
    var aJSON = { href: url, text: post.title}
    if(post.url != null) {
        aJSON.href = post.url
    }
    var linkedTitle = $('<a />', aJSON);
    title.append(linkedTitle);
    var timestamp = jQuery.timeago(new Date(post.timestamp));
    var tagline = $('<div/>').addClass('tagline').html('submitted ' + timestamp + ' by ')
    var author = $('<a />', {
        href: '/u/' + post.username,
        text: post.username,
    }).addClass('author');
    tagline.append(author)
    if(urlsname == 'home' || urlArr[3] == 'u') {
        var forum = $('<a />', {
            href: '/s/' + post.sname,
            text: post.sname
        }).addClass('forum');
        tagline.append(' to ').append(forum);
    }
    var postButtons = $('<ul/>').addClass('postButtons');
    $.ajax({
        url: "/posts/comments/" + post.pid + "/count",
        type: "GET",
    }).done(function(count) {
        var comments = $('<li/>').addClass('comments');
        var commentsA = $('<a />', {
            href: url,
            text: count.count + " comments"
        })
        comments.append(commentsA);
        postButtons.append(comments);
    });
    var qualified = qualifiedToDelete(post.sname).then(function(result) {
        var userhref = $('#profileHref').attr('href').split('/').pop();
        if(result || userhref == post.username) {
            var deleteBtn = $('<li/>').addClass('deleteBtn').html('delete');
            postButtons.append(deleteBtn);
        }
    });
    postInfo.append(title).append(tagline).append(postButtons);
    li.append(postNum).append(scoreDiv).append(postInfo);
    return li;
}

async function qualifiedToDelete(sname) {
    var json = await $.ajax({
        url: "/sub4ums/qualified/" + sname,
        type: "GET"
    })
    return json.qualified;
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
    var newScore = parseInt(currentScore) + value;
    $(score).html(newScore);
    var scoreDiv = $(this).parent();
    var post = $(scoreDiv).parent();
    var pid = $(post).attr('data-pid');
    for(var index = 0; index < listPosts.length; index++) {
        if(listPosts[index].pid == pid) {
            listPosts[index].score = newScore;
        }
    }
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
    var newScore = parseInt(currentScore) + value
    $(score).html(newScore);
    var scoreDiv = $(this).parent();
    var post = $(scoreDiv).parent();
    var pid = $(post).attr('data-pid');
    for(var index = 0; index < listPosts.length; index++) {
        if(listPosts[index].pid == pid) {
            listPosts[index].score = newScore;
        }
    }
    vote(pid, value, type);
}

var vote = function(pid, value, type) {
    $.ajax({
        url: "/posts/voted/" + pid,
        type: "POST",
        data: {value: value, type: type}
    })
}

var selectPostInfo = function(event) {
    $('.postInfo').css('background-color', 'transparent');
    $(this).css('background-color', '#d3d3d3');
}

var postPost = function(event) {
    var form = $(this).parent();
    if($(form)[0].checkValidity()) {
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
            postData.text = $(form).find('#textAreaPost').val();
        }
        $.ajax({
            url: "/posts/" + sname,
            type: "POST",
            data: postData
        }).done(function(json) {
            listPosts.push(json);
            if(sorted == 'date') {
                sortDate();
            } else {
                sortScore();
            }
            $('#noPosts').hide();
            closeModal();
            $('.modalState').prop('checked', false);
        });
    }
}

var closeModal = function(event) {
    $('form input[type=text]').val('');
    $('form input[type=url]').val('');
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

var checkURL = function() {
    var string = url.value;
    if (!~string.indexOf("http")) {
      string = "http://" + string;
    }
    url.value = string;
    return url
}

var deletePost = function(event) {
    var post = $(this).parentsUntil($('ol .postList'), '.post')[0];
    var pid = $(post).attr('data-pid');
    $.ajax({
        url: "/posts",
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
