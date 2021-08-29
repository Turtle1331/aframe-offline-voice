// Load scripts synchronously (but with asynchronous fetches)
// as if they were script tags in the initial head!

const jsScriptTypes = new Set(['', 'text/javascript', 'application/javascript', 'module']);

export async function postLoadScripts(html) {
  // Create the elements on a dummy node
  const dummy = document.createElement('div');
  dummy.insertAdjacentHTML('afterbegin', html);
  
  // Fun with promises ahead!
  await

  // Read out the script properties so they can be recreated
  [...dummy.querySelectorAll('script')].map(script => ({
    type: script.type,
    src: script.src,
    text: script.text,
  }))

  // Fetch all script sources asynchronously and concurrently
  .map(script => {
    // Ignore the inline text in favor of src if it's a JS script
    if (script.src != null && jsScriptTypes.has(script.type)) {

      // Note: no await on the fetch here, not until reduce()
      script.text = fetch(script.src)

      // If the script loads, replace the text, otherwise clear it
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          console.error(`HTTP error ${response.status} when loading script '${script.src}'`);
        }
      })

      // A network error on one script doesn't stop the others
      .catch(e => {
        console.error(`Network error when loading script '${srcURL}':`, e);
      });
    }
    return script;
  })

  // Use reduce() to chain them together for synchronous loading
  .reduce(async (prevLoaded, script) => {

    // Create a script element and assign it the fetched source text
    const el = document.createElement("script");
    el.type = script.type;
    el.text = await script.text;

    // Wait for the previous script to finish loading
    await prevLoaded;

    // Append the new script to load it
    document.head.appendChild(el);

  // Start the chain with a resolved promise
  }, Promise.resolve());
}



export function postLoadBody(html) {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.lastChild);
  }
  document.body.insertAdjacentHTML('afterbegin', html);
}
