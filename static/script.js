var player = videojs('video');
var seg_start_btn = $('#segment-start-btn');
var seg_end_btn = $('#segment-end-btn');
var clear_btn = $('#clear-label-btn');
var current_row = 0;

// Array.prototype.last = function () {
//     return this[this.length - 1];
// }

function click_segment_start_btn() {
    var t = Math.round(player.currentTime() * 1000.0) / 1000.0;

    var item_template =
        '<td>' + t + '</td>' +
        '<td></td>' +
        '<td><button type="button" class="btn btn-outline-danger btn-sm">x</button></td>';

    var elem = $('#row' + current_row);
    if (elem.length) {
        elem.html(item_template);
    }
    else {
        var new_row =
            '<tr id="row' + current_row + '">' +
            item_template +
            '</tr>';
        $('#labels-table > tbody').append(new_row);
    }
}

function click_segment_end_btn() {
    var t = Math.round(player.currentTime() * 1000.0) / 1000.0;

    var elem = $('#row' + current_row + ' > td:nth-child(2)');
    if (elem.length) {
        elem.append(t);
        current_row += 1;
    }
}

function on_video_play() {
    console.log('vplay');
}

function on_video_pause() {
    console.log('vpause');
}

function init_player() {
    player.on('play', on_video_play);
    player.on('pause', on_video_pause);

    // player.src({ type: 'video/youtube', src: 'https://www.youtube.com/watch?v=DBW-wq5eARI&list=PLOSE0y-rB2eCpnmkrgSPMkLecg9q1h-pe' });
    player.src({ type: 'video/mp4', src: 'sub.mp4' });
}

function video_toggle_pause() {
    if (player.paused()) {
        player.play();
    }
    else {
        player.pause();
    }
}

function init_keymap() {
    key('space', video_toggle_pause);
    key('p', video_toggle_pause);
    key('s', click_segment_start_btn);
    key('e', click_segment_end_btn);
}

$(function () {
    init_player();
    init_keymap();

    $('#labels-table > tbody').sortable();
});