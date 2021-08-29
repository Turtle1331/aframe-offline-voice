# Aframe offline voice

### About

The purpose of this project is to explore interacting with VR content through
voice interaction, particularly for mobile VR use cases such as Google
Cardboard headsets.

This experiment combines a few different technologies:
- [Aframe](https://aframe.io), an ECS framework using Three.js for creating VR
  and XR content for the web
- [Vosk](https://alphacephei.com/vosk), an offline speech recognition toolkit
  supporting Kaldi models, [compiled](https://github.com/ccoreilly/vosk-browser) to WebAssembly using Emscripten
- To be continued, depending on choice of output (musical sounds with
  [Tone.js](https://tonejs.github.io)? ML models for intent recognition/text
  generation/synthesized speech?)



### Try it now

You can try it online at
[https://turtle1331.github.io/aframe-offline-voice](https://turtle1331.github.io/aframe-offline-voice).
Note that it only supports fairly recent browsers.



### Usage

TL:DR; Follow the page headers: download a model, upload it locally, select it,
run it, grant permissions, and go.

First, download a voice model from one of the available links. You only need to
do this once. It may take a couple minutes depending on your internet connection
and the size of the model. For now, only the 40M English model has been tested.

Next, upload the model file from your local computer, give it a name, and click
Upload. You only need to do this once unless you clear your browser's cache. You
can add, rename, and delete models as you like. They're all stored locally in
your browser using the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache).

Then, select an uploaded model and click Start. Once the model loads, the page
should prompt you for microphone access. This is required for the demo to work.
Rest assured, the page will not transmit any of your voice data remotely. It's
all processed in audio worklets and web workers running locally in your browser.

Once you grant microphone access, you should be taken to an Aframe VR scene. It
may prompt you to access your device's motion data or to start presenting in VR.
Accepting these prompts allows you to explore the scene in VR. Otherwise, you can
still navigate the scene using WASD and mouse controls.

Congratulations! You're in! The page should be able to (more or less) recognize
your spoken words and act on them within the VR world. For now, they're just
displayed on a text panel, but soon, you'll be able to issue commands to
move around and/or manipulate objects in the virtual world.



### Running locally

Clone the repo, enter the directory, and start up an HTTP server of your choice:
```bash
git clone https://github.com/Turtle1331/aframe-offline-voice.git
cd aframe-offline-voice
python3 -m http.server  # Starts on port 8000 by default, can change with -p PORT
# Open a browser and go to http://localhost:8000
```

If you want to use it on a mobile/separate device (not `localhost`), you will need an HTTPS tunnel like `ngrok`.



### License

- This project is licensed under the GNU General Public License v3.0 or later.
  See [LICENSE](./LICENSE) for details.
- [Aframe](https://aframe.io) is licensed under the [MIT License](https://github.com/aframevr/aframe).
- [The Vosk API](https://alphacephei.com/vosk) and
  [vosk-browser](https://github.com/ccoreilly/vosk-browser) are licensed under
  the [Apache-2.0](https://github.com/alphacep/vosk-api/blob/master/COPYING)
  [License](https://github.com/ccoreilly/vosk-browser/blob/master/COPYING).
- [Tone.js](https://github.com/Tonejs/Tone.js) is licensed under the
  [MIT License](https://github.com/Tonejs/Tone.js/blob/dev/LICENSE.md).
