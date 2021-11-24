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
    if (document.getElementById("fullscreenToggle").checked) {
      fullScreen();
    }
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
    display();
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

    if (interval == null) {
      timer.classList.add('timer-paused');
    } else {
      timer.classList.remove('timer-paused');
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
 * @param {event} e Keypress event.
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

// function processWheel(e) {
//   console.log("wheel" + e.deltaY);
//   if(e.deltaY < 0) {
//     aTimer.addMinute();
//   } else if (e.deltaY > 0) {
//     aTimer.subtractMinute();
//   }
// }

let touchObj = null;
let startY;
let timeOut = false;
let move = false;
let holding = false;
let long = false;

/**
 * Handle the beggining of touch interaction on touch-enabled devices.
 *
 * We start a timer that is used to measure if the user did 'tap and hold' or
 * just a plain old tap. In case of 'tap and hold' reset the timer.
 *
 * @param {event} e Touch event.
 */
function touchStart(e) {
  touchObj = e.changedTouches[0];
  startY = touchObj.clientY;
  holding = true;
  long = false;
  longTimer = setTimeout(function () {
    if (holding && move == false) {
      aTimer.reset();
    }
    long = true;
  }, 500);
}

/**
 * Handle the end of touch interaction on touch-enabled devices.
 *
 * If the touch interaction was actually a move (swipe), do nothing. If not,
 * and it was not a 'tap and hold', toggle the timer.
 */
function touchEnd() {
  if (move) {
    move = false;
  } else {
    if (long == false) {
      aTimer.toggle();
    }
  }
  holding = false;
}

/**
 * Handle swipes on touch-enabled devices.
 *
 * Based on the direction of a swipe, add or subtract minutes from the timer.
 * Do this only once in a while to prevent too fast changes (throttling).
 *
 * @param {event} e Touch event.
 */
function touchMove(e) {
  if (timeOut == false) {
    timeOut = true;
    // Throttling
    setTimeout(function () {
      timeOut = false;
    }, 150);
    touchObj = e.changedTouches[0];
    let distance = touchObj.clientY - startY;
    startY = touchObj.clientY;
    if (distance > 0) {
      aTimer.subtractMinute();
    } else {
      aTimer.addMinute();
    }
  }
  move = true;
}

document.addEventListener('keydown', processKey, false);
// document.addEventListener('click', function() {aTimer.toggle();}, true);
// document.addEventListener('wheel', processWheel);
document.addEventListener('touchstart', touchStart, false);
document.addEventListener('touchend', touchEnd, false);
document.addEventListener('touchmove', touchMove, false);

/**
 * Check if we are running on a smartphone or tablet.
 *
 * Adapted from from detectmobilebrowsers.com
 * @return {bool} True if we are on a mobile device, false otherwise.
 */
function mobileAndTabletcheck() {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

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

/* exported displayCorrectHelp */
/**
 * Hide one of the help paragraphs depending on what type of device we are.
 */
function displayCorrectHelp() {
  let keyboardHelp = document.getElementsByClassName('keyboard');
  let touchHelp = document.getElementsByClassName('touch');
  if (mobileAndTabletcheck() == true) {
    for (var i = 0; i < keyboardHelp.length; i++) {
      keyboardHelp[i].style.display = 'none';
    }
  } else {
    for (var i = 0; i < keyboardHelp.length; i++) {
      touchHelp[i].style.display = 'none';
    }
  }
}
