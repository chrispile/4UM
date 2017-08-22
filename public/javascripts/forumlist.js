/*
NEED TO DO
- Requesting to join a protected SUB4UM
- Joining a private SUB4UM through the modal
- Having front end show the type (public, protected, private) of each of the  user's subscribed SUB4UMS
*/

var forumList;
var user4UMs = [];
var publicList;
var protectedList;
var subscribedList;
var requesteds;
var admin = [];
var mod4UMS;

$(document).ready(function() {
    getSUB4UMS();

    publicList = $('#publicList');
    protectedList = $('#protectedList');
    subscribedList = $('#subscribedList');

    $('.modalBg').click(closeModal);
    $('.modalClose').click(closeModal);
    $('.cancel').click(cancel);
    $('#unsubscribeMod').click(deleteMod);

    $('#publicList').on('click', '.subscribe', subscribe);
    $('#subscribedList').on('click', '.unsubscribe', unsubscribeCheck);
    $('#protectedList').on('click', '.request', request);

    $('#delete').click(deleteSub4um);

    $('.modalContent form').on('submit', function() {
        event.preventDefault();
    })

    $('#modal1submit').on('click', postSUB4UM);

    $('#sname').keypress(onlyLettersAndNumbers);
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
        getModSub4ums();
    })
}

var getModSub4ums = function() {
    $.ajax({
        url: "http://localhost:3000/sub4ums/mods",
        type: "GET"
    }).done(function(json) {
        mod4UMS = json;
        getRequests();
    })
}

var getRequests = function() {
    $.ajax( {
        url: "http://localhost:3000/sub4ums/requests",
        type: "GET",
        dataType: "json"
    }).done(function(json) {
        requests = json;
        loadLists();
    });
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
                var status = isPending(forum.sname)
                var li = createLi(forum.sname, status, forum.sid);
                protectedList.append(li);
            }
        }
    });
}

var alreadySubscribed = function(sname) {
    for(var i = 0; i < user4UMs.length; i++) {
        if(user4UMs[i].sname == sname)
            return true;
    }
    return false;
}

var isAdmin = function(sid) {
    for(var i = 0; i < admin.length; i++) {
        if(admin[i].sid == sid)
            return true;
    }
    return false;
}

var isMod = function(sid) {
    for(var i = 0; i < mod4UMS.length; i++) {
        if(mod4UMS[i].sid == sid)
            return true;
    }
    return false;
}

var isPending = function(sname) {
    for(var i = 0; i < requests.length; i++) {
        if(requests[i].sname == sname)
            return 'pending'
    }
    return 'request'
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

var unsubscribeCheck = function(event) {
    var li = $(this).parent();
    var sname = $(li).attr('data-sname');
    var sid = $(li).attr('data-sid');
    var admin = $(li).attr('data-admin');
    var mod = $(li).attr('data-mod');
    if(admin == 'true') {
        $('#adminUnsubscribe').show();
        $('#modal3').prop('checked', true);
        $('#modal3').attr('data-sname', sname);
    } else if(mod =='true') {
        $('#modUnsubscribe').show();
        $('#modal3').prop('checked', true);
        $('#modal3').attr('data-sname', sname);
    } else {
        unsubscribe(li, sname, sid);
    }
}

var deleteMod = function() {
    var sname = $('#modal3').attr('data-sname');
    var uid = mod4UMS[0].uid
    $.ajax({
        url: "http://localhost:3000/sub4ums/mod/" + uid,
        type: "DELETE",
    }).done(function(json) {
        var li = $("li[data-sname='" + sname + "']")
        var sid = $(li).attr('data-sid');
        for(var index = 0; index < mod4UMS.length; index++) {
            if(mod4UMS[index].sid == sid)
                mod4UMS.splice(index, 1);
        }
        unsubscribe(li, sname, sid);
        cancel();
    });
}

var unsubscribe = function(li, sname, sid) {
    $.ajax({
        url: "http://localhost:3000/sub4ums/subscribe",
        type: "DELETE",
        data: {sid: sid}
    }).done(function(json) {
        for(var index = 0; index < user4UMs.length; index++) {
            if(user4UMs[index].sid == sid)
                user4UMs.splice(index, 1);
        }
        var type;
        for(var index = 0; index < forumList.length; index++) {
            if(forumList[index].sid == sid)
                type = forumList[index].type;
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

var deleteSub4um = function() {
    var sname = $('#modal3').attr('data-sname');
    $.ajax({
        url: "http://localhost:3000/sub4ums/" + sname,
        type: "DELETE",
    }).done(function() {
        for(var index = 0; index < user4UMs.length; index++) {
            if(user4UMs[index].sname == sname)
                user4UMs.splice(index, 1);
        }
        $("li[data-sname='" + sname + "']").remove();
        cancel();
    });
}


var postSUB4UM = function(event) {
    var form = $(this).parent();
    if($(form)[0].checkValidity()) {
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
            closeModal();
            $('.modalState').prop('checked', false);
            forumList.push(arr[0]);
            admin.push(arr[1]);
            var newLi = createLi(arr[0].sname, 'unsubscribe', arr[0].sid)
            subscribedList.append(newLi);
        }).fail(function (jqXHR, textStatus, error) {
            var response = jQuery.parseJSON(jqXHR.responseText);
            var errorDiv = $('<div/>').addClass("failDiv");
            var exclamation = $('<i/>').addClass("fa fa-exclamation-triangle").attr('aria-hidden', 'true');
            var message = $('<div/>').addClass("failMessage").html(response.error.name);
            errorDiv.append(exclamation).append(message);

            $('#sname').before(errorDiv);
        });
    }

}

var createLi = function(name, type, sid) {
    var adminBool = isAdmin(sid);
    var modBool = isMod(sid);
    var li = $('<li/>').addClass('li4UM');
    var a = document.createElement('a');
    $(a).attr('href','/s/' + name);
    if(adminBool) {
        var icon =  $('<i/>').addClass("fa fa-key icon").attr('aria-hidden', 'true');
        li.attr('data-admin', 'true')
    }
    else if(modBool) {
        var icon = $('<i/>').addClass("fa fa-shield icon").attr('aria-hidden', 'true');
        li.attr('data-mod', 'true')
    }
    $(a).html(name).append(icon);
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
    $('.failDiv').remove();
    $('.unsubscribeForm').hide();
}

var cancel = function() {
    $('input[type=checkbox]').prop('checked', false);
    $('.unsubscribeForm').hide();
}

var onlyLettersAndNumbers = function(event) {
    var ew = event.which;
    if(48 <= ew && ew <= 57)
        return true;
    if(65 <= ew && ew <= 90)
        return true;
    if(97 <= ew && ew <= 122)
        return true;
    return false;
}

var request = function(event) {
    var btn = $(this);
    var li = $(btn).parent();
    var sid = $(li).attr('data-sid');
    var sname = $(li).attr('data-sname');
    $.ajax({
        url: "http://localhost:3000/sub4ums/request",
        type: "POST",
        data: {sid: sid, sname: sname}
    }).done(function(json) {
        $(btn).removeClass('request').addClass('pending').html('pending');
    });
}
