import loadAframePage from '../aframe/page.js';

let buttons;

navigator.serviceWorker.register('/service-worker.js', {scope: '/'});

const cacheReady = navigator.serviceWorker.controller || new Promise(async resolve => {
  // Wait for the service worker to start activating
  await navigator.serviceWorker.ready;
  navigator.serviceWorker.addEventListener('controllerchange', () => resolve());
});

function buildCacheUrl(...args) {
  const searchParams = new URLSearchParams(args.map(x => ['arg', x])).toString();
  return `/vosk/model-cache?${searchParams}`;

}

async function callCache(...args) {
  await cacheReady;

  const raw = args[0] === 'load';
  const url = buildCacheUrl(...args);

  return fetch(url).then(
    response => raw ? response : response.json()
  );
};

async function updateModelList() {
  const form = document.querySelector('#select-model');
  const selected = form.querySelector('input[name="model-id"]:checked');

  const models = await callCache('list');

  const list = document.createElement('ul');
  Object.entries(models).forEach(([modelId, modelName]) => {
    const htmlId = `model-${btoa(modelId)}`;

    const item = document.createElement('li');

    const radio = document.createElement('input');
    radio.name = 'model-id';
    radio.type = 'radio';
    radio.id = htmlId;
    radio.value = modelId;
    item.appendChild(radio);

    const label = document.createElement('label');
    label.htmlFor = htmlId;
    label.textContent = modelName;
    item.appendChild(label);

    list.appendChild(item);
  });

  if (selected) {
    const newSelected = list.querySelector(`[id=${JSON.stringify(selected.id)}]`);
    if (newSelected) newSelected.checked = true;
  }

  const oldList = form.querySelector('ul');
  form.replaceChild(list, oldList);
}

function updateModelButtons() {
  const form = document.querySelector('#select-model');

  const modelReady = form.querySelector('input:checked');
  const renaming = document.querySelector('#rename-input');

  buttons.rename.disabled = !(modelReady && !renaming);
  buttons.delete.disabled = !(modelReady && !renaming);
  buttons.start.disabled = !(modelReady && !renaming);
  buttons.stop.disabled = !(modelReady && !renaming);
}

async function updateUI() {
  await updateModelList();
  updateModelButtons();
}

const actions = {
  upload: async function(event) {
    // Don't refresh the page on submit
    event.preventDefault();

    const form = document.querySelector("#upload-model");
    const data = new FormData(form);

    if (form.reportValidity()) {
      const blobUrl = URL.createObjectURL(data.get('model-file'));
      const modelName = data.get('model-name');

      buttons.upload.disabled = true;
      const modelId = await callCache('create', modelName, blobUrl).catch(() => {});
      if (modelId != null) {
        form.reset();
      }
      buttons.upload.disabled = false;
    }

    updateUI();
  },
  rename: async function() {
    const form = document.querySelector('#select-model');
    const selected = form.querySelector('input[name="model-id"]:checked');

    if (selected == null) {
      console.error('cannot rename: no model selected');
      return;
    }

    const row = selected.parentElement;
    const label = selected.nextSibling;

    const modelId = selected.value;
    const oldModelName = label.textContent;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'rename-input';
    nameInput.value = oldModelName;

    nameInput.addEventListener('keypress', async event => {
      if (event.code !== 'Enter') return;

      event.preventDefault();

      const newModelName = nameInput.value;
      if (!newModelName) {
        row.replaceChild(label, nameInput);
        updateModelButtons();
        return;
      }

      
      const success = await callCache('rename', modelId, newModelName);
      if (success) {
        updateUI();
      } else {
        console.error('rename failed');
        updateModelButtons();
      }
      return success;
    });

    row.replaceChild(nameInput, label);
    updateModelButtons();
    nameInput.focus();
  },
  delete: async function() {
    const modelId = new FormData(document.querySelector("#select-model")).get('model-id');
    if (modelId == null) {
      console.error('cannot delete: no model selected');
      return;
    }

    const success = await callCache('delete', modelId);
    success ? updateUI() : console.error('delete failed');
    return success;
  },
  start: async function() {
    //const resultsContainer = document.querySelector('#recognition-result');
    const partialContainer = document.querySelector('#partial');

    partialContainer.textContent = "Loading...";


    const modelId = new FormData(document.querySelector("#select-model")).get('model-id');
    const modelUrl = buildCacheUrl('load', modelId);
    
    const channel = new MessageChannel();
    const model = await Vosk.createModel(modelUrl);
    model.registerPort(channel.port1);

    const sampleRate = 44100;
    
    const recognizer = new model.KaldiRecognizer(sampleRate);

    recognizer.on("result", (message) => {
      const result = message.result;
      //console.log(JSON.stringify(result, null, 2));
      navigator.serviceWorker.ready.then(registration => {
	registration.active.postMessage(result);
      });
      
      //const newSpan = document.createElement('span');
      //newSpan.textContent = `${result.text} `;
      //resultsContainer.insertBefore(newSpan, partialContainer);
    });
    /*
    recognizer.on("partialresult", (message) => {
      const partial = message.result.partial;
      //console.log(JSON.stringify(message.result, null, 2));

      //partialContainer.textContent = partial;
    });
    */
    
    partialContainer.textContent = "Ready";
    
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate
      },
    });
    
    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('recognizer-processor.js')
    const recognizerProcessor = new AudioWorkletNode(audioContext, 'recognizer-processor', { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 });
    recognizerProcessor.port.postMessage({action: 'init', recognizerId: recognizer.id}, [ channel.port2 ])
    recognizerProcessor.connect(audioContext.destination);
    
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(recognizerProcessor);

    buttons.stop.addEventListener('click', () => {
      model.terminate();
      audioContext.suspend();
    });

    loadAframePage();
  },
};

(() => {
  updateUI();

  buttons = Object.fromEntries(
    [...document.querySelectorAll('[data-model-action]')].map(btn => {
      const name = btn.dataset.modelAction;
      btn.addEventListener("click", actions[name]);
      return [name, btn];
    })
  );

  document.querySelector('#select-model').addEventListener('click', () => updateModelButtons());
})();
