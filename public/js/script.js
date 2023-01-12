user = "Question: ";
count = 1;
reply = "Reply";
function postHtml(val) {
    var html = '<div class="w3-container w3-card w3-white w3-round w3-margin"><br>'
        + '<img src="avatar2.png" alt="Avatar" class="w3-left w3-circle w3-margin-right" style="width:60px">'
        + '<h4>'
        + user
        + '</h4><br>'
        + '<hr class="w3-clear">'
        + '<p>'
        + val
        + '</p>'
        + '<div class="w3-row-padding" style="margin:0 -16px"></div>'
        + '<button type="button" class="w3-button w3-theme-d1 w3-margin-bottom"><i class="fa fa-thumbs-up"></i>Like</button>'
        + '</div>';
    $('.comments-box').prepend(html);
    $('.input').text('');
}
$(function () {
    $('.post-btn').on('click', function () {
        var val = $('.input').text();
        if (val != '') {
            $.post('/addques', { name: user, content: val }, function (data) {
                if (data) {
                    console.log(data);
                    postHtml(val);
                }
            })
        }
    })
})



function postAns(val) {
    var html = '<div class="w3-container w3-card w3-white w3-round w3-margin"><br>'
       // + '<img src="avatar2.png" alt="Avatar" class="w3-left w3-circle w3-margin-right" style="width:60px">'
        //    +                  '<span class="w3-right w3-opacity">1 min</span>'
        + '<h4>'
        + user
        + '</h4><br>'
        //+ '<hr class="w3-clear">'
        + '<p>'
        + val
        + '</p>'
        + '<div class="w3-row-padding" style="margin:0 -16px"></div>'
        + '</div>';
    $('.ans-box').prepend(html);
    $('.input-ans').text('');
}
$(function () {
    $('.post-btn').on('click', function () {
        var val = $('.input-ans').text();
        if (val != '') {
            $.post('/ex', { name: user, content: val }, function (data) {
                if (data) {
                    console.log(data);
                    postAns(val);
                }
            })
        }
    })
})