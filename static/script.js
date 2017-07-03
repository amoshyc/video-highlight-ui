var player = videojs('video');
var seg_start_btn = $('#segment-start-btn');
var seg_end_btn = $('#segment-end-btn');
var clear_btn = $('#clear-label-btn');
var current_row = 0;

function click_segment_start_btn() {
    // round time to format %.3f
    var t = Math.round(player.currentTime() * 1000.0) / 1000.0;

    var btn_template =
        '<button type="button" class="btn btn-outline-danger btn-sm" ' +
        'onclick="remove_row(' + current_row + ')">x</button>';
    var item_template =
        '<td>' + t + '</td>' +
        '<td></td>' +
        '<td>' + btn_template + '</td>';

    var elem = $('#row' + current_row);
    if (elem.length) { // when re-click segment start while segment end is empty
        elem.html(item_template);
    }
    else { // new label
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

function get_labels() {
    var rows = $('#labels-table tbody tr').get();
    var starts = [];
    var ends = [];
    var ids = [];
    if (rows.length == 0) { // no labels
        return;
    }

    $.each(rows, function (idx, row) {
        starts.push(parseFloat($(row).children('td').eq(0).text()));
        ends.push(parseFloat($(row).children('td').eq(1).text()));
        ids.push($(row).attr('id'));
    });

    return [starts, ends, ids]
}

function sort_labels_by_column(idx) { // idx=0: start; idx=1: end
    var rows = $('#labels-table tbody tr').get();
    rows.sort(function (a, b) {
        var value_a = parseFloat($(a).children('td').eq(idx).text());
        var value_b = parseFloat($(b).children('td').eq(idx).text());
        if (value_a < value_b) return -1;
        if (value_a > value_b) return +1;
        return 0;
    });
    $.each(rows, function (index, row) {
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
    var labels = get_labels();
    var starts = labels[0];
    var ends = labels[1];
    var ids = labels[2];

    // play each segment by changing player time to start and detect end by time_update
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

    // prevent pressing space to trigger preivew again
    $('#preview-btn').blur();

    // play the firt segment
    player.currentTime(starts[0]);
    $('#' + ids[0]).css('color', 'cornflowerblue');
    player.play();

    // register time update
    player.on('timeupdate', time_update);
}

function clip_trigger() {
    var labels = get_labels();
    var data = {
        'starts': labels[0],
        'ends': labels[1]
    }

    $.post('/clip_trigger', JSON.stringify(data), function() {
        console.log('start clipping');
    });
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
    // make labels sortable(drag & drop)
    $('#labels-table > tbody').sortable({
        theme: "bootstrap"
    });

    init_keymap();
});