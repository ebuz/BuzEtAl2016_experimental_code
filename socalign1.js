$(document).ready( function() {
    $(':checked').removeAttr('checked');
    var finished = false;
    var recorder_url = "http://127.0.0.1:8181/wav_uploader/";

    if(Modernizr.audio) {
        $('#instructions').show();

        if(debugmode) {
            $('#exposure audio').attr('controls', true);
        } else {
            $('#exposure audio').attr('controls', false);
        }

        $('#exposure audio').on('play', function() {
            if (typeof(console) !== undefined) {console.log('Audio playing');}
        });

        $('#exposure audio').on('ended', function() {
            if (typeof(console) !== undefined) {console.log('Audio ended');}
            $(':input[name="endaudio"]').val(new Date().toISOString());
            $('#exposure').hide();
            $('#testintr').show();
        });
    } else {
        $('#oldBrowserMessage').show();
    }

    $('button#startrecordtest').on('click', function() {
        if (typeof(Wami.startRecording) === 'function') {
            $(this).attr('disabled', 'disabled');
            $('button#playbacktest').attr('disabled', 'disabled');
            $('button#endrecordtest').removeAttr('disabled');
            Wami.startRecording(recorder_url + "?workerId=" +
                workerId +
                "&assignmentId=" + assignmentId +
                "&hitId=" + hitId +
                "&filename=test", "onTestRecordStart", "onTestRecordFinish", "onError");
        } else {
            alert('Still waiting for recorder to become ready.')
        }
    });

    $('button#endrecordtest').on('click', function() {
        Wami.stopRecording();
        $(this).attr('disabled', 'disabled');
        $('button#startrecordtest').removeAttr('disabled');
        $('button#playbacktest').removeAttr('disabled');
    });

    $('button#endinstr').click(function(){
        if (Wami.getSettings().microphone.granted) {
            $(':input[name="starttime"]').val(new Date().toISOString());
            $('#instructions').hide();
            $('#exposure').show(function() {
                $('#exposure audio')[0].volume = 1;
                $('#exposure audio')[0].play();
            });
        } else {
            alert("You have to allow microphone access for this experiment!");
        }
    });
    $('button#starttest').click(function(){
        $('#testintr').hide();
        $('.testtrial').first().show(function() {
            Wami.startRecording(recorder_url + "?workerId=" +
            workerId +
            "&assignmentId=" + assignmentId +
            "&hitId=" + hitId +
            "&filename=" + $(this).children(':button').attr('id'), "onRecordStart", "onRecordFinish", "onError");
        });
    });

    $('.stoprecord').on('click', function(e) {
        Wami.stopRecording();
        $(':input[name="end_' + $(this).attr('id') + '"]').val(new Date().toISOString());
        $(this).parent().hide().next().show(function() {
            Wami.startRecording(recorder_url + "?workerId=" +
            workerId +
            "&assignmentId=" + assignmentId +
            "&hitId=" + hitId +
            "&filename=" + $(this).children(':button').attr('id'), "onRecordStart", "onRecordFinish", "onError");
        });
        if($(this).parents('.testtrial')[0] === $('.testtrial').last()[0]) {
            $('#page1').show();
        }
    });

    $('#page1 button.next').on('click', function() {
        $('#page1 .survquest').css('color','black');
        var p1valid = true;
        $('#page1 .survquest').each(function() {
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

    $('#page2 button.next').on('click', function() {
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
            $('#page3').show(function() {$('label:visible:first')[0].scrollIntoView()});
        } else {
            alert('Please answer all questions.');
        }
    });

    $('#page3 button.next').on('click', function() {
        $('#page3 .survquest').css('color','black');
        var p3valid = true;

        if($('[name="q.participant.age"]').val() === '') {
            $('#age').css('color', 'red');
            p3valid = false;
        }

        if($('[name="q.participant.education"]').val() === '') {
            $('#education').css('color', 'red');
            p3valid = false;
        }

        if($('[name="q.participant.gender"]').val() === '' &&
           $('[name="q.participant.gender.other"]').val() === '') {
            $('#gender').css('color', 'red');
            p3valid = false;
        }

        $('#ideology .survquest').each(function() {
            var value = $(this).attr('id');
            var that = $(this);
            if ($('[name="' + value + '"]:checked')[0] === undefined) {
                $(that).css('color', 'red');
                p3valid = false;
           }
        });

        if (p3valid) {
            $('#page3').hide();
            $('#page4').show(function() {$('label:visible')[0].scrollIntoView()});
        } else {
            alert('Please answer all questions.');
        }
    });

    $('#page4 button#endsurvey').on('click', function() {
        $('#page4 .survquest').css('color','black');
        var p4valid = true;
        $('#page4 .survquest').each(function() {
            var value = $(this).attr('id');
            var that = $(this);
            if ($('[name="' + value + '"]:checked')[0] === undefined) {
                $(that).css('color', 'red');
                p4valid = false;
           }
        });
        if (p4valid) {
            $('#page4').hide();
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
});
