window.jQuery(function () {
  'use strict';

  var $ = window.jQuery
    , events = $('body')
    , volume
    ;

  events.on('change', '.js-volume', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var val = $(this).val()
      ;

    $('.js-volume').val(val);

    // debounce
    if (this.sliderTimeour) clearTimeout(this.sliderTimeour);
    this.sliderTimeour = setTimeout(function(){
      $.get('/controls/volume/' + val, function (data) {
        volume = data.volume;
        $('.js-volume').val(data.volume);
      });
    }, 500);
  });

  events.on('click', '.js-volume-up', function (ev) {
    var val = volume + 2
      ;

    ev.preventDefault();
    ev.stopPropagation();

    $('.js-volume').val(val);

    $.get('/controls/volume/' + val, function (data) {
      volume = data.volume;
      $('.js-volume').val(data.volume);
    });
  });

  events.on('click', '.js-volume-down', function (ev) {
    var val = volume - 2
      ;

    ev.preventDefault();
    ev.stopPropagation();

    $('.js-volume').val(val);

    $.get('/controls/volume/' + val, function (data) {
      volume = data.volume;
      $('.js-volume').val(data.volume);
    });
  });

  events.on('click', '.js-mute', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    $.get('/controls/mute/', function () {
      $('.js-mute').hide();
      $('.js-unmute').show();
    });
  });
  events.on('click', '.js-unmute', function (ev) {

    ev.preventDefault();
    ev.stopPropagation();

    $.get('/controls/unmute', function () {
      $('.js-mute').show();
      $('.js-unmute').hide();
    });
  });

  events.on('click', '.js-quickset', function (ev) {
    var val = $(this).text()
      , now = Date.now()
      ;

    ev.preventDefault();
    ev.stopPropagation();

    $.get('/controls/volume/' + val, function (data) {
      console.log('Changed volume in ' + (Date.now() - now) + 'ms');
      volume = data.volume;
      $('.js-volume').val(data.volume);
    });
  });

  events.on('click', '.js-refresh', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    getVolume();
  });

  // Initialize
  function getVolume() {
    $.get('/controls/volume', function (data) {
      volume = data.volume;
      $('.js-volume').val(data.volume);

      if (data.muted) {
        $('.js-mute').hide();
        $('.js-unmute').show();
      } else {
        $('.js-unmute').hide();
        $('.js-mute').show();
      }
    });
  }

  /* My code, now! */
  var VOL_MIN_VALUE = 0;
  var VOL_MAX_VALUE = 100;
  var VOL_MIN_POS = 0;
  var VOL_MAX_POS = -840;

  var FREQ_MIN_VALUE = 20;
  var FREQ_MAX_VALUE = 30;
  var FREQ_MIN_POS = 835;
  var FREQ_MAX_POS = -140;

  function pxToUnit_helper(px, posMin, posMax, valMin, valMax) {
    var posDiff = (posMax - posMin)
    var valDiff = (valMax - valMin)
    var factor = valDiff/posDiff
    
    px = px-posMin
    px = px*factor
    px = px+valMin
    return px
  }

  function volPixelsToUnit(px) {
    return pxToUnit_helper(px, VOL_MIN_POS, VOL_MAX_POS, VOL_MIN_VALUE, VOL_MAX_VALUE)
  }
  
  function freqPixelsToUnit(px) {
    return pxToUnit_helper(px, FREQ_MIN_POS, FREQ_MAX_POS, FREQ_MIN_VALUE, FREQ_MAX_VALUE)
  }

  var isMouseDown = false
  var isMouseDownPos = 0
  var active = ''

  var leftEl = document.getElementById('left');
  leftEl.addEventListener("touchstart", handleStartLeft, false);
  leftEl.addEventListener("touchmove", handleMove, false);

  var rightEl = document.getElementById('right');
  rightEl.addEventListener("touchstart", handleStartRight, false);
  rightEl.addEventListener("touchmove", handleMove, false);

  // left down
  $('#left').mousedown(function (e) {
    isMouseDown = true
    active = 'volume'
    isMouseDownPos = e.offsetY
    e.preventDefault()
  })

  function handleStartLeft(e) {
    isMouseDown = true
    active = 'volume'
    isMouseDownPos = e.changedTouches[0].pageY
    e.preventDefault()
  }

  // right down
  $('#right').mousedown(function (e) {
    isMouseDown = true
    active = 'freq'
    isMouseDownPos = e.offsetY
    e.preventDefault()
  })

  function handleStartRight(e) {
    isMouseDown = true
    active = 'freq'
    isMouseDownPos = e.changedTouches[0].pageY
    e.preventDefault()
  }

  // left, right up
  $('#left, #right').mouseup(function (e) {
    isMouseDown = false
    active = ''
    e.preventDefault()
  })

  $('#left, #right').on('touchend', function (e) {
    isMouseDown = false
    active = ''
    e.preventDefault()
  })

  // move
  $('#left, #right').mousemove(function (e) {
    onMove(e)
  })
  
  function handleMove(e) {
    e.offsetY = e.changedTouches[0].pageY
    e.offsetX = e.changedTouches[0].pageX
    onMove(e)
  }

  function onMove(e) {
    if(isMouseDown) {
      var diffY = e.offsetY - isMouseDownPos
      isMouseDownPos = e.offsetY
      
      if(active === 'volume') {
	var newTop = $('#volume').position().top + diffY
	
	newTop = Math.max(newTop, VOL_MAX_POS)
	newTop = Math.min(newTop, VOL_MIN_POS)
	
	$('#volume').css({ top: newTop + 'px' })

	changeVolumeFromPos(newTop)
      }
      else if(active === 'freq') {
	var newTop = $('#freq').position().top + diffY
	
	newTop = Math.max(newTop, FREQ_MAX_POS)
	newTop = Math.min(newTop, FREQ_MIN_POS)
	
	$('#freq').css({ top: newTop + 'px' })
	
	changeFreqFromPos(newTop)
      }
      
      e.preventDefault()
    }
  }
  
  function changeVolumeFromPos(px) {
    var unit = volPixelsToUnit(px)
    $.get('/controls/volume/'+unit)
  }

  function changeFreqFromPos(px) {
    var unit = freqPixelsToUnit(px)
    $.get('/controls/freq/'+unit)
  }
});
