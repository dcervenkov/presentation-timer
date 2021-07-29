
if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
  let wakeLock = null;
  const statusDiv = document.querySelector('#statusDiv');

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', (e) => {
        console.log(e);
        statusDiv.textContent = 'Wake lock was released';
        console.log('Wake lock was released');
      });
      statusDiv.textContent = 'Wake lock is active; the screen saver will not turn on.';
      console.log('Wake lock is active');
    } catch (e) {
      statusDiv.textContent = `${e.name}, ${e.message}`;
      console.error(`${e.name}, ${e.message}`);
    }
  };

  const handleVisibilityChange = () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      requestWakeLock();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  document.addEventListener('fullscreenchange', handleVisibilityChange);
  requestWakeLock();
} else {
  statusDiv.textContent = 'Wake lock API not supported; the screen saver will turn on.';
  console.error('Wake lock API not supported.');
}

