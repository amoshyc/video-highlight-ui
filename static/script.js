var player = videojs('video');
var seg_start_btn = $('#segment-start-btn');
var seg_end_btn = $('#segment-end-btn');
var clear_btn = $('#clear-label-btn');
var current_row = 0;

function click_segment_start_btn() {
    var t = Math.round(player.currentTime() * 1000.0) / 1000.0;

    var btn_template =
        '<button type="button" class="btn btn-outline-danger btn-sm" ' +
        'onclick="remove_row(' + current_row + ')">x</button>';
    var item_template =
        '<td>' + t + '</td>' +
        '<td></td>' +
        '<td>' + btn_template + '</td>';

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
        $('#scroll-container').scrollTop(9999);
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

function remove_row(id) {
    $('#row' + id).remove();
}

function sort_labels_by_column(idx) {
    var data = $('#labels-table tbody tr').get();
    data.sort(function (a, b) {
        var value_a = parseFloat($(a).children('td').eq(idx).text());
        var value_b = parseFloat($(b).children('td').eq(idx).text());
        if (value_a < value_b) return -1;
        if (value_a > value_b) return +1;
        return 0;
    });
    $.each(data, function (index, row) {
        $('#labels-table tbody').append(row);
    });
}

function increase_video_time(inc) {
    player.currentTime(player.currentTime() + inc);
}

function video_toggle_pause() {
    if (player.paused()) {
        player.play();
    }
    else {
        player.pause();
    }
}

function video_preview() {
    var data = $('#labels-table tbody tr').get();
    var starts = [];
    var ends = [];
    var ids = [];
    if (data.length == 0) {
        return;
    }

    $.each(data, function (idx, row) {
        starts.push(parseFloat($(row).children('td').eq(0).text()));
        ends.push(parseFloat($(row).children('td').eq(1).text()));
        ids.push($(row).attr('id'));
    });

    var idx = 0;
    function time_update() {
        if (player.currentTime() >= ends[idx]) {
            player.pause();
            idx += 1;
            if (idx >= starts.length) {
                player.off('timeupdate', time_update);
                $('#' + ids[ids.length - 1]).css('color', 'black');
            }
            else {
                player.currentTime(starts[idx]);
                $('#' + ids[idx - 1]).css('color', 'black');
                $('#' + ids[idx]).css('color', 'cornflowerblue');
                player.play();
            }
        }
    }

    $('#preview-btn').blur();

    player.currentTime(starts[0]);
    $('#' + ids[0]).css('color', 'cornflowerblue');
    player.play();

    player.on('timeupdate', time_update);
}

function init_keymap() {
    key('space', video_toggle_pause);
    key('s', click_segment_start_btn);
    key('e', click_segment_end_btn);
    key('k', video_toggle_pause);
    key('l', function () {
        increase_video_time(+5);
    });
    key('j', function () {
        increase_video_time(-5);
    });
}

$(function () {
    // player.src({ type: 'video/youtube', src: 'https://www.youtube.com/watch?v=DBW-wq5eARI&list=PLOSE0y-rB2eCpnmkrgSPMkLecg9q1h-pe' });
    // player.src({ type: 'video/mp4', src: 'sub.mp4' });

    $('#labels-table > tbody').sortable({
        theme: "bootstrap"
    });

    init_keymap();
});