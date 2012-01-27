            $(document).ready( function() {
                var finished = false;
                flowplayer("audioplayer", "/flowplayer/flowplayer-3.2.7.swf", {
                    plugins: {
                        controls: {
                            all: false, play: true, volume: true, time: true,
                            fullscreen: false, height: 30, autoHide: false,
             {% if debug %} scrubber: true {% else %} scrubber: false {% endif %}
                            }
                        },
                    clip:
                        { url:'/mturk/stimuli/socalign1/{{ soundfile.FileName }}',
                          title:'',
                          autoPlay: false },
                        // blocks pause from happening
                        onBeforePause: function () {return false;},
                        onLoad : function() {
                            this.setVolume(100);
                        },
                        onFinish: function() {
                            $(':input[name="endaudio"]').val(isodatetime());
                            $('#exposure').hide();
                            $('#testintr').show();
                        }
                    });
                $('button#endinstr').click(function(){
                    if ($('#wami')[0].getSettings().microphone.granted) {
                        $(':input[name="starttime"]').val(isodatetime());
                        $('#instructions').hide();
                        $('#exposure').show();
                    } else {
                        alert("You have to allow microphone access for this experiment!");
                    }
                });
                $('button#starttest').click(function(){
                    $('#testintr').hide();
                    $('.testtrial').first().show(function() {
                        $(this).children('.wamibuttons').show(function() {
                            $(this).children('.startrecord').removeAttr('disabled').focus();
                        });
                    });
                });
                $(':button[name="dosurvey"]').click(function(){
                    $('#surveychoice').hide();
                    if(this.id == 'takeit') {
                        $('#survey').show();
                    } else {
                        wrapup();
                    }
                });
                var secondTimeThrough = false;
                $(':button#endsurvey').click(function(){
                    if (validateSurvey() || secondTimeThrough) {
                        $('#survey').hide();
                        wrapup();
                    } else {
                        alert('You didn\'t answer all questions. Please consider answering the questions highlighted in red. If this is deliberate, just press Done again.');
                    }
                    secondTimeThrough = true;
                });

                $('.startrecord').on('click', function(e){
                    $(this).attr('disabled', 'disabled');
                    $(this).siblings('.stoprecord').removeAttr('disabled').focus();
                    Wami.startRecording("http://localhost:8181/wav_uploader/?workerId={{amz.workerId}}&amp;assignmentId={{amz.assignmentId}}&amp;hitId={{amz.hitId}}&amp;hash={{amz.hash}}&amp;filename=" + $(this).parent().attr('name'), "onRecordStart", "onRecordFinish", "onError");
                });

                $('.stoprecord').on('click', function(e) {
                    Wami.stopRecording();
                    //FIXME: get parent refernces right
                    alert($(this).parent().attr('id'));
                    $(':input[name="end_' + this.id + '"]').val(isodatetime());
                    $(this).parent().hide();
                    $(this).parent().next().show(function() {
                        $(this).children('textarea').focus();
                    });
                    if(this === $('.testtrial > textarea').last()[0]) {
                        $('#surveychoice').show();
                    }
                });

                function validateSurvey() {
                    var formvalid = true;
                    $.each(['feeling', 'exercise', 'politics', 'sports',
                    'moodchange', 'moviefreq', 'pleasureread', 'cheerful',
                    'currentevents', 'outgoing', 'similarpersonality',
                    'likespeaker', 'speakersuccess', 'malefemale'], function(index, value) {
                        if ($('[name="' + value + '"]:checked')[0] === undefined) {
                            $('#'+ value).css('color', 'red');
                            formvalid = false;
                        }
                    });
                    $.each(['speakerage', 'sleep'], function(index, value) {
                        if ($('[name="' + value + '"]').val() === 'NA') {
                            $('#'+ value).css('color', 'red');
                            formvalid = false;
                        }
                    });
                    return formvalid;
                }

                function wrapup() {
                    $('#debriefing').show();
                    $("#comment").show(function(){$('#commentarea').focus();});
                    $("#submit").show(function() {
                        $(this).removeAttr('disabled');
                        finished = true;
                    });
                }

                $('#results').submit(function() {
                    if (!finished) {
                        return false;
                    } else {
                        return true;
                    }
                });

                setupRecorder();
                    // disable submit and hide comment box until the end
                    $("#submit").attr('disabled', 'disabled');
                    $("#submit").hide();
                    $("#comment").hide();

                }
            );
