const CACHE_NAME =
  "aqila-v03";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css?v=03",
  "./script.js?v=03",
  "./icon.png"
];

self.skipWaiting();

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(CACHE_NAME)
        .then(cache => {

          return cache.addAll(
            urlsToCache
          );
        })
    );
  }
);

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys().then(keys => {

        return Promise.all(

          keys.map(key => {

            if (
              key !== CACHE_NAME
            ) {

              return caches.delete(
                key
              );
            }
          })
        );
      })
    );

    self.clients.claim();
  }
);

self.addEventListener(
  "fetch",
  event => {

    event.respondWith(

      caches.match(event.request)
        .then(response => {

          return (
            response ||
            fetch(event.request)
          );
        })
    );
  }
);