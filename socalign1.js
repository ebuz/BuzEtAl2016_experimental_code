$(document).ready( function() {
    $(':checked').removeAttr('checked');
    $('input[name="browserid"]').val(navigator.userAgent);
    var finished = false;

    Modernizr.load({
        test: Modernizr.canvas,
        nope: '/mturk/excanvas.js'
    });

    $('button#reset').on('click', function() {
        if(debugmode) {
            $.ajax({
                type: 'POST',
                url: '/mturk/experiments/socalign1',
                data: {'ItemNumber': 0, 'Abandoned': false, 'WorkerId': workerId},
                datatype: 'json'
            }).done(function() {
                alert("Reset to zero. Reload the page to start from scratch.");
            }).fail(function() {
                alert("Failed to reset to zero.");
            });
        }
    });

    $('button#resume').on('click', function() {
        if (typeof(Wami.startRecording) === 'function') {
            $('#reloadResume').hide();
            if(itemno == $('.testtrial').length) {
                $('#page1').show();
            } else {
                $($('.testtrial')[itemno]).show(function() {
                    Wami.startRecording(recorder_url + "?workerId=" +
                    workerId +
                    "&assignmentId=" + assignmentId +
                    "&hitId=" + hitId +
                    "&hash=" + amzhash +
                    "&experiment=SocAlign.1.NoContext" +
                    "&filename=" + $(this).children(':button.stoprecord').attr('id'), "onRecordStart", "onRecordFinishUpdate", "onError");
                });
            }
        } else {
            alert('Still waiting for recorder to become ready.');
        }
    });

    $('button#startrecordtest').on('click', function() {
        if (typeof(Wami.startRecording) === 'function') {
            $(this).attr('disabled', 'disabled');
            $('button#replaytest').attr('disabled', 'disabled');
            $('button#playbacktest').attr('disabled', 'disabled');
            $('button#endrecordtest').removeAttr('disabled');
            Wami.startRecording(recorder_url + "?workerId=" +
                workerId +
                "&assignmentId=" + assignmentId +
                "&hitId=" + hitId +
                "&hash=" + amzhash +
                "&experiment=SocAlign.1.NoContext" +
                "&filename=test", "onTestRecordStart", "onTestRecordFinish", "onError");
        } else {
            alert('Still waiting for recorder to become ready.')
        }
    });

    $('button#endrecordtest').on('click', function() {
        Wami.stopRecording();
        $('#micwarning').show();
        $(this).attr('disabled', 'disabled');
        $('button#startrecordtest').removeAttr('disabled');
        $('button#replaytest').removeAttr('disabled');
        $('#teststate').html('Transferring recorded file ... Thank you for your patience.');
    });

    $('button#replaytest').on('click', function() {
        Wami.startPlaying(recorder_url + "?workerId=" +
            workerId +
            "&assignmentId=" + assignmentId +
            "&hitId=" + hitId +
            "&hash=" + amzhash +
            "&experiment=SocAlign.1.NoContext" +
            "&filename=test", "onPlayStart", "onPlayFinish", "onError");
    });

    $('button#endsetup').on('click', function() {
        $('#audiosetup').hide();
        $('#realinstructions').show();
    });

    $('button#endinstr').on('click', function(){
        if (Wami.getSettings().microphone.granted) {
            $('object').attr('height',0);
            $('object').attr('width',0);
            $(':input[name="starttime"]').val(new Date().toISOString());
            $('#instructions').hide();
            $('#testintr').show();
        } else {
            alert("You have to allow microphone access for this experiment!");
        }
    });
    $('button#starttest').on('click', function(){
        $('#testintr').hide();
        $('.testtrial').first().show(function() {
            Wami.startRecording(recorder_url + "?workerId=" +
            workerId +
            "&assignmentId=" + assignmentId +
            "&hitId=" + hitId +
            "&hash=" + amzhash +
            "&experiment=SocAlign.1.NoContext" +
            "&filename=" + $(this).children(':button.stoprecord').attr('id'), "onRecordStart", "onRecordFinishUpdate", "onError");
        });
    });

    $('.stoprecord').on('click', function() {
        Wami.stopRecording();
    });

    $('button.hiddennext').on('click', function() {
        $(this).parent().hide().next().show(function() {
            Wami.startRecording(recorder_url + "?workerId=" +
            workerId +
            "&assignmentId=" + assignmentId +
            "&hitId=" + hitId +
            "&hash=" + amzhash +
            "&experiment=SocAlign.1.NoContext" +
            "&filename=" + $(this).children(':button.stoprecord').attr('id'), "onRecordStart", "onRecordFinishUpdate", "onError");
        });
        if($(this).parents('.testtrial')[0] === $('.testtrial').last()[0]) {
            $('#page1').show();
        }
    });


    $('#page1 button.next').on('click', function() {
        $('#page1 .survquest').css('color','black');
        var p1valid = true;

        if($('[name="q.participant.age"]').val() === '') {
            $('#age').css('color', 'red');
            p1valid = false;
        }

        if($('[name="q.participant.education"]').val() === '') {
            $('#education').css('color', 'red');
            p1valid = false;
        }

        if($('[name="q.participant.gender"]').val() === '' &&
           $('[name="q.participant.gender.other"]').val() === '') {
            $('#gender').css('color', 'red');
            p1valid = false;
        }

        $('#ideology .survquest').each(function() {
            var value = $(this).attr('id');
            var that = $(this);
            if ($('[name="' + value + '"]:checked')[0] === undefined) {
                $(that).css('color', 'red');
                p1valid = false;
           }
        });

        if (p1valid) {
            $('#page1').hide();
            $('#page2').show(function() {$('label:visible')[0].scrollIntoView()});
        } else {
            alert('Please answer all questions.');
        }
    });

    $('#page2 button#endsurvey').on('click', function() {
        $('#page2 .survquest').css('color','black');
        var p2valid = true;
        $('#page2 .survquest').each(function() {
            var value = $(this).attr('id');
            var that = $(this);
            if ($('[name="' + value + '"]:checked')[0] === undefined) {
                $(that).css('color', 'red');
                p2valid = false;
           }
        });
        if (p2valid) {
            $('#page2').hide();
            wrapup();
        } else {
            alert('Please answer all questions.');
        }
    });

    var wrapup = function() {
        $('#debriefing').show();
        $("#comment").show(function(){$('#commentarea').focus();});
        $("#submit").show(function() {
            $(this).removeAttr('disabled');
            finished = true;
        });
    };

    $('#results').submit(function() {
        if (!finished) {
            return false;
        } else {
            return true;
        }
    });

    setupRecorder();
    if (itemno === 0) { // this should happen only if starting from the beginning
        $('#instructions').show();
        } else { // and this should only happen if we're starting from after the 1st item
            $('#instructions').hide();
            $('#reloadResume').show();
        }
});

var onRecordFinishUpdate = function() {
    clearInterval(recordInterval);
    $('button.stoprecord:visible').siblings('.hiddennext').click();
    $.ajax({
            type: 'POST',
            url: '/mturk/experiments/socalign1',
            data: {'ItemNumber': ++itemno, 'WorkerId': workerId},
            datatype: 'json'
        }).done(function(msg) {
            if(debugmode) {
                console.log("Updated to " + JSON.stringify(msg));
            }
    });
};
