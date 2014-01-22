#!/usr/bin/env node
(function () {
  'use strict';

  var freqCur = 25
  var manualVolCur = 100

  var modeManual = false
  var smoothMode = true

  var connect = require('express')
    , os = require('os')
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

  function getIP() {
    var ifaces = os.networkInterfaces();
    var ip = '???'
    
    for (var dev in ifaces) {
      var alias = 0;
      ifaces[dev].forEach(function (details) {
	if (details.family == 'IPv4') {
	  if(details.address != '127.0.0.1')
	    ip = details.address;
	  ++alias;
	}
      });
    }

    return ip
  }

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
        console.log('----------------------------');
        console.log('Visit your iPad at:');
        console.log('http://' + getIP() + ':' + this.address().port + '/');
        console.log('----------------------------');
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

    playSox(getFreq())

    //b.play()
  }
  
  function setManualVolCur(volume) {
    manualVolCur = volume
    console.log('vol = '+manualVolCur)
  }
  
  function getManualVolCur(freq) {
    return manualVolCur
  }

  function setFreq(freq) {
    freqCur = freq
    console.log('freq = '+freqCur)
    changeFreq(freq)
  }
  
  function getFreq() {
    return freqCur
  }

  playSound()

  var soxChild
  function playSox(freq) {
    console.log(freq)
    soxChild = exec('play "|sox -n -p synth 10000 sine '+freq+'" stat',
    function (error, stdout, stderr) {
      if (error !== null) {
	//console.log('exec error: ' + error);
      }
    });
  }

  function changeFreq(freq) {
    soxChild.kill()
    console.log(soxChild.pid)
    exec('killall play', function (error, stdout, stderr) {
      if (error !== null) {
	//console.log('exec error: ' + error);
      }
      setTimeout(function () { playSox(freq) }, 500)
    })
  }
}());
