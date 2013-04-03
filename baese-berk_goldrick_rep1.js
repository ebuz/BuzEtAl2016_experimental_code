$(document).ready(function() {
  $(':checked').removeAttr('checked');
  $('input[name="browserid"]').val(navigator.userAgent);
  var finished = false;

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
    $('#page1').show();
  });
  $('button#startrecordtest').on('click', function() {
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
        '&experiment=' + endurl +
        '&filename=test', 'onTestRecordStart', 'onTestRecordFinish', 'onError');
    } else {
    alert('Still waiting for recorder to become ready.');
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
    Wami.startPlaying(recorder_url + '?workerId=' +
      workerId +
      '&assignmentId=' + assignmentId +
      '&hitId=' + hitId +
      '&hash=' + amzhash +
      '&experiment=' + endurl +
      '&filename=test', 'onPlayStart', 'onPlayFinish', 'onError');
  });
  $('button#endsetup').on('click', function() {
    $('#audiosetup').hide();
    $('#realinstructions').show();
    $('#realinstructions').scrollTop(0);
  });
  $('button#endinstr').on('click', function() {
    if (Wami.getSettings().microphone.granted) {
      $('object').attr('height', 0);
      $('object').attr('width', 0);
      $('#instructions').hide(0);
      $('#startmessage').show(0);
      initial_sync_screen();
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
      showReady($(this), 300, 'Connecting to server');
      showReady($(this).next(), 400, 'Connected, waiting for a partner');
      waitTime += 27600;
      $(this).next().next().oneTime(waitTime, function(){
        $('#syncstatusmsg').text('Partner found, connecting');
        showReady($(this), 400, "Connected, activating partner's sound");
        $(this).next().oneTime(400, function(){
          showReady($(this), 400, "Activated!");
          $(this).oneTime(500, function(){
            $('#syncstatusmsg').hide();
            $('#initialsync').hide();
            $('#partnersyncmsg').text("Ready! Please click the start button");
            $('#partnersyncmsg').next().hide();
            $('#synctimer').stopTime("synctimer");
            $('#startpractice').removeAttr('disabled');
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
                '&experiment=' + endurl +
                '&filename=' + $trialDiv.find('.itemID').attr('id'), 'onRecordStartUpdate', 'onRecordFinishUpdate', 'onError');
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
            if (positionTypeResponseMap[2][positionType] == partnerResponse){
              //response is position 2
                $partnerDiv = $trialDiv.find('.position2');
              } else if (positionTypeResponseMap[3][positionType] == partnerResponse){
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
            $('#page1').show();
          }
        } else {
          console.log('Running timer downdown');
          var count = 30;
          var $nextButton = $trialDiv.find('button.nexttrial');
          $trialDiv.children(".posttrialwait").show();
          $nextButton.everyTime(1000, "buttonTimer", function(){
              if(count < 1){
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
      if (positionType == 2 || positionType == 3) {
          $targetDiv = $trialDiv.find('.position2');
        } else if (positionType == 4 || positionType == 5) {
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
    ["0", "1", "2", "3", "4", "5"],
    ["Target", "Target", "Filler", "Competitor", "Competitor", "Filler"],
    ["Competitor", "Filler", "Target", "Target", "Filler", "Competitor"],
    ["Filler", "Competitor", "Competitor", "Filler", "Target", "Target"]
  ];
  $('button.nexttrial').on('click', function(){
        console.log('moving to next trial');
        $(this).stopTime();
        $(this).stopTime("buttonTimer");
        $(this).parent().parent().hide();
        $curTrial = $(this).parent().parent().next();
        $curTrial.show(0, function(){
          runTrial($curTrial)
        });
      });
  document.addEventListener('keydown', function(event) {
    if(event.keyCode == 32) {
      $('button.nexttrial:visible').click();
      $('#starttest:visible').click();
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
  $('#page1 button.next').on('click', function() {
    $('#page1 .survquest').css('color', 'black');
    var p1valid = true;

    if ($('[name="q.participant.age"]').val() === '') {
      $('#age').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.participant.education"]').val() === '') {
      $('#education').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.participant.gender"]').val() === '' &&
      $('[name="q.participant.gender.other"]').val() === '') {
      $('#gender').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.accent_comment"]').val() === '') {
      $('#accent').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.living_city_state"]').val() === '') {
      $('#accent').css('color', 'red');
      p1valid = false;
    }

    if ($('[name="q.born_city_state"]').val() === '') {
      $('#accent').css('color', 'red');
      p1valid = false;
    }

    if (p1valid) {
      $('#page1').hide();
      $('#page2').show(function() {$('label:visible')[0].scrollIntoView()});
    } else {
      alert('Please answer all questions.');
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
      $('#q\\.microphone_model').parent().prev().css('color', 'red');
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
      alert('Please answer all questions.');
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
    alert('Please answer all questions.');
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
      alert('Please answer all questions.');
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
      alert('Please answer all questions.');
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
      $('#page6').hide();
      wrapup();
    } else {
      alert('Please answer all questions.');
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
      }, 200);
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
