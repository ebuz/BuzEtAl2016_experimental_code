            $(document).ready( function() {
                $(':checked').removeAttr('checked');
                var finished = false;
                var recorder_url = "http://127.0.0.1:8181/wav_uploader/";
                $("#soundfile").flowplayer("/flowplayer/flowplayer-3.2.7.swf", {
                    plugins: {
                        controls: {
                            all: false, play: true, volume: true, time: true,
                            fullscreen: false, height: 30, autoHide: false,
                            scrubber: true, //FIXME: change to false before deployment
                            zIndex: 100
                            }
                        },
                    clip:
                        { title:'',
                          autoPlay: false },
                        // blocks pause from happening
                        onBeforePause: function () {return false;},
                        onLoad : function() {
                            this.setVolume(100);
                        },
                        onFinish: function() {
                            $(':input[name="endaudio"]').val(new Date().toISOString());
                            $('#exposure').hide();
                            $('#testintr').show();
                        }
                });
                $('button#endinstr').click(function(){
                    if (Wami.getSettings().microphone.granted) {
                        $(':input[name="starttime"]').val(new Date().toISOString());
                        $('#instructions').hide();
                        $('#exposure').show();
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
                    $(':input[name="end_' + $(this).parent().attr('id') + '"]').val(new Date().toISOString());
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
                        $('#page2').show();
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
                        $('#page3').show();
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

                    if($('[name="q.participant.gender"]:checked')[0] === undefined &&
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
                        $('#page4').show();
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
