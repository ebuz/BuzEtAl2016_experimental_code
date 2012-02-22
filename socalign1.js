            $(document).ready( function() {
                var finished = false;
                $("#soundfile").flowplayer("/flowplayer/flowplayer-3.2.7.swf", {
                    plugins: {
                        controls: {
                            all: false, play: true, volume: true, time: true,
                            fullscreen: false, height: 30, autoHide: false,
                            scrubber: true //FIXME: change to false before deployment
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
                    Wami.startRecording("http://127.0.0.1:8181/wav_uploader/?workerId="
                        + workerId
                        + "&assignmentId=" + assignmentId
                        + "&hitId=" + hitId
                        + "&filename=" + $(this).parent().attr('name'), "onRecordStart", "onRecordFinish", "onError");
                });

                $('.stoprecord').on('click', function(e) {
                    Wami.stopRecording();
                    $(':input[name="end_' + $(this).parent().attr('id') + '"]').val(new Date().toISOString());
                    $(this).parent().parent().hide();
                    $(this).parent().parent().next().show(function() {
                        $(this).children('.wamibuttons').show(function() {
                            $(this).children('.startrecord').removeAttr('disabled').focus();
                        });
                    });
                    if($(this)[0] === $('.stimitem').last()[0]) {
                        $('#surveychoice').show();
                    }
                });

                function validateSurvey() {
                    var formvalid = true;
                    $.each(['q.speaker.conservative','q.speaker.liberal',
                            'q.speaker.articulate','q.speaker.accented',
                            'q.speaker.intelligent','q.speaker.educated',
                            'q.speaker.self-centered','q.speaker.generous',
                            'q.speaker.weak_arguments','q.speaker.shy',
                            'q.speaker.enthusiastic','q.speaker.easy_to_understand',
                            'q.participant.speaker_speaks_like_me',
                            'q.participant.speaker_is_similar_to_me',
                            'q.participant.speaker_would_understand_me',
                            'q.participant.agree_with_speaker',
                            'q.participant.want_speaker_as_friend','q.participant.education',
                            'q.ideology.conservative','q.ideology.liberal',
                            'q.ideology.republicans','q.ideology.democrats',
                            'q.ideology.enjoy_accents','q.ideology.proper_english',
                            'q.ideology.official_language',
                            'q.ideology.importance_of_speaking_well',
                            'q.ideology.accent_and_self-presentation',
                            'q.ideology.accent_predicts_intelligence',
                            'q.conflict.dominate.my_way_best','q.conflict.avoid.ignore',
                            'q.conflict.integrate.meet_halfway',
                            'q.conflict.dominate.insist_my_position_be_accepted',
                            'q.conflict.avoid.pretend_nothing_happend',
                            'q.conflict.avoid.pretend_no_conflict',
                            'q.conflict.integrate.middle_course',
                            'q.conflict.dominate.dominate_until_other_understands',
                            'q.conflict.integrate.give_and_take']
, function(index, value) {
                        if ($('[name="' + value + '"]:checked')[0] === undefined) {
                            $('#'+ value).css('color', 'red');
                            formvalid = false;
                        }
                    });

                    if($('[name="q.participant.gender"]:checked')[0] === undefined &&
                       $('[name="q.participant.gender.other"]').val() == '') {
                        $('#q.participant.gender').css('color', 'red');
                        $('#q.participant.gender.other').css('color', 'red');
                        formvalid = false;
                    }

                    if($('[name="q.participant.age"]').val() === '') {
                        $('#q.participant.age').css('color', 'red');
                        formvalid = false;
                    }
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
