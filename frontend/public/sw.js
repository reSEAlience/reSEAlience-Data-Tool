const CACHE_NAME = "resealience-offline-v1";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const scope = self.registration.scope;
    const appUrl = new URL("index.html", scope).href;
    const dataUrl = new URL("data/regionVI.json", scope).href;
    const manifestUrl = new URL("manifest.json", scope).href;
    const manifestResponse = await fetch(manifestUrl);

    if (!manifestResponse.ok) {
      throw new Error(`Could not load offline asset manifest (${manifestResponse.status}).`);
    }

    const manifest = await manifestResponse.clone().json();
    const assets = new Set([appUrl, dataUrl]);

    for (const entry of Object.values(manifest)) {
      if (entry.file) assets.add(new URL(entry.file, scope).href);
      for (const path of [...(entry.css || []), ...(entry.assets || [])]) {
        assets.add(new URL(path, scope).href);
      }
    }

    await cache.addAll([...assets]);
    await cache.put(manifestUrl, manifestResponse);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("resealience-offline-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cachedPage = await caches.match(request, { ignoreVary: true });
        return cachedPage || caches.match(
          new URL("index.html", self.registration.scope),
          { ignoreVary: true }
        );
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreVary: true });
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
