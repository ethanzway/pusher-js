import Timer from "./abstract_timer";
import TimedCallback from "./timed_callback";
import {Delay} from "./scheduling";

// We need to bind clear functions this way to avoid exceptions on IE8
var cto = timer => {
  clearTimeout(timer);
}
var cio = timer => {
  clearInterval(timer);
}

/** Cross-browser compatible one-off timer abstraction.
 *
 * @param {Number} delay
 * @param {Function} callback
 */
export class OneOffTimer extends Timer {
  constructor(delay : Delay, callback : TimedCallback) {
    super(setTimeout, cto, delay, function(timer){
      callback();
      return null;
    })
  }
}

/** Cross-browser compatible periodic timer abstraction.
 *
 * @param {Number} delay
 * @param {Function} callback
 */
export class PeriodicTimer extends Timer {
  constructor(delay : Delay, callback : TimedCallback) {
    super(setInterval, cio, delay, function(timer){
      callback();
      return timer;
    })
  }
}
