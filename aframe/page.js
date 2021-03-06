import {postLoadScripts, postLoadBody} from '../loader.js';

export default async function loadPage() {
  await postLoadScripts(`
    <!-- CDN links in case you're serving over a limited connection
      <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
      <script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
    -->
    <script src="libs/aframe-1.2.0.min.js"></script>
    <script src="libs/Tone-14.7.77.js"></script>
    <!-- TODO figure out why this won't work as a module -->
    <script src="aframe/index.js"></script>
  `);

  //await new Promise(resolve => setTimeout(resolve, 1000));

  postLoadBody(`
    <a-scene>
      <a-assets>
	//
	<a-mixin id="console-outer" geometry="primitive: plane; width: 2; height: 1.3" material="color: #000000"></a-mixin>
	<a-mixin id="console-inner" position="-0.975 0.625 0" text="baseline: top; anchor: align; width: 1.95; height: 0.95; font: sourcecodepro; wrapCount: 80; color: #00ff00" console></a-mixin>
      </a-assets>

      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-entity mixin="console-outer" position="4 1.5 0" rotation="0 -90 0" scale="2 2 2">
	<a-entity mixin="console-inner"></a-entity>
      </a-entity>

      <!-- Workaround for https://github.com/aframevr/aframe/issues/4752 -->
      <!-- Make sure the sky is last -->
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  `);
}
