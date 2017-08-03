var listPosts = [
    {
        title: 'TIL about the Rosenhan experiment, in which a Stanford psychologist and his associates faked hallucinations in order to be admitted to psychiatric hospitals. They then acted normally. All were forced to admit to having a mental illness and agree to take antipsychotic drugs in order to be released. ',
        author: 'circuitloss',
        authorid: '',
        forum: 'todayilearned',
        comments: ['one', 'two'],
        score: 43524,
        postdate: new Date("August 1, 2017 12:14:00")
    },
    {
        title: "[S7E3] Post-Premiere Discussion - S7E3 'The Queen's Justice'",
        author: 'AutoModerator',
        authorid: '',
        forum: 'GameOfThrones',
        comments: ['okay', 'o', 'a','f'],
        score: 5345,
        postdate: new Date("August 1, 2017 12:14:00")
    },
    {
        title: 'Developer Update | The Games Are Back! | Overwatch',
        author: 'corylulu',
        authorid: '',
        forum: 'Overwatch',
        comments: [],
        score: 52334,
        postdate: new Date("August 1, 2017 12:14:00")
    },
    {
        title: 'For the first time in Gaming history, a proud moment for all of us, a Survival game has left early access.',
        author: 'CheekyHusky',
        authorid: '',
        forum: 'gaming',
        comments: [],
        score: 345,
        postdate: new Date("August 1, 2017 12:14:00")
    },
    {
        title: 'Lawsuit claims Fox News and the White House collaborated on fake news story to deflect Russian election meddling',
        author: 'philcfm19',
        authorid: '',
        forum: 'worldnews',
        comments: [],
        score: 10,
        postdate: new Date("August 1, 2017 12:14:00")
    },
    {
        title: 'Lawsuit claims Fox News and the White House collaborated on fake news story to deflect Russian election meddling',
        author: 'philcfm19',
        authorid: '',
        forum: 'worldnews',
        comments: [],
        score: 10,
        postdate: new Date("August 1, 2017 12:14:00")
    },
    {
        title: 'Lawsuit claims Fox News and the White House collaborated on fake news story to deflect Russian election meddling',
        author: 'philcfm19',
        authorid: '',
        forum: 'worldnews',
        comments: [],
        score: 10,
        postdate: new Date("August 1, 2017 12:14:00")
    },
    {
        title: 'Lawsuit claims Fox News and the White House collaborated on fake news story to deflect Russian election meddling',
        author: 'philcfm19',
        authorid: '',
        forum: 'worldnews',
        comments: [],
        score: 10,
        postdate: new Date("August 1, 2017 12:14:00")
    },
]

var mainList;

$(document).ready(function(){
    mainList = $('.postList');
    loadList();

    $('#title1').keyup({max: 300, currentID: '#current1', maxID: '#max1'}, textareaCounter);
    $('#title2').keyup({max: 300, currentID: '#current2', maxID: '#max2'}, textareaCounter);
    $('#text').keyup({max: 40000, currentID: '#current3', maxID: '#max3'}, textareaCounter);

    $('.modalBg').click(closeModal);
    $('.modalClose').click(closeModalBtn);

    $('#name2UM').keypress(noSpaces);
});

var loadList = function() {
    mainList.html('');
    for(var postIndex = 0; postIndex < listPosts.length; postIndex++) {
        var postLi = createPostElem(listPosts[postIndex], postIndex + 1);
        mainList.append(postLi);
    }
}

var createPostElem = function(post, rank) {
    var li =  $('<li/>').addClass('post');
    var postNum = $('<div/>').addClass('postNum').html(rank);
    var scoreDiv = $('<div/>').addClass('scoreDiv');
    var upvote =  $('<i/>').addClass("fa fa-arrow-up fa-lg").attr('aria-hidden', 'true');
    var scoreStr = createScoreString(post.score);
    var score = $('<div/>').addClass('score').html(scoreStr);
    var downvote =  $('<i/>').addClass("fa fa-arrow-down fa-lg").attr('aria-hidden', 'true');

    scoreDiv.append(upvote).append(score).append(downvote);
    var postInfo = $('<div/>').addClass('postInfo');
    var title = $('<div/>').addClass('title').html(post.title);
    var tagline = $('<div/>').addClass('tagline').html('submitted on ' + post.postdate + ' by ')
    var author = $('<a />', {
        href: post.authorid,
        text: post.author,
    }).addClass('author');
    var forum = $('<a />', {
        href: post.forum,
        text: post.forum
    }).addClass('forum');
    tagline.append(author).append(' to ').append(forum);
    var postButtons = $('<ul/>').addClass('postButtons');
    var comments = $('<li/>').addClass('comments').html(post.comments.length + ' comments');
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

var closeModalBtn = function(event) {
    $('.modalState').prop('checked', false);
    closeModal();
}

var noSpaces = function(event) {
    if(event.which == 32) return false;
}
