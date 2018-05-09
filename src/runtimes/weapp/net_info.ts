import Reachability from 'core/reachability';
import {default as EventsDispatcher} from 'core/events/dispatcher'

function hasOnlineConnectionState(connectionState) : boolean{
  return connectionState.type !== "none";
}

/** Really basic interface providing network availability info.
 *
 * Emits:
 * - online - when browser goes online
 * - offline - when browser goes offline
 */
export class NetInfo extends EventsDispatcher implements Reachability {
  online: boolean;

  constructor() {
    super();
    this.online = true;

    wx.getNetworkType({
      success: connectionState => {
        this.online = hasOnlineConnectionState(connectionState);
      }
    });

    wx.onNetworkStatusChange(connectionState => {
      var isNowOnline = hasOnlineConnectionState(connectionState);

      if (this.online === isNowOnline) return;
      this.online = isNowOnline;
      if (this.online){
        this.emit("online");
      } else {
        this.emit("offline");
      }
    });
  }

  isOnline() : boolean {
    return this.online;
  }
}

export var Network = new NetInfo();
