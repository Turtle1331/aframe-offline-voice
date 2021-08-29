import {postLoadScripts, postLoadBody} from '../loader.js';

export default async function loadPage() {
  await postLoadScripts(`
    <!-- Only use on ngrok
      <script type="application/javascript" src="https://rawcdn.githack.com/ccoreilly/vosk-browser/2efebf42a159fd4129477443d8f97909f6a2bc70/examples/modern-vanilla/vosk.js"></script>
    -->
    <script src="vosk/vosk.js"></script>
    <script type="module" src="vosk/index.js"></script>
  `);

  postLoadBody(`
    <div id="background">
      <main class="center">
	<article>
	  <h1>Vosk</h1>
	  <section>
	  </section>
	    <h3>Download</h3>
	    <ul>
	      <li><a href="https://raw.githubusercontent.com/ccoreilly/vosk-browser/master/examples/react/public/models/vosk-model-small-en-us-0.15.tar.gz">Small (40M) English model</a></li>
	      <li><a href="https://alphacephei.com/vosk/models">More models</a></li>
	    </ul>
	  <section>
	    <h3>Upload</h3>
	    <form id="upload-model">
	      <ul>
		<li>
		  <label for="upload-model-file">Model file:</label>
		  <input type="file" name="model-file" required />
		</li>
		<li>
		  <label for="upload-model-name">Model name:</label>
		  <input type="text" name="model-name" required />
		</li>
		<li>
		  <button type="submit" data-model-action="upload">Upload</button>
		</li>
	      </ul>
	    </form>
	  </section>
	  <section>
	    <h3>Select</h3>
	    <form id="select-model">
	      <ul>
	      </ul>
	    </form>
	    <div id="select-model-actions">
	      <button data-model-action="rename" disabled>Rename</button>
	      <button data-model-action="delete" disabled>Delete</button>
	    </div>
	  </section>
	  <section>
	    <h3>Run</h3>
	    <button data-model-action="start" type="button" disabled>Start</button>
	    <button data-model-action="stop" type="button" disabled>Stop</button>
	  </section>
	  <section>
	    <h3>Output</h3>
	    <div id="recognition-result">
	      <span id="partial"></span>
	    </div>
	  </section>
	</article>
      </main>
    </div>
  `);
}
