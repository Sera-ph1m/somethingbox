
const cacheName = "Tesseract";

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				"/website/",
				"/website/beepbox_editor.min.js",
				"/website/player/",
				"/website/player/beepbox_player.min.js",
				// "/2_4/",
				// "/2_4/beepbox_editor.min.js",
				// "/2_4/player/",
				// "/2_4/player/beepbox_player.min.js",
				//"/2_3/",
				//"/2_3/beepbox_editor.min.js",
				"https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js",
				"/website/samples.js",
				"/website/samples2.js",
				"/website/samples3.js",
				"/website/drumsamples.js",
				"/website/kirby_samples.js",
				"/website/wario_samples.js",
				"/website/mario_paintbox_samples.js",
				"/website/nintaribox_samples.js",
			]).then(() => self.skipWaiting());
		})
	);
});

self.addEventListener("activate", function(event) {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
	if (event.request.method != "GET") return;
	
	event.respondWith(
		caches.open(cacheName).then(function(cache) {
			return fetch(event.request).then(function(response) {
				// If this is a local resource or related to google fonts, add
				// it to the permanent cache.
				if (event.request.url.startsWith(self.location.origin) ||
					event.request.url.startsWith("https://fonts.googleapis.com") ||
					event.request.url.startsWith("https://fonts.gstatic.com") ||
					event.request.url.startsWith("https://cdn.jsdelivr.net"))
				{
					cache.put(event.request, response.clone());
				}
				return response;
			}).catch(function() {
				return cache.match(event.request);
			});
		})
	);
});
