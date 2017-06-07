/**
 * Main timer 'class'.
 *
 * @param {element} elem The web page element to which to add the timer.
 */
function Timer(elem) {
  let timer = createTimer();
  let clock;
  let interval;
  let lastPollTime;
  let defaultTime = 60000 * 25;

  elem.appendChild(timer);
  reset();

  /**
   * Add the timer span element to the webpage.
   *
   * @return {span} The new span object.
   */
  function createTimer() {
    return document.createElement('span');
  }

  /**
   * Start the timer.
   */
  function start() {
    fullScreen();
    if (!interval) {
      lastPollTime = Date.now();
      interval = setInterval(update, 1000);
    }
  }

  /**
   * Stop the timer.
   */
  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  /** Toggle start/stop based on current state. */
  function toggle() {
    if (interval == null) {
      start();
    } else {
      stop();
    }
  }

  /**
   * Stop and reset the timer to its default value.
   */
  function reset() {
    clock = defaultTime;
    stop();
    display(clock);
  }

  /**
   * Advance the clock and update the page.
   */
  function update() {
    clock -= timeDelta();
    display();
  }

  /**
   * Calculate the exact time elapsed since the last poll.
   *
   * @return {number} Time elapsed since last poll.
   */
  function timeDelta() {
    let currentTime = Date.now();
    let delta = currentTime - lastPollTime;

    lastPollTime = currentTime;
    return delta;
  }

  /**
   * Add a minute to the timer.
   *
   * If the timer is stopped, add a minute also to the default timer value.
   */
  function addMinute() {
    if (interval == null) {
      defaultTime += 60000;
    }
    clock += 60000;
    display();
  }

  /**
   * Subtract a minute from the timer.
   *
   * If the timer is stopped, subtract a minute also from the default timer
   * value.
   */
  function subtractMinute() {
    if (interval == null) {
      defaultTime -= 60000;
    }
    clock -= 60000;
    display();
  }

  /**
   * Show the actual timer value on the webpage.
   *
   * Sets 'timer-alert' and 'timer-warning' classes based on the
   * remaining time. These are to be used in CSS to effect visual changes.
   */
  function display() {
    let seconds = (Math.abs(clock / 1000) % 60).toFixed(0);
    let minutes = Math.floor(Math.abs(clock / 1000 / 60)).toFixed(0);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (clock < 0) {
      minutes = '-' + minutes;
    }
    timer.innerHTML = minutes + '<seconds>:' + seconds + '</seconds>';
    if (clock < 0) {
      timer.classList.add('timer-alert');
      timer.classList.remove('timer-warning');
    } else if (clock < 60000 * 5) {
      timer.classList.add('timer-warning');
      timer.classList.remove('timer-alert');
    } else {
      timer.classList.remove('timer-warning');
      timer.classList.remove('timer-alert');
    }
  }

  /**
   * Switch timer to fullscreen.
   *
   * Check if user allows full screen of elements. This can be enabled or
   * disabled in browser config. By default its enabled. its also used to check
   * if browser supports full screen api.
   */
  function fullScreen() {
    if ('fullscreenEnabled' in document ||
      'webkitFullscreenEnabled' in document ||
      'mozFullScreenEnabled' in document ||
      'msFullscreenEnabled' in document) {
      if (document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled) {
        console.log('User allows fullscreen');

        // requestFullscreen is used to display an element in full screen mode.
        if ('requestFullscreen' in timer) {
          timer.requestFullscreen();
        } else if ('webkitRequestFullscreen' in timer) {
          timer.webkitRequestFullscreen();
        } else if ('mozRequestFullScreen' in timer) {
          timer.mozRequestFullScreen();
        } else if ('msRequestFullscreen' in timer) {
          timer.msRequestFullscreen();
        }
      }
    } else {
      console.log('User doesn\'t allow full screen');
    }
  }

  this.toggle = toggle;
  this.reset = reset;
  this.addMinute = addMinute;
  this.subtractMinute = subtractMinute;
};

/**
 * Capture keypresses and act on them.
 *
 * @param {event} e Keypress event
 */
function processKey(e) {
  if (e.keyCode == 32) { // space
    aTimer.toggle();
  }
  if (e.keyCode == 38) { // up arrow
    aTimer.addMinute();
  }
  if (e.keyCode == 40) { // down arrow
    aTimer.subtractMinute();
  }
  if (e.keyCode == 82) { // r key
    aTimer.reset();
  }
}
// register the handler
document.addEventListener('keydown', processKey, false);

/* exported createTimer */
/**
 * Create the actual timer at webpage load.
 *
 * @param {string} timerId Id of the element where to place the timer.
 */
function createTimer(timerId) {
  let a = document.getElementById(timerId);
  aTimer = new Timer(a);
}
