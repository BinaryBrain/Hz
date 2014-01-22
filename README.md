Hz
===

Hz is an app that generate a sine wave and allow you to remotly control its volume and its frequency through HTTP requests.  
The remote control is a Web App made for iPad.

<img src="https://raw.github.com/BinaryBrain/Hz/master/doc-img/placeit.png" alt="screenshot">

Installation & Usage
===

1. Get [Node.js](http://nodejs.org#download)

2. Get [SoX](http://sox.sourceforge.net/)

3. Start the program with `node app.js` or `app.js`

3. Type the `http://<your-computer-local-ip>:4040/` whatever onto your iPad's browser

4. The left column changes the volume and the right one the frequency

5. You can also add the Web App to your home screen to get it fullscreen

<img src="https://raw.github.com/BinaryBrain/Hz/master/doc-img/add-home.png" alt="screenshot">


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
