// Nomes dos dois caches usados nesta versão do service worker.
// Mude para v2, etc. quando você atualizar qualquer um dos recursos locais, o que irá
// por sua vez, acionar o evento de instalação novamente.
const PRECACHE = "precache-v1";

// Uma lista de recursos locais que sempre queremos armazenar em cache.
const PRECACHE_URLS = ["./"];

self.addEventListener("install", function (event) {
  console.log("[PWA Builder] Install Event processing");

  console.log("[PWA Builder] Skip waiting on install");
  self.skipWaiting();

  event.waitUntil(
    caches.open(PRECACHE).then(function (cache) {
      console.log("[PWA Builder] Caching pages during install");
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Allow sw to control of current page
self.addEventListener("activate", function (event) {
  console.log("[PWA Builder] Claiming clients for current page");
  event.waitUntil(self.clients.claim());
});

// O fetch handler fornece respostas para recursos de mesma origem de um cache.
// Se nenhuma resposta for encontrada, ele preenche o cache de tempo de execução com a resposta
// da rede antes de retorná-lo à página.

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
  // if (event.request.method !== "GET") return;

  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        // The response was found in the cache so we responde with it and update the entry

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view
        event.waitUntil(
          fetch(event.request).then(function (response) {
            return updateCache(event.request, response);
          })
        );

        return response;
      },
      function () {
        // The response was not found in the cache so we look for it on the server
        return fetch(event.request)
          .then(function (response) {
            // If request was success, add or update it in the cache
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch(function (error) {
            console.log(
              "[PWA Builder] Network request failed and no cache." + error
            );
          });
      }
    )
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return
  return caches.open(PRECACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(PRECACHE).then(function (cache) {
    return cache.put(request, response);
  });
}
