/* self.addEventListener('fetch', event => {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          return response;
        })
        .catch(() => {
          return new Response('No internet connection. Please check your network.', {
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  }); */
  