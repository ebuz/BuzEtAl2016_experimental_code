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
      url: '/mturk/experiments/baese-berk_goldrick_rep1',
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
        '&experiment=' + experiment +
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
      '&experiment=' + experiment +
      '&filename=test', 'onPlayStart', 'onPlayFinish', 'onError');
  });

  $('button#endsetup').on('click', function() {
    $('#audiosetup').hide();
    $('#realinstructions').show();
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

  $('button#starttrials').on('click', function() {
    $('#startmessage').hide();
    $('#startmessage').next().show();
    var $nextTrial = $('#startmessage').next().children().first();
    $nextTrial.show(0, function(){
      pretrial_sync_fixation_screen($nextTrial)
    });
  });

  var showReady = function($imgd, duration){
    $imgd.animate({opacity: 1}, duration, function(){
      $imgd.css("background-color", "green");
    });
  };

  var initial_sync_screen = function(){
    $('#startmessage').show();
    var count = 0;
    $('#synctimer').everyTime(1000, "synctimer", function(){
      $('#synctimer').text(++count + '');
    });
    var $iconList = $('#initialsync').children();
    $iconList.css('opacity', '.1')
    showReady($($iconList[0]), 300);
    var waitTime = 11530;
    $iconList.oneTime(waitTime, function(){
      showReady($($iconList[1]), 500);
      showReady($($iconList[2]), 1000);
    });
    waitTime += 16300;
    $iconList.oneTime(waitTime, function(){
      showReady($($iconList[3]), 500);
    });
    waitTime += 2200;
    $iconList.oneTime(waitTime, function(){
      showReady($($iconList[4]), 2000);
    });
    waitTime += 3000;
    $iconList.oneTime(waitTime, function(){
      $('#initialsync').hide();
      $('#partnersyncmsg').text("Ready! Please click the start button");
      $('#partnersyncmsg').next().hide();
      $('#synctimer').stopTime("synctimer");
      $('#starttrials').removeAttr('disabled');
    });
  };

  var pretrial_sync_fixation_screen = function($trialDiv){
    $trialDiv.show();
    $trialDiv.children('.pretrialsync').show();
    var $iconList = $trialDiv.children('.pretrialsync').children();
    $iconList.css('opacity', '.1')
    showReady($($iconList[0]), 100);
    var waitTime = 100 + Math.random()*100;
    $($iconList[1]).oneTime(waitTime, function(){
      showReady($(this), 300);
      showReady($(this).next(), 400);
      waitTime += 300 + Math.random()*300;
      $(this).next().next().oneTime(waitTime, function(){
        showReady($(this), 400);
        waitTime += 400 + Math.random()*400;
        $(this).next().oneTime(waitTime, function(){
          showReady($(this), 400);
          $(this).oneTime(500, function(){
            $trialDiv.children('.pretrialsync').hide();
              Wami.startRecording(recorder_url + '?workerId=' +
                workerId +
                '&assignmentId=' + assignmentId +
                '&hitId=' + hitId +
                '&hash=' + amzhash +
                '&experiment=' + experiment +
                '&filename=' + $trialDiv.find(':button.nexttrial').attr('id'), 'onRecordStart', 'onRecordFinishUpdate', 'onError');
            $trialDiv.children('.pretrialsync').hide();
            $trialDiv.children('.fixation').show(0);
            $trialDiv.children('.fixation').oneTime(500, function(){
              $trialDiv.children('.fixation').hide();
              runTrial($trialDiv);
            });
          });
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

  var showFeedback = function($trialDiv){
    var count = 30;
    var choicefeedbacktime = 3000;
    switch ($trialDiv.children(':input.partnerfeedback').val()){
      case "Choice":
        count += 3;
        //show partner choice, green if target, red otherwise for 2 seconds, then move to post trial wait
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
        $trialDiv.children(".stimuliframe").oneTime(choicefeedbacktime, function(){
          $trialDiv.children(".stimuliframe").hide();
          $trialDiv.children(".timerbar").hide();
          $trialDiv.children(".posttrialwait").show();
        });
        break;
      case "Simple":
        //set feedback msg to say the partner picked right/wrong
        if ($trialDiv.children(':input.partnerresponse').val() == "Target"){
          $trialDiv.find(".feedbackmsg").text("Your partner picked the right word!");
        } else {
          $trialDiv.find(".feedbackmsg").text("Your partner picked the wrong word!");
        }
      case "NoFeedback":
      default:
        choicefeedbacktime = 1000
        $trialDiv.children(".timerbar").hide();
        //move to post trial wait
        $trialDiv.children(".stimuliframe").hide();
        $trialDiv.children(".posttrialwait").show();
    }

    var $nextButton = $trialDiv.find('button.nexttrial')
    if ($nextButton.parents('.practicetrial')[0] === $('.practicetrial').last()[0] || $nextButton.parents('.testtrial')[0] === $('.testtrial').last()[0]) {
      $nextButton.text('wait');
      $nextButton.siblings('.posttrialmsg').text('Trial done, one moment.');
      $nextButton.oneTime(choicefeedbacktime + 1000, "buttonTimer", function(){
        $(this).click();
      });
    } else {
      $nextButton.everyTime(1000, "buttonTimer", function(){
        if (count < 1){
          endEarly = true;
          $(this).click();
        } else {
          $(this).text(--count + '');
        }
      }, 40);
    }
  };

  var runTrial = function($trialDiv) {
    var $targetDiv = $trialDiv.find('.position1');
    var positionType = $trialDiv.children(':input.targetposition').val();
    if (positionType == 2 || positionType == 3) {
      $targetDiv = $trialDiv.find('.position2');
    } else if (positionType == 4 || positionType == 5) {
      $targetDiv = $trialDiv.find('.position3');
    }
    var previewTime = 1000;
    var timerLength = 20000;
    $trialDiv.find(".timerbar").show(0);
    $trialDiv.find(".stimuliframe").show(0);
    $trialDiv.oneTime(previewTime, "preview", function(){
      $targetDiv.css("border-color", "black");
      $targetDiv.children('.speakercue').show();
      if (parseInt($trialDiv.children(':input.partnerresponsetime').val()) == -1){
        //let timer go out then show feedback
        $trialDiv.find(".timerbar").animate({width: "0px"}, timerLength, 'linear', function(){
          showFeedback($trialDiv);
        });
      } else {
        //end timer at partnerresponsetime and then show feedback
        $trialDiv.find(".timerbar").animate({width: "0px"}, timerLength, 'linear');
        $trialDiv.oneTime(parseInt($trialDiv.children(':input.partnerresponsetime').val()), "feedbackwaittime", function(){
          $trialDiv.find('.timerbar').stop();
          showFeedback($trialDiv);
        });
      }
    });
  };

  $('button.nexttrial').on('click', function(){
    $(this).stopTime();
    $(this).stopTime("buttonTimer");
    Wami.stopRecording();
    $(this).text('wait');
    $(this).attr("disabled", "disabled");;
    //$(this).parent().hide();
    //because the stop recording function isn't called above we need to run this function
    //onRecordFinishUpdate();
  });

  document.addEventListener('keydown', function(event) {
    if(event.keyCode == 32) {
      $('button.nexttrial:visible').click();
      $('#starttest:visible').click();
    }
  });

  $('button.hiddennext').on('click', function() {
    $(this).parent().hide();
    var $nextTrial = $(this).parent().next();
    $nextTrial.show(0, function(){
      pretrial_sync_fixation_screen($nextTrial)
    });
    if ($(this).parents('.practicetrial')[0] === $('.practicetrial').last()[0]) {
      $('#practice').hide();
      $('#teststart').show();
      var count = 30;
      $('#starttest').everyTime(1000, "buttonTimer", function(){
        if (count < 1){
          endEarly = true;
          $(this).click();
        } else {
          $(this).text(--count + '');
        }
      }, 40);
    }
    if ($(this).parents('.testtrial')[0] === $('.testtrial').last()[0]) {
      $('#testing').hide();
      $('#page1').show();
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
        pretrial_sync_fixation_screen($(this).children().first());
      });
    }
  });

  $('#page1 button.next').on('click', function() {
    $('#page1 .survquest').css('color', 'black');
    var p1valid = true;
    $('#page1 .survquest').each(function() {
      var value = $(this).attr('id');
      var that = $(this);
      if ($('[name="' + value + '"]:checked')[0] === undefined) {
      $(that).css('color', 'red');
      p1valid = false;
      }
    });
    if ($('[name="q.internet.speed"]').val() != '') {
      $('#internetspeed').css('color', 'black');
      p1valid = true;
    }
    if ($('[name="q.microphone.type"]').val() != '') {
      $('#microphonetype').css('color', 'black');
      p1valid = true;
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
      $('#page3').show(function() {$('label:visible:first')[0].scrollIntoView();});
    } else {
    alert('Please answer all questions.');
    }
  });

  $('#page3 button.next').on('click', function() {
    $('#page3 .survquest').css('color', 'black');
    var p3valid = true;

    if ($('[name="q.participant.age"]').val() === '') {
      $('#age').css('color', 'red');
      p3valid = false;
    }

    if ($('[name="q.participant.education"]').val() === '') {
      $('#education').css('color', 'red');
      p3valid = false;
    }

    if ($('[name="q.participant.gender"]').val() === '' &&
      $('[name="q.participant.gender.other"]').val() === '') {
      $('#gender').css('color', 'red');
      p3valid = false;
    }

    if ($('[name="q.living_city_state"]').val() === '') {
      $('#accent').css('color', 'red');
      p3valid = false;
    }

    if (p3valid) {
      $('#page3').hide();
      $('#page4').show(function() {$('label:visible')[0].scrollIntoView()});
    } else {
      alert('Please answer all questions.');
    }
  });

  $('#page4 button#endsurvey').on('click', function() {
    $('#page4 .survquest').css('color', 'black');
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
    endEarly = true;
    $('#earlyStop').show();
  }
});

var endEarly = false;

var onRecordFinishUpdate = function() {
  clearInterval(recordInterval);
  if (endEarly){
    $('#practice').hide();
    $('#testing').hide();
    $('#earlyStop').show();
  } else {
    $('button.nexttrial:visible').parent().siblings('.hiddennext').click();
  }
  $.ajax({
    type: 'POST',
    url: '/mturk/experiments/baese-berk_goldrick_rep1',
    data: {'ItemNumber': ++itemno, 'WorkerId': workerId},
    datatype: 'json'
  }).done(function(msg) {
    if (debugmode) {
      console.log('Updated to ' + JSON.stringify(msg));
    }
  });
};
