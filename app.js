#!/usr/bin/env node
(function () {
  'use strict';

  var freqCur = 25
  var manualVolCur = 100

  var modeManual = false
  var smoothMode = true

  var connect = require('express')
    , path = require('path')
    , app = connect()
    , wivol = require('./lib/osascript-vol-ctrl')
    , baudio = require('baudio')
    , exec = require('child_process').exec
    ;

  app.use(connect.staticCache());
  app.use(connect.compress());
  app.use(connect.static(path.join(__dirname, 'public')));
  app.use(connect.urlencoded());
  app.use(connect.json());
  app.use(app.router);

  // Non-RESTful controls (via GET)

  app.get('/img/:name', function (req, res) {
    res.sendfile('img/'+name);
  });

  app.get('/style.css', function (req, res) {
    res.sendfile('style.css');
  });
  
  // READ volume level and mute state
  app.get('/controls/volume', function (req, res) {
    function respond(err, cur, muted) {
      res.send({	 
	volume: cur
      , muted: muted
      });
    }
    
    if(modeManual) {
      res.send({ volume: getManualVolCur })
    }
    else {
      wivol.get(respond);
    }
  });

  // CREATE mute (retains volume)
  app.get('/controls/mute', function (req, res) {
    function respond(err, cur, muted) {
      res.send({
        volume: cur
      , muted: muted
      });
    }
    wivol.mute(respond, 300);
  });

  // DESTROY mute (retains volume)
  app.get('/controls/unmute', function (req, res) {
    function respond(err, cur, muted) {
      res.send({
        volume: cur
      , muted: muted
      });
    }
    wivol.unmute(respond, 300);
  });

  // UPDATE volume level (stays muted or unmuted)
  app.get('/controls/volume/:volume', function (req, res) {
    function respond(err, cur, muted) {
      res.send({
	volume: cur
      , muted: muted
      });
    }
    
    if(modeManual) {
      setManualVolCur(req.params.volume)
	
      res.send({
	volume: manualVolCur
      });
    }
    else {
      wivol.fade(respond, req.params.volume, 600);
    }
  });

  // Freq
  app.get('/controls/freq/:freq', function (req, res) {
    setFreq(req.params.freq)
    
    res.send({
      freq: freqCur
    });
  });

  module.exports = app;

  if (require.main === module) {
    exec('hostname', function (err, stdout) {
      require('http').createServer(app).listen(process.argv[2] || 4040, function () {
        console.log('Visit on your phone at ');
        console.log('http://' + stdout.trim() + ':' + this.address().port + '/');
      });
    });
  }

  // BAudio
  var b = baudio()
  var previousPoints = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]
  
  function playSound() {
  	console.log("playsound()")
    b.push(function (t) {
      var p = Math.sin(t*getFreq()*(2*Math.PI))

      if(modeManual) {
	p = p*(getManualVolCur()/100)
      }

      if(smoothMode) {
	previousPoints.shift()
	previousPoints.push(p)

	var x = previousPoints.reduce(function(a, b) { return a + b }) / previousPoints.length
	return x
      }
      else {
	return p
      }
    })

    b.play()
  }
  
  function setManualVolCur(volume) {
    manualVolCur = volume
    console.log('vol = '+manualVolCur)
  }
  
  function getManualVolCur(freq) {
    //console.log(manualVolCur)
    return manualVolCur
  }

  function setFreq(freq) {
    freqCur = freq
    console.log('freq = '+freqCur)
  }
  
  function getFreq() {
    return freqCur
  }

  playSound()
}());
