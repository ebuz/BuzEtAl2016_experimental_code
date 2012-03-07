var setupRecorder = function() {
    Wami.setup("wami", function() {checkSecurity();});
};

var checkSecurity = function() {
    var settings = Wami.getSettings();
    if (settings.microphone.granted) {
        listen();
        Wami.hide();
    } else {
        Wami.showSecurity("privacy", "Wami.show", "checkSecurity", "zoomError");
    }
};

var zoomError = function() {
// The minimum size for the flash content is 214x137.
// Browser's zoomed out too far won't show the panel.
// We could play the game of re-embedding the Flash in a
// larger DIV here, but instead we just warn the user:
    alert("Your browser may be zoomed too far out to show the Flash security settings panel.  Zoom in, and refresh.");
};

var listen = function() {
    Wami.startListening();
    // Continually listening when the window is in focus
    // allows us to buffer a little audio before the users
    // clicks, since sometimes people talk too soon.
    //  Without "listening", the audio would record
    // exactly when startRecording() is called.
    $(window).focus(function() {
        Wami.startListening();
    });

    $(window).blur(function() {
        Wami.stopListening();
    });
};

var onError = function(e) {
    alert(e);
};

var onRecordStart = function() {
    recordInterval = setInterval(function () {
        var level = Wami.getRecordingLevel();
    }, 200);
};

var onRecordFinish = function() {
    clearInterval(recordInterval);
    //FIXME: this should fire something that causes the next item to show
};
