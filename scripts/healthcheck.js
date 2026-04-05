(function () {
  'use strict';

  fetch('/')
    .then(function (response) {
      if (response.status === 200) {
        console.log('Healthcheck passed: / returned 200');
        return;
      }

      console.error('Healthcheck failed: / returned status ' + response.status);
    })
    .catch(function (error) {
      console.error('Healthcheck failed: request error', error);
    });
})();
