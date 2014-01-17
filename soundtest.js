var baudio = require('baudio')
var controller = require('osx-wifi-volume-remote')

console.log(controller)

// All callbacks have the same arguments
controller.get(function (err, volume, muted) {
	console.log('Volume is set to ' + volume + '% and is ' + (muted ? '' : 'not ') + 'muted')
})

console.log(controller.emitter)
controller.emitter.addListener('new freq', function () {console.log("-----------------")})
console.log(controller.emitter)

controller.emitter.on('new freq', function () {console.log("AAAAAAAAAAAA")})

// 'new freq'

var n = 0
var b = baudio(function (t) {
    var x = Math.sin(t*100*200/(2*Math.PI))
    return x
})
b.play()