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
    $('button.stoprecord:visible').siblings('.hiddennext').click();
};

var miclevel = new Array();

var onTestRecordStart = function() {
    miclevel = [];
    recordInterval = setInterval(function() {
        miclevel.push(Wami.getRecordingLevel());
    }, 25);
}

var onTestRecordFinish = function() {
    clearInterval(recordInterval);
    var G_vmlCanvasManager; // For IE < 9
    var canvas = document.getElementById('micgraph');
    if (G_vmlCanvasManager !== undefined) { // for IE < 9
        G_vmlCanvasManager.initElement(canvas);
    }

    if (canvas.getContext){ // still test, just in case excanvas failed to init
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var barwidth = canvas.width / miclevel.length;
        var barx = 0;

        var grad = ctx.createLinearGradient(0,0, 0,canvas.height);
        grad.addColorStop(0, 'rgba(255,0,0,0.5)'); // red
        grad.addColorStop(1/3, 'rgba(255,255,0,0.5)'); // yellow
        grad.addColorStop(1/2, 'rgba(0,255,0,0.5)'); // green
        grad.addColorStop(9.7/10, 'rgba(255,255,0,0.5)'); //yellow
        grad.addColorStop(9.8/10, 'rgba(255,0,0,0.5)'); // red
        ctx.fillStyle=grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle="rgba(0,0,0,1.0)";
        ctx.strokeStyle="rgba(0,0,0,1.0)";
        // bar chart of level //
        //for(i=0; i < miclevel.length; i++) {
        //    //fillRect(x,y,width,height)
        //    ctx.fillRect(barx, canvas.height - miclevel[i], barwidth, miclevel[i]);
        //    barx += barwidth;
        //}

        // line chart of level //
        //barx = 0; // uncomment line if bar chart is done first
        ctx.beginPath();
        ctx.moveTo(0,canvas.height);
        for(i=0; i < miclevel.length; i++) {
            if (miclevel[i] === -1) miclevel[i] = 0;
            ctx.lineTo(barx, canvas.height - miclevel[i]);
            barx += barwidth;
        }
        ctx.moveTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.stroke();
        //ctx.fill();

        if (Modernizr.canvastext) {
            // Add legend
            ctx.fillStyle="black";
            ctx.font = "8pt Helvetica"
            ctx.fillText('100', 1, 8);
            ctx.fillText('75', 1, (canvas.height/4) + 4);
            ctx.fillText('50', 1, (canvas.height/2) + 4);
            ctx.fillText('25', 1, (canvas.height / (4/3)) + 4);
            ctx.fillText('0', 1, canvas.height);
        }
    } else {
        // canvas-unsupported code here
    }

    $('#micsetup').oneTime(1000, function(){
        Wami.startPlaying(recorder_url + "?workerId=" +
        workerId +
        "&assignmentId=" + assignmentId +
        "&hitId=" + hitId +
        "&hash=" + amzhash +
        "&experiment=" + experiment +
        "&filename=test", "onPlayStart", "onPlayFinish", "onError");
      });

    //var micmean = miclevel.reduce(function(a,b) {return a+b;}) / miclevel.length;
    //miclevel.sort(function(a,b) {return a-b;});
    //var micmax = miclevel[miclevel.length-1];
    //var micmin = miclevel[0];
    //$('#miclevel').html("Samples: " + ''.concat(miclevel) + " Mean level: " + micmean + " Max level: " + micmax + " Min level: " + micmin);
};

var onPlayStart = function() {$('#teststate').html('');};
var onPlayFinish = function() {};
