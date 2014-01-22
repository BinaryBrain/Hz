Hz
===

Hz is an app that generates a sine wave and allow you to remotly control its volume and its frequency through HTTP requests.  
The remote control is a Web App made for iPad.

<img src="https://raw.github.com/BinaryBrain/Hz/master/doc-img/placeit.png" alt="screenshot">

Dependencies
===

To run this program, you will need:

- [Node.js](http://nodejs.org#download)

- [SoX](http://sox.sourceforge.net/)

Installation & Usage
===

1. Start the program with `node app.js` or `app.js`

2. Type the `http://<your-computer-local-ip>:4040/` whatever onto your iPad's browser

3. The left column changes the volume and the right one the frequency

4. You can also add the Web App to your home screen to get it fullscreen

<img src="https://raw.github.com/BinaryBrain/Hz/master/doc-img/add-home.png" alt="screenshot"">


API
===

If you want to develop another web app, here is HTTP requests you can send to the server:

Change the volume

```
http://<your-computer-local-ip>:4040/controls/volume/<volume>
```

Change the frequency

```
http://<your-computer-local-ip>:4040/controls/freq/<frequency>
```

<img src="https://raw.github.com/BinaryBrain/Hz/master/doc-img/placeit2.png" alt="screenshot">
