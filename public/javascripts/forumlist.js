/*
NEED TO DO
- Requesting to join a protected SUB4UM
- Joining a private SUB4UM through the modal
- Having front end show the type (public, protected, private) of each of the  user's subscribed SUB4UMS
    - Currently only displays ALL subscribed SUB4UMs in one block w/o any identification of type
*/

var forumList;
var user4UMs = [];
var publicList;
var protectedList;
var subscribedList;
var admin = [];

$(document).ready(function() {
    getSUB4UMS();


    publicList = $('#publicList');
    protectedList = $('#protectedList');
    subscribedList = $('#subscribedList');

    $('.modalBg').click(closeModal);
    $('.modalClose').click(closeModal);

    $('#publicList').on('click', '.subscribe', subscribe);
    $('#subscribedList').on('click', '.unsubscribe', unsubscribe);

    $('.modalContent form').on('submit', function() {
        return false;
    })

    $('#modal1submit').on('click', postSUB4UM);

    $('#sname').keypress(noSpaces);


});

var getSUB4UMS = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        forumList = json;
        getSubscribed();
    });
}

var getSubscribed = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/subscribe",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        user4UMs = json;
        getAdminSub4ums();
    });
}


var getAdminSub4ums = function() {
    $.ajax({
        url: "http://localhost:3000/sub4ums/admin",
        type: "GET"
    }).done(function(json) {
        admin = json;
        loadLists();
    })
}

var loadLists = function() {
    $.each(user4UMs, function(index, forum) {
        var li = createLi(forum.sname, 'unsubscribe', forum.sid)
        subscribedList.append(li);
    });
    $.each(forumList, function(index, forum) {
        if(!alreadySubscribed(forum.sname)) {
            if(forum.type == 'public') {
                var li = createLi(forum.sname, 'subscribe', forum.sid);
                publicList.append(li);
            } else {
                var li = createLi(forum.sname, 'request', forum.sid);
                protectedList.append(li);
            }
        }
    });
}

var alreadySubscribed = function(sname) {
    for(var i = 0; i < user4UMs.length; i++) {
        if(user4UMs[i].sname == sname) {
            return true;
        }
    }
    return false;
}

var isAdmin = function(sid) {
    for(var i = 0; i < admin.length; i++) {
        if(admin[i].sid == sid) {
            return true;
        }
    }
    return false;
}

var subscribe = function(event) {
    var li = $(this).parent();
    var sname = $(li).attr('data-sname');
    var sid= $(li).attr('data-sid');
    $.ajax({
        url: "http://localhost:3000/sub4ums/subscribe",
        type: "POST",
        data: {sid: sid, sname:sname}
    }).done(function(json) {
        user4UMs.push(json);
        $(li).remove();
        var newLi = createLi(sname, 'unsubscribe', sid)
        subscribedList.append(newLi);
    });
}

var unsubscribe = function(event) {
    var li = $(this).parent();
    var sname = $(li).attr('data-sname');
    var sid = $(li).attr('data-sid');
    $.ajax({
        url: "http://localhost:3000/sub4ums/subscribe",
        type: "DELETE",
        data: {sid: sid}
    }).done(function(json) {
        for(var index = 0; index < user4UMs.length; index++) {
            if(user4UMs[index].sid == sid) {
                user4UMs.splice(index, 1);
            }
        }
        var type;
        for(var index = 0; index < forumList.length; index++) {
            if(forumList[index].sid == sid) {
                type = forumList[index].type;
            }
        }
        $(li).remove();
        var newLi;
        if(type == 'public') {
            newLi = createLi(sname, 'subscribe', sid);
            publicList.append(newLi);
        }
        else if(type == 'protected') {
            newLi = createLi(sname, 'request', sid);
            protectedList.append(newLi);
        }
    });
}


var postSUB4UM = function(event) {
    var form = $(this).parent();
    var sname = $(form).find('#sname').val();
    var title = $(form).find('#title').val();
    var description = $(form).find('#desc').val();
    var type = $(form).find("[name='type']:checked").val();
    var postData = {
        sname: sname, title: title, description: description, type: type
    }
    $.ajax({
        url: "http://localhost:3000/sub4ums",
        type: "POST",
        data: postData
    }).done(function(arr) {
        console.log(arr);
        closeModal();
        $('.modalState').prop('checked', false);
        forumList.push(arr[0]);
        admin.push(arr[1]);
        var newLi = createLi(arr[0].sname, 'unsubscribe', arr[0].sid)
        subscribedList.append(newLi);
    });
}

var createLi = function(name, type, sid) {
    var adminBool = isAdmin(sid);
    var li = $('<li/>').addClass('li4UM');
    var a = document.createElement('a');
    $(a).attr('href','/s/' + name);
    if(adminBool) {
        $(a).html(name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>[admin]</i>');
    } else {
        $(a).html(name);
    }
    li.append(a)
    var label = $('<button/>').addClass(type).html(type);
    li.attr('data-sname', name);
    li.attr('data-sid', sid);
    li.append(label);
    return li;
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
