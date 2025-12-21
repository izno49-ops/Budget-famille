// 1. Changez ce numéro (v1, v2, v3...) à chaque fois que vous modifiez index.html
const CACHE_NAME = 'budget-sync-v6'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn-icons-png.flaticon.com/512/781/781760.png'
];

// Installation : Mise en cache des fichiers essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Mise en cache des actifs');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force le SW à devenir actif immédiatement sans attendre la fermeture de l'app
  self.skipWaiting();
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Nettoyage ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Permet au SW de prendre le contrôle des pages immédiatement
  return self.clients.claim();
});

// Stratégie : Network First (Priorité Réseau)
// On cherche sur le web, si ça échoue (hors-ligne), on prend le cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // On clone la réponse pour mettre à jour le cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
