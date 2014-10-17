$(document).ready(function() {
  $(':checked').removeAttr('checked');
  $('input[name="browserid"]').val(navigator.userAgent);
  var finished = false;
  var p1Nudge = false;
  var p2Nudge = false;
  var p3Nudge = false;
  var p4Nudge = false;
  var p5Nudge = false;
  var p6Nudge = false;
  var extraPause = 2;

  Modernizr.load({
    test: Modernizr.canvas,
    nope: '/mturk/excanvas.js'
  });
  if (Modernizr.audio) {
    $('#instructions').show();
  } else {
    $('#oldBrowserMessage').show();
  }
  $('button#reset').on('click', function() {
    endEarly = false;
    $.ajax({
      type: 'POST',
      url: '/mturk/experiments/interactive_communication_1',
      data: {'ItemNumber': 0, 'Abandoned': false, 'WorkerId': workerId},
      datatype: 'json'
    }).done(function() {
      alert('Reset to zero. Reload the page to start from scratch.');
    }).fail(function() {
      alert('Failed to reset to zero.');
    });
  });
  $('button#tosurvey').on('click', function() {
    $(document).find(':input#endearly').val('Yes');
    $('#earlyStop').hide();
    $('#surveyStart').show();
  });
  $('button#startrecordtest').on('click', function(e) {
    e.stopPropagation();
    if (typeof(Wami.startRecording) === 'function') {
      $(this).attr('disabled', 'disabled');
      $('button#replaytest').attr('disabled', 'disabled');
      $('button#playbacktest').attr('disabled', 'disabled');
      $('button#endrecordtest').removeAttr('disabled');
      $('button#endsetup').removeAttr('disabled');
      Wami.startRecording(recorder_url + '?workerId=' +
        workerId +
        '&assignmentId=' + assignmentId +
        '&hitId=' + hitId +
        '&hash=' + amzhash +
        '&experiment=' + experiment +
        '&filename=test', 'onTestRecordStart', 'onTestRecordFinishUpdate', 'onError');
      $('#audioSetupDone').removeAttr('disabled');
    } else {
      alert('Still waiting for recorder to become ready.');
    }
  });
  $('button#endrecordtest').on('click', function(e) {
    e.stopPropagation();
    Wami.stopRecording();
    $('#micwarning').show();
    $(this).attr('disabled', 'disabled');
    $('button#startrecordtest').removeAttr('disabled');
    $('button#replaytest').removeAttr('disabled');
    $('#teststate').html('Transferring recorded file ... Thank you for your patience.');
  });
  $('button#replaytest').on('click', function(e) {
    e.stopPropagation();
    Wami.startPlaying(recorder_url + '?workerId=' +
      workerId +
      '&assignmentId=' + assignmentId +
      '&hitId=' + hitId +
      '&hash=' + amzhash +
      '&experiment=' + experiment +
      '&filename=test', 'onPlayStart', 'onPlayFinish', 'onError');
  });
  $('button#endsetup').on('click', function() {
    $('#audiosetup').hide();
    $('#realinstructions').show();
    window.scrollTo(0, 0);
  });
  $('button#endinstr').on('click', function() {
    if (Wami.getSettings().microphone.granted) {
      var instructionDone = true;
      if(!$('#consentDone').prop('checked')){
        instructionDone = false;
        $('#consent').children().first().css('color', 'red');
      }
      if(!$('#instructionDone').prop('checked')){
        instructionDone = false;
        $('#taskinstructions').children().first().css('color', 'red');
      }
      if(!$('#audioSetupDone').prop('checked')){
        instructionDone = false;
        $('#microphonesetup').children().first().css('color', 'red');
      }
      if (instructionDone){
        $('object').attr('height', 0);
        $('object').attr('width', 0);
        $('#instructions').hide(0);
        $('#startmessage').show(0);
        initial_sync_screen();
      } else {
        alert('Please read and check the necessary items before you continue.');
      }
    } else {
      alert('You have to allow microphone access for this experiment!');
    }
  });
  $('button#startpractice').on('click', function() {
    $('#startmessage').hide();
    $('#practice').show();
    $curTrial = $('#practice').children('.trial').first();
    $curTrial.show(0, function(){
      runTrial($curTrial)
    });
  });
  $('button#skipPractice').on('click', function() {
    $('#startmessage').hide();
    $('#testing').show();
    $curTrial = $('#testing').children('.trial').first();
    $curTrial.show(0, function(){
      runTrial($curTrial)
    });
  });
  $('button#skipTrials').on('click', function() {
    $('#startmessage').hide();
    $(document).find(':input#endearly').val('Yes');
    $('#surveyStart').show();
  });
  var showReady = function($imgd, duration, msg){
    $imgd.css("background-color", "green");
    $imgd.animate({opacity: 1}, duration, function(){
      if(msg){
        $('#syncstatusmsg').text(msg);
      }
    });
  };
  var endGreen = function($obj){
    $obj.css('background-color', 'green');
    $obj.animate({opacity: 1}, 300);
  };
  var downBlink = function($obj){
    $obj.animate({opacity: .1}, {
        duration: 300, 
        complete: function(){ upBlink($(this));},
        fail: function(){ endGreen($(this))}
      });
  };
  var upBlink = function($obj){
    $obj.animate({opacity: .5}, {
        duration: 300, 
        complete: function(){ downBlink($(this));},
        fail: function(){ endGreen($(this))}
      });
  };
  var redBlinkEndGreen = function($obj){
    $obj.css('background-color', 'red');
    upBlink($obj);
  };
  var opacityBlink = function($obj){
    if($obj.css('opacity') == "1"){
      $obj.animate({opacity: .1}, 300);
    } else {
      $obj.animate({opacity: 1}, 300);
    }
  };
  var initial_sync_screen = function(){
    $('#startmessage').show();
    var count = 0;
    $('#synctimer').everyTime(1000, "synctimer", function(){
      $('#synctimer').text(++count + '');
    });
    var $iconList = $('#initialsync').children();
    $iconList.css('opacity', '.1');
    $iconList.css('background-color', 'red');
    showReady($($iconList[0]), 300, 'Activated');
    var waitTime = 400;
    $($iconList[1]).oneTime(waitTime, function(){
      showReady($(this), 300, 'Connecting to server.');
      showReady($(this).next(), 300, 'Connected, waiting for a partner. You may leave this window and an alert will appear when a partner is found and connected to you.');
      waitTime += 75 * 1000 + Math.random() * 60 * 1000;
      $(this).next().next().oneTime(waitTime, function(){
        $('#syncstatusmsg').text('Partner found, connecting...');
        showReady($(this), 300, "Connected, activating partner's sound.");
        $(this).next().oneTime(400, function(){
          showReady($(this), 300, "Activated!");
          $(this).oneTime(500, function(){
            $('#syncstatusmsg').hide();
            $('#initialsync').hide();
            $('#partnersyncmsg').text("Ready! Please click the start button");
            $('#partnersyncmsg').next().hide();
            $('#synctimer').stopTime("synctimer");
            $('#startpractice').removeAttr('disabled');
            window.alert("Your partner is connected, please start!");
          });
        });
      });
    });
  };
  var animateSync = function($syncDiv, callback){
    console.log('animating syncscreen for trial');
    var $iconList = $syncDiv.children();
    $iconList.css('opacity', '.1');
    var syncTimings = new Array();
    syncTimings[0] = 50 + Math.random()*50;
    syncTimings[1] = 400 + Math.random()*200;
    syncTimings[2] = 200 + Math.random()*200;
    syncTimings[3] = 400 + Math.random()*400;
    syncTimings[4] = 50 + Math.random()*50;
    console.log('animating microphone icon');
    redBlinkEndGreen($iconList.first());
    $iconList.first().oneTime(syncTimings[0], function(){
        console.log('stopping microphone icon');
        $(this).stop();
        redBlinkEndGreen($(this).next());
        console.log('animating server connection icon');
        $(this).next().oneTime(syncTimings[1], function(){
            console.log('stopping server connection icon');
            $(this).stop();
            console.log('animating server icon');
            redBlinkEndGreen($(this).next());
            $(this).next().oneTime(syncTimings[2], function(){
                console.log('stopping server icon');
                $(this).stop();
                console.log('Starting timer to check for complete upload');
                $(this).next().everyTime(300, function(){ //keep checking if done uploading
                    console.log('Checking if done');
                    if(doneUpload){ //if done then keep going
                        console.log('Done uploading, stopping timer');
                        $(this).stopTime();
                        console.log('Animating partner connection icon');
                        redBlinkEndGreen($(this));
                        $(this).oneTime(syncTimings[3], function(){
                            console.log('stopping partner connection icon');
                            $(this).stop();
                            console.log('animating partner icon');
                            redBlinkEndGreen($(this).next());
                            $(this).next().oneTime(syncTimings[4], function(){
                                console.log('stopping partner icon');
                                $(this).stop();
                                $(this).oneTime(300, function(){
                                    console.log('callling callback');
                                    callback.call($syncDiv);
                                  });
                              });
                          });
                      }
                  });
              });
          });
      });
  };
  var runFixationAndRec = function($trialDiv){
      var fixTime = 750;
      $trialDiv.show(0, function(){
          $(this).children().first().show(0, function(){
              $trialDiv.children('.record_start').val(new Date().getTime());
              Wami.startRecording(recorder_url + '?workerId=' +
                workerId +
                '&assignmentId=' + assignmentId +
                '&hitId=' + hitId +
                '&hash=' + amzhash +
                '&experiment=' + experiment +
                '&filename=' + workerId + "_" + $trialDiv.find('.itemID').attr('id'), 'onRecordStartUpdate', 'onRecordFinishUpdate', 'onError');
              $(this).oneTime(fixTime, function(){
                  $(this).hide(0, function(){
                      runStims($trialDiv);
                    });
                });
            });
        });
    };
  var runFeedback = function($trialDiv){
      var feedbackWait = 3000;
      switch ($trialDiv.children(':input.partnerfeedback').val()){
          case "Choice":
            //show partner choice, green if target, red otherwise
            var partnerResponse = $trialDiv.children(':input.partnerresponse').val();
            var positionType  = $trialDiv.children(':input.targetposition').val();
            var backgroundcolor = "red";
            if (partnerResponse == "Target"){
                backgroundcolor = "green";
              }
            var $partnerDiv = $trialDiv.find('.position1');
            if (positionTypeResponseMap[2][positionType - 1] == partnerResponse){
              //response is position 2
                $partnerDiv = $trialDiv.find('.position2');
              } else if (positionTypeResponseMap[3][positionType - 1] == partnerResponse){
                $partnerDiv = $trialDiv.find('.position3');
              }
            $partnerDiv.children('.partnercue').show();
            $partnerDiv.css("background-color", backgroundcolor);
            break;
          case "Simple":
            //set feedback msg to say the partner picked right/wrong
            $trialDiv.find(".responsemsg").css("color", "green");
            if ($trialDiv.children(':input.partnerresponse').val() == "Target"){
                $trialDiv.find(".responsemsg").text("Your partner picked the right word!");
              } else {
                $trialDiv.find(".responsemsg").text("Your partner picked the wrong word!");
                $trialDiv.find(".responsemsg").css("color", "red");
              }
          case "NoFeedback":
          default:
            $trialDiv.find(".responsemsg").show(0);
        }
      $trialDiv.oneTime(feedbackWait, "feedbackWaitTimer", function(){
          $trialDiv.children(".stimuliframe").hide(0);
          $trialDiv.children(".timerbar").hide(0);
          $trialDiv.children(".responsecontainer").hide(0);
          runPostTrial($trialDiv);
        });
    };
  var runPostTrial = function($trialDiv){
      console.log('running post trial screen');
      if($trialDiv[0] === $trialDiv.parent().children('.trial').last()[0]){
          console.log('Just finished last trial in this container, if practice move to test, if not go to survey');
          $trialDiv.parent().hide(0);
          if($trialDiv.parent().attr('id') == 'practice'){
            $('#teststart').show(0, function(){
                var count = 30;
                var $nextButton = $(this).find('#starttest');
                $nextButton.everyTime(1000, "buttonTimer", function(){
                  if(count < 1){
                      $(this).stopTime();
                      $(this).stopTime("buttonTimer");
                      console.log('Took too long to advance, moving on to survey');
                      endEarly = true;
                      $(this).parent().hide(0);
                      $(this).click();
                    } else {
                      $(this).text(--count + '');
                    }
                  });
              });
          } else {
            $.ajax({
                type: 'POST',
                url: '/mturk/experiments/interactive_communication_1',
                data: {'FinishedTrials': "true", 'WorkerId': workerId},
                datatype: 'json'
              }).done(function(msg) {
                if (debugmode) {
                    console.log('Updated to ' + JSON.stringify(msg));
                  }
              });
            $('#surveyStart').show();
          }
        } else {
          console.log('Running timer downdown');
          var count = 30;
          var $nextButton = $trialDiv.find('button.nexttrial');
          $trialDiv.children(".posttrialwait").show();
          $nextButton.everyTime(1000, "buttonTimer", function(){
              if(count < 1){
                  $(this).stopTime();
                  $(this).stopTime("buttonTimer");
                  console.log('Took too long to advance, moving on to survey');
                  endEarly = true;
                  $trialDiv.parent().hide(0);
                  $('#earlyStop').show();
                } else {
                  $(this).text(--count + '');
                }
            });
        }
    };
  var runStims = function($trialDiv){
      var previewTime = 1500;
      var timerTime = 10000;
      var partnerRT = parseInt($trialDiv.children(':input.partnerresponsetime').val());
      var $targetDiv = $trialDiv.find('.position1');
      var positionType = $trialDiv.children(':input.targetposition').val();
      if (positionTypeResponseMap[2][positionType - 1] == "Target"){
        //Target is position 2
          $targetDiv = $trialDiv.find('.position2');
        } else if (positionTypeResponseMap[3][positionType - 1] == "Target"){
          $targetDiv = $trialDiv.find('.position3');
        }
      $trialDiv.find(".timerbar").show(0, function(){
          $trialDiv.children('.words_up').val(new Date().getTime());
          $trialDiv.find(".stimuliframe").show(0, function(){
              $(this).oneTime(previewTime, function(){
                  $trialDiv.children('.cue_up').val(new Date().getTime());
                  $targetDiv.css("border-color", "black");
                  $targetDiv.children('.speakercue').show(0);
                  $trialDiv.find(".timerbar").animate({width: "0px"},{
                      duration: timerTime,
                      easing: 'linear',
                      always: function(){
                          $trialDiv.children('.timer_stop').val(new Date().getTime());
                          $trialDiv.oneTime(1000, "stopRecorderTimer", function(){
                              $trialDiv.children('.record_end').val(new Date().getTime());
                              Wami.stopRecording();
                            });
                          runFeedback($trialDiv);
                        }
                    });
                  if (partnerRT != -1){
                      $trialDiv.find(".timerbar").oneTime(partnerRT, function(){
                          $(this).stop();
                        });
                    }
                  if ($('[name="stimuliframe_width"]').val() === ''){
                      $('[name="stimuliframe_width"]').val($trialDiv.find('.stimuliframe').width());
                      $('[name="stimuliframe_height"]').val($trialDiv.find('.stimuliframe').height());
                      $('[name="stimuli_width"]').val($trialDiv.find('.position1').find('.stimulus').width());
                      $('[name="stimuli_height"]').val($trialDiv.find('.position1').find('.stimulus').height());
                      $('[name="stimuli_fontsize"]').val($trialDiv.find('.position1').find('.stimulus').css("font-size"));
                    }
                });
            });
        });
    };
  var runTrial = function($trialDiv){
// first animate sync screen
      var $syncDiv = $trialDiv.parent().find('.pretrialsync');
      $syncDiv.show(0, function(){
          animateSync($(this), function(){
              $(this).hide(0, function(){
                  runFixationAndRec($trialDiv);
                });
            });
        });
    };
  var positionTypeResponseMap = [
    ["1", "2", "3", "4", "5", "6"],
    ["Target", "Target", "Filler", "Competitor", "Competitor", "Filler"],
    ["Competitor", "Filler", "Target", "Target", "Filler", "Competitor"],
    ["Filler", "Competitor", "Competitor", "Filler", "Target", "Target"]
  ];
  $('button.readyToContinue').on('click', function(){
      $(this).attr("disabled", "disabled");
      var $nextButton = $(this).siblings('button.nexttrial').first();
      var $msg = $(this).siblings('p.posttrialmsg').first();
      $msg.text("Waiting for partner to return, may take a few moments. Do not leave! The next trial will start as soon as they return.");
      $nextButton.stopTime();
      $nextButton.stopTime("buttonTimer");
      waitOver = 15 * 1000 + (Math.random() * (24 - 7 ) + 7) * 1000;
      $nextButton.oneTime(waitOver, function(){
          $(this).removeAttr("disabled");
          $(this).click();
        });
    });
  $('button.extendPause').on('click', function(){
        console.log('requested long pause');
        $(this).attr("disabled", "disabled");
        if(extraPause > 0){
          var $nextButton = $(this).siblings('button.nexttrial').first();
          var $readyButton = $(this).siblings('button.readyToContinue').first();
          var $msg = $(this).siblings('p.posttrialmsg').first();
          var timeLeft = $nextButton.text();
          if (timeLeft > 11){
            --extraPause;
            $msg.oneTime(1000 + Math.random() * 9 * 1000, function(){
                $readyButton.removeAttr("disabled");
                $nextButton.stopTime();
                $nextButton.stopTime("buttonTimer");
                $(this).siblings('.extendPauseInstructions').hide(0);
                $(this).text("Your partner accepted the break. You both have 5 minutes. When you are ready to start press the ready to continue button. We'll make sure your partner is ready as well, then the experiment will continue. If the time elapses the experiment will end early.");
                timeLeft = 5 * 60;
                $nextButton.attr("disabled","disabled")
                $nextButton.everyTime(1000, "buttonTimer", function(){
                  if(timeLeft < 1){
                      $(this).stopTime();
                      $(this).stopTime("buttonTimer");
                      console.log('Took too long to advance, moving on to survey');
                      endEarly = true;
                      $trialDiv.parent().hide(0);
                      $('#earlyStop').show();
                    } else {
                      $(this).text(--timeLeft + '');
                    }
                });
              });
          }
        } else {
          var $msg = $(this).siblings('p.posttrialmsg').first();
          $msg.oneTime(1000 + Math.random() * 14 * 1000, function(){
              $(this).siblings('.extendPauseInstructions').hide(0);
              $(this).text('Sorry, your partner is unwilling to take a break. This may be because they need to finish the HIT as soon as possible.');
            });
        }
      });
  $('button.nexttrial').on('click', function(){
      if(!$(this).attr("disabled")){
          console.log('moving to next trial');
          $(this).stopTime();
          $(this).stopTime("buttonTimer");
          $(this).parent().parent().hide();
          $curTrial = $(this).parent().parent().next();
          $curTrial.show(0, function(){
            runTrial($curTrial)
          });
        }
      });
  document.addEventListener('keydown', function(e) {
    if(e.keyCode == 32) {
      if(!($(e.target).is('textarea') || $(e.target).is('input'))){
        e.preventDefault();
        $('button.nexttrial:visible').click();
        $('#starttest:visible').click();
      }
    }
  });
  $('button#starttest').on('click', function() {
    $(this).stopTime();
    $(this).stopTime("buttonTimer");
    if (endEarly){
      $(this).parent().hide()
      $('#earlyStop').show();
    } else {
      $(this).parent().hide().next().show(0, function(){
        $curTrial = $('#testing').children('.trial').first();
        $curTrial.show(0, function(){
          runTrial($curTrial)
        });
      });
    }
  });
  $('#surveyStart button.next').on('click', function() {
      $('#surveyStart').hide();
      $('#page1').show();
    });
  $('#page1 button.next').on('click', function() {
    $('#page1 .survquest').css('color', 'black');
    var p1valid = true;

    if ($('[name="q.dialect_region"]').val() === '') {
      $('#current_dialect').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.dialect_region"]').val() === 'other' && $('[name="q.dialect_region_other"]').val() === '') {
      $('#current_dialect').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.dialect_region_same_at_birth"]').val() === '') {
      $('#birth_dialect').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.dialect_region_same_at_birth"]').val() === 'no' && $('[name="q.dialect_region_at_birth"]').val() === '') {
      $('#birth_dialect').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.dialect_region_same_at_birth"]').val() === 'no' && $('[name="q.dialect_region_at_birth"]').val() === 'other' && $('[name="q.dialect_region_other"]').val() === '') {
      $('#birth_dialect').css('color', 'red');
      p1valid = false;
    }

    if (p1valid) {
      $('#page1').hide();
      $('#page2').show(function() {$('label:visible')[0].scrollIntoView()});
    } else {
      if (!p1Nudge){
        p1Nudge = true;
        alert("Please answer all the question, it will greatly help our work. This message will appear only once per page as a reminder.");
      } else {
        $('#page1').hide();
        $('#page2').show(function() {$('label:visible')[0].scrollIntoView()});
      }
    }
  });
  $('#page2 button.next').on('click', function() {
    $('#page2 .survquest').css('color', 'black');
    var p2valid = true;

    if ($('[name="q.website_responsiveness"]:checked')[0] === undefined) {
      $('#q\\.website_responsiveness').css('color', 'red');
      p2valid = false;
    }

    if ($('[name="q.speaker_instruction_clarity"]:checked')[0] === undefined) {
      $('#q\\.speaker_instruction_clarity').css('color', 'red');
      p2valid = false;
    }

    if ($('[name="q.speaker_cue_clarity"]:checked')[0] === undefined) {
      $('#q\\.speaker_cue_clarity').css('color', 'red');
      p2valid = false;
    }

    if ($('[name="q.microphone_type"]').val() === '') {
      $('#q\\.microphone_type').css('color', 'red');
      p2valid = false;
    }

    if ($('[name="q.internetspeed"]').val() === '') {
      $('#q\\.internetspeed').css('color', 'red');
      p2valid = false;
    }

    if ($('[name="q.internet_quality"]:checked')[0] === undefined) {
      $('#q\\.internet_quality').css('color', 'red');
      p2valid = false;
    }

    if ($('[name="q.microphone_model"]').val() === '') {
      $('#q\\.microphone_model').css('color', 'red');
      p2valid = false;
    }

    if (p2valid) {
      $('#page2').hide();
      if ($('#responsetimetype').val() == "0" && $('#feedbackcondition').val() == "NoFeedback" ){
        $('#page4').show(function() {$('label:visible')[0].scrollIntoView()});
      } else {
        $('#page3').show(function() {$('label:visible')[0].scrollIntoView()});
      }
    } else {
      if (!p2Nudge){
        p2Nudge = true;
        alert("Please answer all the question, it will greatly help our work. This message will appear only once per page as a reminder.");
      } else {
        $('#page2').hide();
        if ($('#responsetimetype').val() == "0" && $('#feedbackcondition').val() == "NoFeedback" ){
          $('#page4').show(function() {$('label:visible')[0].scrollIntoView()});
        } else {
          $('#page3').show(function() {$('label:visible')[0].scrollIntoView()});
        }
      }
    }
  });
  $('#page3 button.next').on('click', function() {
    $('#page3 .survquest').css('color', 'black');
    var p3valid = true;
    if ($('#responsetimetype').val() == "1"){
      if ($('[name="q.partner_rt_speed"]:checked')[0] === undefined) {
        $('#q\\.partner_rt_speed').css('color', 'red');
        p3valid = false;
      }

      if ($('[name="q.speech_delay_to_partner"]:checked')[0] === undefined) {
        $('#q\\.speech_delay_to_partner').css('color', 'red');
        p3valid = false;
      }

      if ($('[name="q.partner_rt_failure"]').val() === '') {
        $('#q\\.partner_rt_failure').css('color', 'red');
        p3valid = false;
      }

      if ($('[name="q.partner_rt_before_speaker_finish"]').val() === '') {
        $('#q\\.partner_rt_before_speaker_finish').css('color', 'red');
        p3valid = false;
      }

      if ($('[name="q.partner_rt_before_speaker_start"]').val() === '') {
        $('#q\\.partner_rt_before_speaker_start').css('color', 'red');
        p3valid = false;
      }
    }
    if ($('#feedbackcondition').val() != "NoFeedback"){
      if ($('[name="q.partner_accuracy"]:checked')[0] === undefined) {
        $('#q\\.partner_accuracy').css('color', 'red');
        p3valid = false;
      }

      if ($('[name="q.partner_mistakes"]').val() === '') {
        $('#q\\.partner_mistakes').css('color', 'red');
        p3valid = false;
      }
    }

    if (p3valid) {
      $('#page3').hide();
      $('#page4').show(function() {$('label:visible:first')[0].scrollIntoView();});
    } else {
      if (!p3Nudge){
        p3Nudge = true;
        alert("Please answer all the question, it will greatly help our work. This message will appear only once per page as a reminder.");
      } else {
        $('#page3').hide();
        $('#page4').show(function() {$('label:visible:first')[0].scrollIntoView();});
      }
    }
  });
  $('#page4 button.next').on('click', function() {
    $('#page4 .survquest').css('color', 'black');
    var p4valid = true;

    if ($('[name="q.experiment_weirdness"]').val() === '') {
      $('#q\\.experiment_weirdness').css('color', 'red');
      p4valid = false;
    }

    if ($('[name="q.partner_weirdness"]').val() === '') {
      $('#q\\.partner_weirdness').css('color', 'red');
      p4valid = false;
    }

    if (p4valid) {
      $('#page4').hide();
      $('#page5').show(function() {$('label:visible')[0].scrollIntoView()});
    } else {
      if (!p4Nudge){
        p4Nudge = true;
        alert("Please answer all the question, it will greatly help our work. This message will appear only once per page as a reminder.");
      } else {
        $('#page4').hide();
        $('#page5').show(function() {$('label:visible')[0].scrollIntoView()});
      }
    }
  });
  $('#page5 button.next').on('click', function() {
    $('#page5 .survquest').css('color', 'black');
    var p5valid = true;
    if ($('[name="q.partner_computer_like"]:checked')[0] === undefined) {
      $('#q\\.partner_computer_like').css('color', 'red');
      p4valid = false;
    }

    if (p5valid) {
      $('#page5').hide();
      $('#page6').show(function() {$('label:visible')[0].scrollIntoView()});
    } else {
      if (!p5Nudge){
        p5Nudge = true;
        alert("Please answer all the question, it will greatly help our work. This message will appear only once per page as a reminder.");
      } else {
        $('#page5').hide();
        $('#page6').show(function() {$('label:visible')[0].scrollIntoView()});
      }
    }
  });
  $('#page6 button#endsurvey').on('click', function() {
    $('#page6 .survquest').css('color', 'black');
    var p6valid = true;
    if ($('[name="q.coverstory_plausability"]:checked')[0] === undefined) {
      $('#q\\.coverstory_plausability').css('color', 'red');
      p6valid = false;
    }

    if ($('[name="q.experiment_interactivity"]:checked')[0] === undefined) {
      $('#q\\.experiment_interactivity').css('color', 'red');
      p6valid = false;
    }

    if ($('[name="q.partner_computer_realization"]').val() == "") {
      $('#q\\.partner_computer_realization').css('color', 'red');
      p6valid = false;
    }

    if (p6valid) {
      $.ajax({
          type: 'POST',
          url: '/mturk/experiments/interactive_communication_1',
          data: {'FinishedSurvey': "true", 'WorkerId': workerId},
          datatype: 'json'
        }).done(function(msg) {
          if (debugmode) {
              console.log('Updated to ' + JSON.stringify(msg));
            }
        });
      $('#page6').hide();
      wrapup();
    } else {
      if (!p6Nudge){
        p6Nudge = true;
        alert("Please answer all the question, it will greatly help our work. This message will appear only once per page as a reminder.");
      } else {
        $.ajax({
            type: 'POST',
            url: '/mturk/experiments/interactive_communication_1',
            data: {'FinishedSurvey': "true", 'WorkerId': workerId},
            datatype: 'json'
          }).done(function(msg) {
            if (debugmode) {
                console.log('Updated to ' + JSON.stringify(msg));
              }
          });
        $('#page6').hide();
        wrapup();
      }
    }
  });
  var wrapup = function() {
    $('#comment').show(function() {$('#commentarea').focus();});
    $('#submit').show(function() {
      $(this).removeAttr('disabled');
      finished = true;
    });
  };
  $('#results').submit(function() {
    if (!finished) {
      return false;
    } else {
      $.ajax({
          type: 'POST',
          url: '/mturk/experiments/interactive_communication_1',
          data: {'FinishedHIT': 'true', 'WorkerId': workerId},
          datatype: 'json'
        }).done(function(msg) {
          if (debugmode) {
              console.log('Updated to ' + JSON.stringify(msg));
            }
        });
      return true;
    }
  });
  setupRecorder();
  if (itemno === 0) { // this should happen only if starting from the beginning
    $('#instructions').show();
  } else { // and this should only happen if we're starting from after the 1st item
    $('#instructions').hide();
    $('#practice').hide();
    $('#testing').hide();
    endEarly = true;
    $('#earlyStop').show();
  }
});

var endEarly = false;
var curTrial = null;
var doneUpload = true;

var onRecordStartUpdate = function() {
    doneUpload = false;
    recordInterval = setInterval(function () {
        var level = Wami.getRecordingLevel();
      }, 25);
  };
var onRecordFinishUpdate = function() {
  clearInterval(recordInterval);
  doneUpload = true;
  $.ajax({
      type: 'POST',
      url: '/mturk/experiments/interactive_communication_1',
      data: {'ItemNumber': ++itemno, 'WorkerId': workerId},
      datatype: 'json'
    }).done(function(msg) {
      if (debugmode) {
          console.log('Updated to ' + JSON.stringify(msg));
        }
    });
  };

var onTestRecordFinishUpdate = function() {
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

        if (Modernizr.canvastext) {
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

    $('#micsetup').oneTime(500, function(){
        Wami.startPlaying(recorder_url + "?workerId=" +
        workerId +
        "&assignmentId=" + assignmentId +
        "&hitId=" + hitId +
        "&hash=" + amzhash +
        "&experiment=" + experiment +
        "&filename=test", "onPlayStart", "onPlayFinish", "onError");
      });
};
