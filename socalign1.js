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

  $('button#resume').on('click', function() {
    if (typeof(Wami.startRecording) === 'function') {
      $('#reloadResume').hide();
      if (itemno == $('.testtrial').length) {
        $('#page1').show();
      } else {
        $('#testing').show(0, partner_sync_screen());
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

  var partner_sync_screen = function(){
      $('#startmessage').show();
      $('#partnersyncstatus').text("Waiting for next available partner");
      $('#partnersyncstatus').oneTime(11520, function(){
        $(this).text("Found partner, syncing software with eachother");
        $(this).oneTime(9250, function(){
          $(this).text("Synced! Partner is ready, click start");
          $('#syncicon').hide();
          $('#starttest').removeAttr("disabled");
          });
      });
  };

  $('button#endinstr').on('click', function() {
    if (Wami.getSettings().microphone.granted) {
      $('object').attr('height', 0);
      $('object').attr('width', 0);
      //$(':input[name="starttime"]').val(new Date().toISOString());
      $('#instructions').hide();
      $('#testing').show(0, partner_sync_screen());
    } else {
      alert('You have to allow microphone access for this experiment!');
    }
  });

  $('button#starttest').on('click', function() {
    $('#startmessage').hide();
    var $nextTrial = $($('.testtrial')[itemno]);
    $nextTrial.show(runTrial($nextTrial));
  });

  $('.stoprecord').on('click', function() {
    Wami.stopRecording();
  });

  var trialTimeOut = function($trialDiv){
      $trialDiv.children(".stimuliframe").hide();
      $trialDiv.children(".feedback").show()
      $trialDiv.oneTime(2000, function(){
        $trialDiv.hide().children("button.stoprecord").click();
      });
  };

  var partnerResponseMade = function($trialDiv){
      $trialDiv.children('.timerbar').stop();
      $trialDiv.children(".stimuliframe").hide();
      if ($trialDiv.children(':input.partnerfeedback').val() == "Correct"){
        $trialDiv.find(".feedbackmsg").text("Your partner picked the right word!");
      } else {
        $trialDiv.find(".feedbackmsg").text("Your partner picked the wrong word! :(");
      }
      $trialDiv.children(".feedback").show();
      $trialDiv.oneTime(2000, function(){
        $trialDiv.hide().children("button.stoprecord").click();
      });
  };

  var runTrial = function($trialDiv) {
    ///lets do this shit
    Wami.startRecording(recorder_url + '?workerId=' +
      workerId +
      '&assignmentId=' + assignmentId +
      '&hitId=' + hitId +
      '&hash=' + amzhash +
      '&experiment=SocAlign.1' +
      '&filename=' + $trialDiv.children(':button.stoprecord').attr('id'), 'onRecordStart', 'onRecordFinishUpdate', 'onError');
    var $targetPosition = $trialDiv.find('.position1');
    if ($trialDiv.children(':input.targetposition').val() == 2 || $trialDiv.children(':input.targetposition').val() == 3) {
      $targetPosition = $trialDiv.find('.position2');
    } else if ($trialDiv.children(':input.targetposition').val() == 4 || $trialDiv.children(':input.targetposition').val() == 5) {
      $targetPosition = $trialDiv.find('.position3');
    }
    $trialDiv.oneTime(1000, function(){
      $targetPosition.css("border-color", "red");
      $trialDiv.find(".timerbar").animate({width: "0px"}, 10000, 'linear');
      switch ($trialDiv.children(':input.partnerfeedback').val()){
        case "Correct":
        case "Wrong":
          $trialDiv.oneTime(parseInt($trialDiv.children(':input.partnerresponsetime').val()), function(){
            partnerResponseMade($trialDiv);
          });
          break;
        case "TimeOut":
          $trialDiv.oneTime(10000, function(){
            trialTimeOut($trialDiv);
          });
        default:
          $trialDiv.oneTime(10000, function(){
            trialTimeOut($trialDiv);
          });
          break;
      }
    });
  };

  $('button.hiddennext').on('click', function() {
    //$(':input[name="end_' + $(this).siblings('.stoprecord').attr('id') + '"]').val(new Date().toISOString());
    var $nextTrial = $(this).parent().hide().next();
    $nextTrial.show(runTrial($nextTrial));
    if ($(this).parents('.testtrial')[0] === $('.testtrial').last()[0]) {
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
    $('#reloadResume').show();
  }
});

var onRecordFinishUpdate = function() {
  clearInterval(recordInterval);
  $($('.testtrial')[itemno]).find(':button.hiddennext').click();
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
