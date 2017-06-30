function video_toggle_pause() {
    if (player.paused()) {
        player.play();
    }
    else {
        player.pause();
    }
}

// init keymap
key('space', video_toggle_pause);
