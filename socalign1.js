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

    $('#voladjust').on('play', function() {this.volume = 1;});
    $('#voladjust').on('volumechange', function() {this.volume = 1;});
    $('#voladjust').on('ended', function() {this.currentTime = 0; this.pause();});

  } else {
    $('#oldBrowserMessage').show();
  }

  $('button#reset').on('click', function() {
    endEarly = false;
    $.ajax({
      type: 'POST',
      url: '/mturk/experiments/socalign1',
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
      Wami.startRecording(recorder_url + '?workerId=' +
        workerId +
        '&assignmentId=' + assignmentId +
        '&hitId=' + hitId +
        '&hash=' + amzhash +
        '&experiment=SocAlign.1' +
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
      '&experiment=SocAlign.1' +
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
      //$(':input[name="starttime"]').val(new Date().toISOString());
      $('#instructions').hide(0);
      $('#testing').show(0);
      initial_sync_screen();
    } else {
      alert('You have to allow microphone access for this experiment!');
    }
  });

  $('button#starttest').on('click', function() {
    $('#startmessage').hide();
    var $nextTrial = $($('.testtrial')[itemno]);
    console.log('Starting first trial: ' + $($('.testtrial')[itemno]).attr("id"))
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
      $('#synctimer').stopTime("synctimer");
      $('#starttest').removeAttr('disabled');
    });
  };

  var pretrial_sync_fixation_screen = function($trialDiv){
    console.log('presync screen for : ' + $trialDiv.attr("id"));
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
            console.log('finished animating icons for trial: ' + $trialDiv.attr("id"));
            $trialDiv.children('.pretrialsync').hide();
        //      Wami.startRecording(recorder_url + '?workerId=' +
        //        workerId +
        //        '&assignmentId=' + assignmentId +
        //        '&hitId=' + hitId +
        //        '&hash=' + amzhash +
        //        '&experiment=SocAlign.1' +
        //        '&filename=' + $trialDiv.find(':button.stoprecord').attr('id'), 'onRecordStart', 'onRecordFinishUpdate', 'onError');
            $trialDiv.children('.pretrialsync').hide();
            $trialDiv.children('.fixation').show(0);
            console.log('showing fixation, for trial: ' + $trialDiv.attr("id"));
            $trialDiv.children('.fixation').oneTime(500, function(){
              $trialDiv.children('.fixation').hide();
              console.log('hiding fixation, for trial: ' + $trialDiv.attr("id"));
              runTrial($trialDiv);
            });
          });
        });
      });
    });
  };

  var showFeedback = function($trialDiv){
    console.log('generating feedback for trial: ' + $trialDiv.attr("id"));
    switch ($trialDiv.children(':input.partnerfeedback').val()){
      case "Choice":
        //show partner choice, green if target, red otherwise for 2 seconds, then move to post trial wait
        $trialDiv.children(".stimuliframe").hide();
        $trialDiv.children(".timerbar").hide();
        $trialDiv.children(".posttrialwait").show();
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
        $trialDiv.children(".timerbar").hide();
        //move to post trial wait
        $trialDiv.children(".stimuliframe").hide();
        $trialDiv.children(".posttrialwait").show();
    }
    var count = 30;
    $trialDiv.find('button.nexttrial').everyTime(1000, "buttonTimer", function(){
      if (count < 1){
        endEarly = true;
        $(this).click();
      } else {
        $(this).text(--count + '');
      }
    }, 35);
  };

  var runTrial = function($trialDiv) {
    console.log('Starting trial: ' + $trialDiv.attr("id"));
    var $targetDiv = $trialDiv.find('.position1');
    var positionType = $trialDiv.children(':input.targetposition').val();
    if (positionType == 2 || positionType == 3) {
      $targetDiv = $trialDiv.find('.position2');
    } else if (positionType == 4 || positionType == 5) {
      $targetDiv = $trialDiv.find('.position3');
    }
    var previewTime = 1000;
    var timerLength = 10000;
    $trialDiv.find(".timerbar").show(0);
    $trialDiv.find(".stimuliframe").show(0);
    $trialDiv.oneTime(previewTime, "preview", function(){
      $targetDiv.css("border-color", "green");
      $targetDiv.children('.speakercue').show();
      console.log('Animating timerbar');
      if (parseInt($trialDiv.children(':input.partnerresponsetime').val()) == -1){
        //let timer go out then show feedback
        $trialDiv.find(".timerbar").animate({width: "0px"}, timerLength, 'linear', function(){
          console.log('Waited till timebar finished, showing feedback');
          showFeedback($trialDiv);
        });
      } else {
        //end timer at partnerresponsetime and then show feedback
        $trialDiv.oneTime(parseInt($trialDiv.children(':input.partnerresponsetime').val()), "feedbackwaittime", function(){
          console.log("'partner' initiated response, stopping bar, showing feedback");
          $trialDiv.find('.timerbar').stop();
          showFeedback($trialDiv);
        });
      }
    });
  };

  $('button.nexttrial').on('click', function(){
    //Wami.stopRecording();
    console.log('Next trial button hit for trial: ' + $(this).parent().parent().attr("id"))
    $(this).stopTime();
    $(this).stopTime("buttonTimer");
    $(this).parent().hide();
    //because the stop recording function isn't called above we need to run this function
    onRecordFinishUpdate();
  });

  document.addEventListener('keydown', function(event) {
    if(event.keyCode == 32) {
      $('button.nexttrial:visible').click();
    }
  });

  $('button.hiddennext').on('click', function() {
    //$(':input[name="end_' + $(this).siblings('.stoprecord').attr('id') + '"]').val(new Date().toISOString());
    $(this).parent().hide()
    var $nextTrial = $($('.testtrial')[itemno]).next();
    console.log('advancing to next trial: ' + $nextTrial.attr("id"))
    $nextTrial.show(0, function(){
      pretrial_sync_fixation_screen($nextTrial)
    });
    if ($(this).parents('.testtrial')[0] === $('.testtrial').last()[0]) {
      $('#testing').hide();
      $('#page1').show();
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
    if ($('[name="q.internet.speed"]').val() === '') {
      $('#internetspeed').css('color', 'red');
      p1valid = false;
    }
    if ($('[name="q.microphone.type"]').val() === '') {
      $('#microphonetype').css('color', 'red');
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
  //clearInterval(recordInterval);
  console.log('internally clicking hidden next button for trial: ' + $($('.testtrial')[itemno]).attr("id"));
  if (endEarly){
    $('#testing').hide();
    $('#earlyStop').show();
  } else {
    $($('.testtrial')[itemno]).find(':button.hiddennext').click();
  }
  $.ajax({
    type: 'POST',
    url: '/mturk/experiments/socalign1',
    data: {'ItemNumber': ++itemno, 'WorkerId': workerId},
    datatype: 'json'
  }).done(function(msg) {
    if (debugmode) {
      console.log('Updated to ' + JSON.stringify(msg));
    }
  });
};
