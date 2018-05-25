const apis = wx;

function isString(o) {
  return typeof o === 'string';
}

function isArray(o) {
  return Object.prototype.toString.call(o) === '[Object array]';
}



let isInitSocketGlobalEvent = false;

const defaultGloableEventHandler = (...args) => {
};

function socketGlobalEventHandle(handler = defaultGloableEventHandler) {
  // 设置全局事件接受者
  var gloableEventHandler = handler;

  if (isInitSocketGlobalEvent) {
    return;
  }
  isInitSocketGlobalEvent = true;

  // 绑定全局监听initListen
  apis.onSocketOpen(() => {
    gloableEventHandler('open');
  });

  apis.onSocketError((res) => {
    gloableEventHandler('error', res);
  });

  apis.onSocketClose((res) => {
    gloableEventHandler('close', res);
  });

  apis.onSocketMessage((res) => {
    gloableEventHandler('message', res);
  });
}

let globalWebsocket;
let nextGlobalWebsocket;

function setGlobalSocket(instance) {
  globalWebsocket = instance;
  socketGlobalEventHandle(instance.$handler);
}

function hasSingleSocket() {
  return !!globalWebsocket;
}

function popGlobal() {
  apis.connectSocket(nextGlobalWebsocket.$options);
  setGlobalSocket(nextGlobalWebsocket);
  nextGlobalWebsocket = undefined;
}

function createSingleSocketTask(instance) {
  return {
    send(ops) {
      if (globalWebsocket !== instance) {
        return;
      }
      apis.sendSocketMessage(ops);
    },
    close(ops) {
      if (globalWebsocket !== instance) {
        instance.$handler('close');
        return;
      }

      var param = {
        success(res) {
          if (nextGlobalWebsocket) {
            popGlobal();
          }
        },
        fail(err) {
        },
      };
      for(var key in ops) {
        param[key] = ops[key];
      }
      apis.closeSocket(param);
    },
  };
}

function connect(instance) {
  if (nextGlobalWebsocket) {
    nextGlobalWebsocket = instance;
    return;
  }
  nextGlobalWebsocket = instance;

  if (!globalWebsocket) {
    popGlobal();
    return;
  }

  if (globalWebsocket.readyState === 3) {
    popGlobal();
    return;
  }

  globalWebsocket.close();
}

function connectSingleSocket(instance) {
  connect(instance);
  return createSingleSocketTask(instance);
}

function socketEventHandle(handler, socketTask) {
  socketTask.onOpen(() => {
    handler('open');
  });
  socketTask.onError((res) => {
    handler('error', res);
  });
  socketTask.onClose((res) => {
    handler('close', res);
  });
  socketTask.onMessage((res) => {
    handler('message', res);
  });
}

function connectSocket(instance) {
  const socketTask = apis.connectSocket(instance.$options);
  if (socketTask) {
    socketEventHandle(instance.$handler, socketTask);
    return socketTask;
  }
  setGlobalSocket(instance);
  return createSingleSocketTask(instance);
}




const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;

let id = 0;

class WebSocket {

  private name: string = 'XMLHttpRequest';

  private binaryType = '';
  private readyState = CONNECTING;
  private $id = 0;
  private $options = null;
  private $handler = null;
  private $socket = null;

  constructor(url: string) {
    this.$id = id;
    this.$options = {
      url,
      header: {
        'content-type': 'application/json',
      },
      method: 'GET',
    };
    this.$handler = (event, res) => {
      if (event === 'close') {
        this.readyState = CLOSED;
      } else if (event === 'open') {
        this.readyState = OPEN;
      }
      if (this[`on${event}`]) {
        this[`on${event}`](res);
      }
    };
    this.$socket = connectSocket(this);
    id += 1;
  }

  send(data) {
    if (this.readyState === CONNECTING) {
      throw new Error("Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.");
    }
    if (this.readyState !== OPEN) {
      console.error('WebSocket is already in CLOSING or CLOSED state.');
      return;
    }
    this.$socket.send({
      data,
    });
  }

  close(code, reason) {
    this.readyState = CLOSING;
    if (!this.$socket) {
      throw new Error("Failed to execute 'close' on 'WebSocket': instance is undefined.");
    }
    this.$socket.close({
      code,
      reason,
    });
  }
}

export default WebSocket;
