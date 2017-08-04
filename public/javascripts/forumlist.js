var forumList = [
    {
        name: 'GameOfThrones',
        type: 'public'
    },
    {
        name: 'Gaming',
        type: 'public'
    },
    {
        name: 'Portal',
        type: 'protected'
    },
    {
        name: 'Pics',
        type: 'public'
    },
    {
        name: 'Worldnews',
        type: 'public'
    },
    {
        name: 'Google',
        type: 'protected'
    },
    {
        name: 'UCI',
        type: 'protected'
    },
    {
        name: 'videos',
        type: 'public'
    }
]

var user4UMs = ['gaming', 'UCI'];

var publicList;
var protectedList;
var subscribedList;

$(document).ready(function() {
    publicList = $('#publicList');
    protectedList = $('#protectedList');
    subscribedList = $('#subscribedList');

    loadLists();
});

var loadLists = function() {
    $.each(user4UMs, function(index, name) {
        var li = createLi(name, 'unsubscribe')
        subscribedList.append(li);
    });
    $.each(forumList, function(index, forum) {
        if(!user4UMs.includes(forum.name)) {
            if(forum.type == 'public') {
                var li = createLi(forum.name, 'subscribe');
                publicList.append(li);
            } else {
                var li = createLi(forum.name, 'request');
                protectedList.append(li);
            }
        }
    });
}

var createLi = function(name, type) {
    var li = $('<li/>').addClass('li4UM').html(name);
    var label = $('<button/>').addClass(type).html(type);
    li.append(label);
    return li;
}
