#!/usr/bin/env node
(function () {
  'use strict';

  var freqCur = 0

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
  
  // READ volume level and mute state
  app.get('/controls/volume', function (req, res) {
    function respond(err, cur, muted) {
      res.send({	 
        volume: cur
      , muted: muted
      });
    }
    wivol.get(respond);
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
    wivol.fade(respond, req.params.volume, 600);
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
  
  function playSound() {
    b.push(function (t) {
      var x = Math.sin(t*100*getFreq()/(2*Math.PI))
      return x
    })

    b.play()
  }

  function setFreq(freq) {
    freqCur = freq
    console.log('freq = '+freqCur)
  }
  
  function getFreq() {
    return freqCur
  }

  //playSound()
}());
