// Load scripts synchronously (but with asynchronous fetches)
// as if they were script tags in the initial head!

export default async function postLoadScripts(srcURLs) {
  // Fun with promises ahead!
  await srcURLs

  // Fetch all script sources asynchronously and concurrently
  .map(srcUrl => [srcUrl, fetch(srcUrl).then(response => response.text())])

  // Use reduce() to chain them together for synchronous loading
  .reduce(async (prevLoaded, [srcUrl, srcText]) => {

    // Create a script element and assign it the fetched source text
    const script = document.createElement("script");
    script.text = await srcText;

    // Wait for the previous script to finish loading
    // No load event is fired for inline script elements, so just wait for append
    await prevLoaded;

    // Append the new script to load it
    document.head.appendChild(script);

  // Start the chain with a resolved promise
  }, Promise.resolve());
}
