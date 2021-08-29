const CACHE = 'model-cache';

modelI2U = modelId => `/models/${modelId}`;
modelU2I = modelUrl => modelUrl.split(`/models/`)[1];

const modelCache = {
    list: function() {
	console.log('list');
	return this.keys().then(requests =>
	    Promise.all(requests.map(request => 
		this.match(request).then(response => 
		    [modelU2I(request.url), atob(response.headers.get('x-model-name'))]))
	    ).then(Object.fromEntries));
    },
    create: async function(modelName, blobUrl) {
	console.log('add', modelName, blobUrl);
	if (modelName == null || blobUrl == null) return;

	const requests = await this.keys().then(requests =>
	    Object.fromEntries(requests.map(request => 
		[modelU2I(request.url), request])));

	let modelId = -1;
	while (++modelId in requests);
	const modelUrl = modelI2U(modelId);

	await fetch(blobUrl).then(blobResponse => {
	    const headers = new Headers();
	    headers.append('x-model-name', btoa(modelName));

	    const response = new Response(blobResponse.body, {headers: headers});

	    // https://stackoverflow.com/a/57382543
	    Object.defineProperty(response, 'url', {value: modelUrl});

	    return this.put(modelUrl, response);
	});
	return modelId;
    },
    delete: async function(modelId) {
	console.log('delete', modelId);
	if (modelId == null) return false;

	const requests = await this.keys().then(requests =>
	    Object.fromEntries(requests.map(request => 
		[modelU2I(request.url), request])));

	const modelUrl = modelI2U(modelId);
	const request = requests[modelId];
	return request ? await this.delete(request) : false;
    },
    rename: async function(modelId, newModelName) {
	console.log('rename', modelId, newModelName);
	if (modelId == null || newModelName == null) return false;

	const requests = await this.keys().then(requests =>
	    Object.fromEntries(requests.map(request => 
		[modelU2I(request.url), request])));

	const modelUrl = modelI2U(modelId);
	const request = requests[modelId];
	const oldResponse = await this.match(request);

	const deleted = request ? await this.delete(request) : false;
	if (!deleted) return false;

	const headers = new Headers();
	headers.append('x-model-name', btoa(newModelName));

	const response = new Response(oldResponse.body, {headers: headers});

	// https://stackoverflow.com/a/57382543
	Object.defineProperty(response, 'url', {value: modelUrl});

	await this.put(modelUrl, response);
	return true;
    },
    load: async function(modelId) {
	console.log('load', modelId);

	const requests = await this.keys().then(requests =>
	    Object.fromEntries(requests.map(request => 
		[modelU2I(request.url), request])));

	return this.match(requests[modelId]);
	//.then(x => console.log('loader', x) || x);
    },
};

// Activate immediately
self.addEventListener('install', () => {
    console.log('install');
    self.skipWaiting();
});

// Take control of clients immediately
self.addEventListener('activate', event => {
    console.log('activate');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    console.log('fetch', event.request.url);

    if (event.request.url.includes('/model-cache')) {
	// Use a REST-like API
	const args = [...new URLSearchParams(event.request.url.split('/model-cache')[1]).values()];
	const method = args.shift();

	// Dispatch to modelCache (using cache as `this`)
	if (method in modelCache) {
	    // event.respondWith() is synchronous but can take a promise
	    // caches.open() is asynchronous
	    event.respondWith(caches.open(CACHE).then(async cache => {
		let result = await modelCache[method].apply(cache, args);

		// Respond with result
		if (!(result instanceof Response)) {
		    result = new Response(JSON.stringify(result ?? null));
		}

		// Remember, this is all wrapped in event.respondWith()
		return result;
	    }));
	} else {
	    console.error(`method '${method}' not defined in modelCache`);
	}
    }
});

self.addEventListener('message', event => {
  self.clients.matchAll().then(clients => clients.forEach(
    client => client.postMessage(event.data)
  ))
});
