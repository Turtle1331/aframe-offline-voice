'use strict';

const AFRAME = window.AFRAME;

AFRAME.registerComponent('console', {
  init: function() {
    this.buffer = '';
  },
  play: function() {
    this.el.sceneEl.addEventListener('log', event => {
      if (!event.detail) return;

      let message = event.detail.message;
      if (typeof message !== 'string') {
	message = JSON.stringify(message);
      }
      this.buffer += message;

      this.el.setAttribute('text', {value: this.buffer});
    });
  },
  tick: function() {
    // Workaround for https://github.com/aframevr/aframe/issues/4752
    // Update the geometry every frame so it renders
    if (this.el.components.text) {
      const _this = this.el.components.text;
      try {
      _this.updateGeometry(_this.geometry, _this.currentFont);
      } catch (e) {

      }
    }
  },
});

(() => {
  navigator.serviceWorker.ready.then(() => {
    navigator.serviceWorker.addEventListener('message', event => {
      document.querySelector('a-scene').emit('log', {message: `${event.data.text} `}, false);
    });
  });
  return;

  let synth;
  document.addEventListener('click', () => {
    if (!synth) {
      synth = new Tone.Synth().toDestination();
    }
  });

  let value = 'hi 0';
  let i = 0;
  const loop_id = setInterval(() => {
    value += `\nhi ${++i}`
    document.querySelector('a-scene').emit('log', {message: value}, false);
    if (i == 23) {
      //clearInterval(loop_id);
      [value, i] = ['hi 0', 0];
      if (synth) synth.triggerAttackRelease("C4", "8n");
    }
  }, 100);
})();
