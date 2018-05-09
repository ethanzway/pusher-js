/*!
 * Pusher JavaScript Library v4.2.2
 * https://pusher.com/
 *
 * Copyright 2017, Pusher
 * Released under the MIT licence.
 */

module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const pusher_1 = __webpack_require__(1);
	module.exports = pusher_1.default;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const runtime_1 = __webpack_require__(2);
	const Collections = __webpack_require__(11);
	const dispatcher_1 = __webpack_require__(13);
	const timeline_1 = __webpack_require__(31);
	const level_1 = __webpack_require__(32);
	const StrategyBuilder = __webpack_require__(33);
	const timers_1 = __webpack_require__(9);
	const defaults_1 = __webpack_require__(5);
	const DefaultConfig = __webpack_require__(56);
	const logger_1 = __webpack_require__(15);
	const factory_1 = __webpack_require__(35);
	const url_store_1 = __webpack_require__(27);
	class Pusher {
	    constructor(app_key, options) {
	        checkAppKey(app_key);
	        options = options || {};
	        if (!options.cluster && !(options.wsHost || options.httpHost)) {
	            let suffix = url_store_1.default.buildLogSuffix("javascriptQuickStart");
	            logger_1.default.warn(`You should always specify a cluster when connecting. ${suffix}`);
	        }
	        this.key = app_key;
	        this.config = Collections.extend(DefaultConfig.getGlobalConfig(), options.cluster ? DefaultConfig.getClusterConfig(options.cluster) : {}, options);
	        this.channels = factory_1.default.createChannels();
	        this.global_emitter = new dispatcher_1.default();
	        this.sessionID = Math.floor(Math.random() * 1000000000);
	        this.timeline = new timeline_1.default(this.key, this.sessionID, {
	            cluster: this.config.cluster,
	            features: Pusher.getClientFeatures(),
	            params: this.config.timelineParams || {},
	            limit: 50,
	            level: level_1.default.INFO,
	            version: defaults_1.default.VERSION
	        });
	        if (!this.config.disableStats) {
	            this.timelineSender = factory_1.default.createTimelineSender(this.timeline, {
	                host: this.config.statsHost,
	                path: "/timeline/v2/" + runtime_1.default.TimelineTransport.name
	            });
	        }
	        var getStrategy = (options) => {
	            var config = Collections.extend({}, this.config, options);
	            return StrategyBuilder.build(runtime_1.default.getDefaultStrategy(config), config);
	        };
	        this.connection = factory_1.default.createConnectionManager(this.key, Collections.extend({ getStrategy: getStrategy,
	            timeline: this.timeline,
	            activityTimeout: this.config.activity_timeout,
	            pongTimeout: this.config.pong_timeout,
	            unavailableTimeout: this.config.unavailable_timeout
	        }, this.config, { encrypted: this.isEncrypted() }));
	        this.connection.bind('connected', () => {
	            this.subscribeAll();
	            if (this.timelineSender) {
	                this.timelineSender.send(this.connection.isEncrypted());
	            }
	        });
	        this.connection.bind('message', (params) => {
	            var internal = (params.event.indexOf('pusher_internal:') === 0);
	            if (params.channel) {
	                var channel = this.channel(params.channel);
	                if (channel) {
	                    channel.handleEvent(params.event, params.data);
	                }
	            }
	            if (!internal) {
	                this.global_emitter.emit(params.event, params.data);
	            }
	        });
	        this.connection.bind('connecting', () => {
	            this.channels.disconnect();
	        });
	        this.connection.bind('disconnected', () => {
	            this.channels.disconnect();
	        });
	        this.connection.bind('error', (err) => {
	            logger_1.default.warn('Error', err);
	        });
	        Pusher.instances.push(this);
	        this.timeline.info({ instances: Pusher.instances.length });
	        if (Pusher.isReady) {
	            this.connect();
	        }
	    }
	    static ready() {
	        Pusher.isReady = true;
	        for (var i = 0, l = Pusher.instances.length; i < l; i++) {
	            Pusher.instances[i].connect();
	        }
	    }
	    static log(message) {
	        if (Pusher.logToConsole && global.console && global.console.log) {
	            global.console.log(message);
	        }
	    }
	    static getClientFeatures() {
	        return Collections.keys(Collections.filterObject({ "ws": runtime_1.default.Transports.ws }, function (t) { return t.isSupported({}); }));
	    }
	    channel(name) {
	        return this.channels.find(name);
	    }
	    allChannels() {
	        return this.channels.all();
	    }
	    connect() {
	        this.connection.connect();
	        if (this.timelineSender) {
	            if (!this.timelineSenderTimer) {
	                var encrypted = this.connection.isEncrypted();
	                var timelineSender = this.timelineSender;
	                this.timelineSenderTimer = new timers_1.PeriodicTimer(60000, function () {
	                    timelineSender.send(encrypted);
	                });
	            }
	        }
	    }
	    disconnect() {
	        this.connection.disconnect();
	        if (this.timelineSenderTimer) {
	            this.timelineSenderTimer.ensureAborted();
	            this.timelineSenderTimer = null;
	        }
	    }
	    bind(event_name, callback, context) {
	        this.global_emitter.bind(event_name, callback, context);
	        return this;
	    }
	    unbind(event_name, callback, context) {
	        this.global_emitter.unbind(event_name, callback, context);
	        return this;
	    }
	    bind_global(callback) {
	        this.global_emitter.bind_global(callback);
	        return this;
	    }
	    unbind_global(callback) {
	        this.global_emitter.unbind_global(callback);
	        return this;
	    }
	    unbind_all(callback) {
	        this.global_emitter.unbind_all();
	        return this;
	    }
	    subscribeAll() {
	        var channelName;
	        for (channelName in this.channels.channels) {
	            if (this.channels.channels.hasOwnProperty(channelName)) {
	                this.subscribe(channelName);
	            }
	        }
	    }
	    subscribe(channel_name) {
	        var channel = this.channels.add(channel_name, this);
	        if (channel.subscriptionPending && channel.subscriptionCancelled) {
	            channel.reinstateSubscription();
	        }
	        else if (!channel.subscriptionPending && this.connection.state === "connected") {
	            channel.subscribe();
	        }
	        return channel;
	    }
	    unsubscribe(channel_name) {
	        var channel = this.channels.find(channel_name);
	        if (channel && channel.subscriptionPending) {
	            channel.cancelSubscription();
	        }
	        else {
	            channel = this.channels.remove(channel_name);
	            if (channel && this.connection.state === "connected") {
	                channel.unsubscribe();
	            }
	        }
	    }
	    send_event(event_name, data, channel) {
	        return this.connection.send_event(event_name, data, channel);
	    }
	    isEncrypted() {
	        if (runtime_1.default.getProtocol() === "https:") {
	            return true;
	        }
	        else {
	            return Boolean(this.config.encrypted);
	        }
	    }
	}
	Pusher.instances = [];
	Pusher.isReady = false;
	Pusher.logToConsole = false;
	Pusher.Runtime = runtime_1.default;
	Pusher.ScriptReceivers = runtime_1.default.ScriptReceivers;
	Pusher.DependenciesReceivers = runtime_1.default.DependenciesReceivers;
	Pusher.auth_callbacks = runtime_1.default.auth_callbacks;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Pusher;
	function checkAppKey(key) {
	    if (key === null || key === undefined) {
	        throw "You must pass your app key when you instantiate Pusher.";
	    }
	}
	runtime_1.default.setup(Pusher);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const transports_1 = __webpack_require__(3);
	const default_strategy_1 = __webpack_require__(16);
	const transport_connection_initializer_1 = __webpack_require__(17);
	const http_1 = __webpack_require__(18);
	const net_info_1 = __webpack_require__(25);
	const xhr_auth_1 = __webpack_require__(26);
	const xhr_timeline_1 = __webpack_require__(28);
	const http_wx_xhr_1 = __webpack_require__(29);
	const http_wx_websocket_1 = __webpack_require__(30);
	var Weapp = {
	    getDefaultStrategy: default_strategy_1.default,
	    Transports: transports_1.default,
	    transportConnectionInitializer: transport_connection_initializer_1.default,
	    HTTPFactory: http_1.default,
	    setup(PusherClass) {
	        PusherClass.ready();
	    },
	    getLocalStorage() {
	        return undefined;
	    },
	    getProtocol() {
	        return "http:";
	    },
	    isXHRSupported() {
	        return true;
	    },
	    createSocketRequest(method, url) {
	        return this.HTTPFactory.createXHR(method, url);
	    },
	    createXHR() {
	        var Constructor = this.getXHRAPI();
	        return new Constructor();
	    },
	    createWebSocket(url) {
	        var Constructor = this.getWebSocketAPI();
	        return new Constructor(url);
	    },
	    addUnloadListener(listener) { },
	    removeUnloadListener(listener) { },
	    TimelineTransport: xhr_timeline_1.default,
	    getAuthorizers() {
	        return { ajax: xhr_auth_1.default };
	    },
	    getWebSocketAPI() {
	        return http_wx_websocket_1.default;
	    },
	    getXHRAPI() {
	        return http_wx_xhr_1.default;
	    },
	    getNetwork() {
	        return net_info_1.Network;
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Weapp;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const URLSchemes = __webpack_require__(4);
	const transport_1 = __webpack_require__(6);
	const Collections = __webpack_require__(11);
	const runtime_1 = __webpack_require__(2);
	var WSTransport = new transport_1.default({
	    urls: URLSchemes.ws,
	    handlesActivityChecks: false,
	    supportsPing: false,
	    isInitialized: function () {
	        return Boolean(runtime_1.default.getWebSocketAPI());
	    },
	    isSupported: function () {
	        return Boolean(runtime_1.default.getWebSocketAPI());
	    },
	    getSocket: function (url) {
	        return runtime_1.default.createWebSocket(url);
	    }
	});
	var httpConfiguration = {
	    urls: URLSchemes.http,
	    handlesActivityChecks: false,
	    supportsPing: true,
	    isInitialized: function () {
	        return true;
	    }
	};
	exports.streamingConfiguration = Collections.extend({ getSocket: function (url) {
	        return runtime_1.default.HTTPFactory.createStreamingSocket(url);
	    }
	}, httpConfiguration);
	exports.pollingConfiguration = Collections.extend({ getSocket: function (url) {
	        return runtime_1.default.HTTPFactory.createPollingSocket(url);
	    }
	}, httpConfiguration);
	var xhrConfiguration = {
	    isSupported: function () {
	        return runtime_1.default.isXHRSupported();
	    }
	};
	var XHRStreamingTransport = new transport_1.default(Collections.extend({}, exports.streamingConfiguration, xhrConfiguration));
	var XHRPollingTransport = new transport_1.default(Collections.extend({}, exports.pollingConfiguration, xhrConfiguration));
	var Transports = {
	    ws: WSTransport,
	    xhr_streaming: XHRStreamingTransport,
	    xhr_polling: XHRPollingTransport
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Transports;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const defaults_1 = __webpack_require__(5);
	function getGenericURL(baseScheme, params, path) {
	    var scheme = baseScheme + (params.encrypted ? "s" : "");
	    var host = params.encrypted ? params.hostEncrypted : params.hostUnencrypted;
	    return scheme + "://" + host + path;
	}
	function getGenericPath(key, queryString) {
	    var path = "/app/" + key;
	    var query = "?protocol=" + defaults_1.default.PROTOCOL +
	        "&client=js" +
	        "&version=" + defaults_1.default.VERSION +
	        (queryString ? ("&" + queryString) : "");
	    return path + query;
	}
	exports.ws = {
	    getInitial: function (key, params) {
	        var path = (params.httpPath || "") + getGenericPath(key, "flash=false");
	        return getGenericURL("ws", params, path);
	    }
	};
	exports.http = {
	    getInitial: function (key, params) {
	        var path = (params.httpPath || "/pusher") + getGenericPath(key);
	        return getGenericURL("http", params, path);
	    }
	};
	exports.sockjs = {
	    getInitial: function (key, params) {
	        return getGenericURL("http", params, params.httpPath || "/pusher");
	    },
	    getPath: function (key, params) {
	        return getGenericPath(key);
	    }
	};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";
	var Defaults = {
	    VERSION: "4.2.2",
	    PROTOCOL: 7,
	    host: 'ws.pusherapp.com',
	    ws_port: 80,
	    wss_port: 443,
	    ws_path: '',
	    sockjs_host: 'sockjs.pusher.com',
	    sockjs_http_port: 80,
	    sockjs_https_port: 443,
	    sockjs_path: "/pusher",
	    stats_host: 'stats.pusher.com',
	    channel_auth_endpoint: '/pusher/auth',
	    channel_auth_transport: 'ajax',
	    activity_timeout: 120000,
	    pong_timeout: 30000,
	    unavailable_timeout: 10000,
	    cdn_http: 'http://js.pusher.com',
	    cdn_https: 'https://js.pusher.com',
	    dependency_suffix: ''
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Defaults;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const transport_connection_1 = __webpack_require__(7);
	class Transport {
	    constructor(hooks) {
	        this.hooks = hooks;
	    }
	    isSupported(environment) {
	        return this.hooks.isSupported(environment);
	    }
	    createConnection(name, priority, key, options) {
	        return new transport_connection_1.default(this.hooks, name, priority, key, options);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Transport;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const util_1 = __webpack_require__(8);
	const Collections = __webpack_require__(11);
	const dispatcher_1 = __webpack_require__(13);
	const logger_1 = __webpack_require__(15);
	const runtime_1 = __webpack_require__(2);
	class TransportConnection extends dispatcher_1.default {
	    constructor(hooks, name, priority, key, options) {
	        super();
	        this.initialize = runtime_1.default.transportConnectionInitializer;
	        this.hooks = hooks;
	        this.name = name;
	        this.priority = priority;
	        this.key = key;
	        this.options = options;
	        this.state = "new";
	        this.timeline = options.timeline;
	        this.activityTimeout = options.activityTimeout;
	        this.id = this.timeline.generateUniqueID();
	    }
	    handlesActivityChecks() {
	        return Boolean(this.hooks.handlesActivityChecks);
	    }
	    supportsPing() {
	        return Boolean(this.hooks.supportsPing);
	    }
	    connect() {
	        if (this.socket || this.state !== "initialized") {
	            return false;
	        }
	        var url = this.hooks.urls.getInitial(this.key, this.options);
	        try {
	            this.socket = this.hooks.getSocket(url, this.options);
	        }
	        catch (e) {
	            util_1.default.defer(() => {
	                this.onError(e);
	                this.changeState("closed");
	            });
	            return false;
	        }
	        this.bindListeners();
	        logger_1.default.debug("Connecting", { transport: this.name, url: url });
	        this.changeState("connecting");
	        return true;
	    }
	    close() {
	        if (this.socket) {
	            this.socket.close();
	            return true;
	        }
	        else {
	            return false;
	        }
	    }
	    send(data) {
	        if (this.state === "open") {
	            util_1.default.defer(() => {
	                if (this.socket) {
	                    this.socket.send(data);
	                }
	            });
	            return true;
	        }
	        else {
	            return false;
	        }
	    }
	    ping() {
	        if (this.state === "open" && this.supportsPing()) {
	            this.socket.ping();
	        }
	    }
	    onOpen() {
	        if (this.hooks.beforeOpen) {
	            this.hooks.beforeOpen(this.socket, this.hooks.urls.getPath(this.key, this.options));
	        }
	        this.changeState("open");
	        this.socket.onopen = undefined;
	    }
	    onError(error) {
	        this.emit("error", { type: 'WebSocketError', error: error });
	        this.timeline.error(this.buildTimelineMessage({ error: error.toString() }));
	    }
	    onClose(closeEvent) {
	        if (closeEvent) {
	            this.changeState("closed", {
	                code: closeEvent.code,
	                reason: closeEvent.reason,
	                wasClean: closeEvent.wasClean
	            });
	        }
	        else {
	            this.changeState("closed");
	        }
	        this.unbindListeners();
	        this.socket = undefined;
	    }
	    onMessage(message) {
	        this.emit("message", message);
	    }
	    onActivity() {
	        this.emit("activity");
	    }
	    bindListeners() {
	        this.socket.onopen = () => {
	            this.onOpen();
	        };
	        this.socket.onerror = (error) => {
	            this.onError(error);
	        };
	        this.socket.onclose = (closeEvent) => {
	            this.onClose(closeEvent);
	        };
	        this.socket.onmessage = (message) => {
	            this.onMessage(message);
	        };
	        if (this.supportsPing()) {
	            this.socket.onactivity = () => { this.onActivity(); };
	        }
	    }
	    unbindListeners() {
	        if (this.socket) {
	            this.socket.onopen = undefined;
	            this.socket.onerror = undefined;
	            this.socket.onclose = undefined;
	            this.socket.onmessage = undefined;
	            if (this.supportsPing()) {
	                this.socket.onactivity = undefined;
	            }
	        }
	    }
	    changeState(state, params) {
	        this.state = state;
	        this.timeline.info(this.buildTimelineMessage({
	            state: state,
	            params: params
	        }));
	        this.emit(state, params);
	    }
	    buildTimelineMessage(message) {
	        return Collections.extend({ cid: this.id }, message);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = TransportConnection;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const timers_1 = __webpack_require__(9);
	var Util = {
	    now() {
	        if (Date.now) {
	            return Date.now();
	        }
	        else {
	            return new Date().valueOf();
	        }
	    },
	    defer(callback) {
	        return new timers_1.OneOffTimer(0, callback);
	    },
	    method(name, ...args) {
	        var boundArguments = Array.prototype.slice.call(arguments, 1);
	        return function (object) {
	            return object[name].apply(object, boundArguments.concat(arguments));
	        };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Util;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const abstract_timer_1 = __webpack_require__(10);
	var cto = timer => {
	    clearTimeout(timer);
	};
	var cio = timer => {
	    clearInterval(timer);
	};
	class OneOffTimer extends abstract_timer_1.default {
	    constructor(delay, callback) {
	        super(setTimeout, cto, delay, function (timer) {
	            callback();
	            return null;
	        });
	    }
	}
	exports.OneOffTimer = OneOffTimer;
	class PeriodicTimer extends abstract_timer_1.default {
	    constructor(delay, callback) {
	        super(setInterval, cio, delay, function (timer) {
	            callback();
	            return timer;
	        });
	    }
	}
	exports.PeriodicTimer = PeriodicTimer;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

	"use strict";
	class Timer {
	    constructor(set, clear, delay, callback) {
	        this.clear = clear;
	        this.timer = set(() => {
	            if (this.timer) {
	                this.timer = callback(this.timer);
	            }
	        }, delay);
	    }
	    isRunning() {
	        return this.timer !== null;
	    }
	    ensureAborted() {
	        if (this.timer) {
	            this.clear(this.timer);
	            this.timer = null;
	        }
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Timer;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const base64_1 = __webpack_require__(12);
	const util_1 = __webpack_require__(8);
	function extend(target, ...sources) {
	    for (var i = 0; i < sources.length; i++) {
	        var extensions = sources[i];
	        for (var property in extensions) {
	            if (extensions[property] && extensions[property].constructor &&
	                extensions[property].constructor === Object) {
	                target[property] = extend(target[property] || {}, extensions[property]);
	            }
	            else {
	                target[property] = extensions[property];
	            }
	        }
	    }
	    return target;
	}
	exports.extend = extend;
	function stringify() {
	    var m = ["Pusher"];
	    for (var i = 0; i < arguments.length; i++) {
	        if (typeof arguments[i] === "string") {
	            m.push(arguments[i]);
	        }
	        else {
	            m.push(safeJSONStringify(arguments[i]));
	        }
	    }
	    return m.join(" : ");
	}
	exports.stringify = stringify;
	function arrayIndexOf(array, item) {
	    var nativeIndexOf = Array.prototype.indexOf;
	    if (array === null) {
	        return -1;
	    }
	    if (nativeIndexOf && array.indexOf === nativeIndexOf) {
	        return array.indexOf(item);
	    }
	    for (var i = 0, l = array.length; i < l; i++) {
	        if (array[i] === item) {
	            return i;
	        }
	    }
	    return -1;
	}
	exports.arrayIndexOf = arrayIndexOf;
	function objectApply(object, f) {
	    for (var key in object) {
	        if (Object.prototype.hasOwnProperty.call(object, key)) {
	            f(object[key], key, object);
	        }
	    }
	}
	exports.objectApply = objectApply;
	function keys(object) {
	    var keys = [];
	    objectApply(object, function (_, key) {
	        keys.push(key);
	    });
	    return keys;
	}
	exports.keys = keys;
	function values(object) {
	    var values = [];
	    objectApply(object, function (value) {
	        values.push(value);
	    });
	    return values;
	}
	exports.values = values;
	function apply(array, f, context) {
	    for (var i = 0; i < array.length; i++) {
	        f.call(context || global, array[i], i, array);
	    }
	}
	exports.apply = apply;
	function map(array, f) {
	    var result = [];
	    for (var i = 0; i < array.length; i++) {
	        result.push(f(array[i], i, array, result));
	    }
	    return result;
	}
	exports.map = map;
	function mapObject(object, f) {
	    var result = {};
	    objectApply(object, function (value, key) {
	        result[key] = f(value);
	    });
	    return result;
	}
	exports.mapObject = mapObject;
	function filter(array, test) {
	    test = test || function (value) { return !!value; };
	    var result = [];
	    for (var i = 0; i < array.length; i++) {
	        if (test(array[i], i, array, result)) {
	            result.push(array[i]);
	        }
	    }
	    return result;
	}
	exports.filter = filter;
	function filterObject(object, test) {
	    var result = {};
	    objectApply(object, function (value, key) {
	        if ((test && test(value, key, object, result)) || Boolean(value)) {
	            result[key] = value;
	        }
	    });
	    return result;
	}
	exports.filterObject = filterObject;
	function flatten(object) {
	    var result = [];
	    objectApply(object, function (value, key) {
	        result.push([key, value]);
	    });
	    return result;
	}
	exports.flatten = flatten;
	function any(array, test) {
	    for (var i = 0; i < array.length; i++) {
	        if (test(array[i], i, array)) {
	            return true;
	        }
	    }
	    return false;
	}
	exports.any = any;
	function all(array, test) {
	    for (var i = 0; i < array.length; i++) {
	        if (!test(array[i], i, array)) {
	            return false;
	        }
	    }
	    return true;
	}
	exports.all = all;
	function encodeParamsObject(data) {
	    return mapObject(data, function (value) {
	        if (typeof value === "object") {
	            value = safeJSONStringify(value);
	        }
	        return encodeURIComponent(base64_1.default(value.toString()));
	    });
	}
	exports.encodeParamsObject = encodeParamsObject;
	function buildQueryString(data) {
	    var params = filterObject(data, function (value) {
	        return value !== undefined;
	    });
	    var query = map(flatten(encodeParamsObject(params)), util_1.default.method("join", "=")).join("&");
	    return query;
	}
	exports.buildQueryString = buildQueryString;
	function decycleObject(object) {
	    var objects = [], paths = [];
	    return (function derez(value, path) {
	        var i, name, nu;
	        switch (typeof value) {
	            case 'object':
	                if (!value) {
	                    return null;
	                }
	                for (i = 0; i < objects.length; i += 1) {
	                    if (objects[i] === value) {
	                        return { $ref: paths[i] };
	                    }
	                }
	                objects.push(value);
	                paths.push(path);
	                if (Object.prototype.toString.apply(value) === '[object Array]') {
	                    nu = [];
	                    for (i = 0; i < value.length; i += 1) {
	                        nu[i] = derez(value[i], path + '[' + i + ']');
	                    }
	                }
	                else {
	                    nu = {};
	                    for (name in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, name)) {
	                            nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
	                        }
	                    }
	                }
	                return nu;
	            case 'number':
	            case 'string':
	            case 'boolean':
	                return value;
	        }
	    }(object, '$'));
	}
	exports.decycleObject = decycleObject;
	function safeJSONStringify(source) {
	    try {
	        return JSON.stringify(source);
	    }
	    catch (e) {
	        return JSON.stringify(decycleObject(source));
	    }
	}
	exports.safeJSONStringify = safeJSONStringify;


/***/ }),
/* 12 */
/***/ (function(module, exports) {

	"use strict";
	function encode(s) {
	    return btoa(utob(s));
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = encode;
	var fromCharCode = String.fromCharCode;
	var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var b64tab = {};
	for (var i = 0, l = b64chars.length; i < l; i++) {
	    b64tab[b64chars.charAt(i)] = i;
	}
	var cb_utob = function (c) {
	    var cc = c.charCodeAt(0);
	    return cc < 0x80 ? c
	        : cc < 0x800 ? fromCharCode(0xc0 | (cc >>> 6)) +
	            fromCharCode(0x80 | (cc & 0x3f))
	            : fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
	                fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
	                fromCharCode(0x80 | (cc & 0x3f));
	};
	var utob = function (u) {
	    return u.replace(/[^\x00-\x7F]/g, cb_utob);
	};
	var cb_encode = function (ccc) {
	    var padlen = [0, 2, 1][ccc.length % 3];
	    var ord = ccc.charCodeAt(0) << 16
	        | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
	        | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0));
	    var chars = [
	        b64chars.charAt(ord >>> 18),
	        b64chars.charAt((ord >>> 12) & 63),
	        padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
	        padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
	    ];
	    return chars.join('');
	};
	var btoa = global.btoa || function (b) {
	    return b.replace(/[\s\S]{1,3}/g, cb_encode);
	};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const callback_registry_1 = __webpack_require__(14);
	class Dispatcher {
	    constructor(failThrough) {
	        this.callbacks = new callback_registry_1.default();
	        this.global_callbacks = [];
	        this.failThrough = failThrough;
	    }
	    bind(eventName, callback, context) {
	        this.callbacks.add(eventName, callback, context);
	        return this;
	    }
	    bind_global(callback) {
	        this.global_callbacks.push(callback);
	        return this;
	    }
	    unbind(eventName, callback, context) {
	        this.callbacks.remove(eventName, callback, context);
	        return this;
	    }
	    unbind_global(callback) {
	        if (!callback) {
	            this.global_callbacks = [];
	            return this;
	        }
	        this.global_callbacks = Collections.filter(this.global_callbacks || [], c => c !== callback);
	        return this;
	    }
	    unbind_all() {
	        this.unbind();
	        this.unbind_global();
	        return this;
	    }
	    emit(eventName, data) {
	        var i;
	        for (i = 0; i < this.global_callbacks.length; i++) {
	            this.global_callbacks[i](eventName, data);
	        }
	        var callbacks = this.callbacks.get(eventName);
	        if (callbacks && callbacks.length > 0) {
	            for (i = 0; i < callbacks.length; i++) {
	                callbacks[i].fn.call(callbacks[i].context || global, data);
	            }
	        }
	        else if (this.failThrough) {
	            this.failThrough(eventName, data);
	        }
	        return this;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Dispatcher;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	class CallbackRegistry {
	    constructor() {
	        this._callbacks = {};
	    }
	    get(name) {
	        return this._callbacks[prefix(name)];
	    }
	    add(name, callback, context) {
	        var prefixedEventName = prefix(name);
	        this._callbacks[prefixedEventName] = this._callbacks[prefixedEventName] || [];
	        this._callbacks[prefixedEventName].push({
	            fn: callback,
	            context: context
	        });
	    }
	    remove(name, callback, context) {
	        if (!name && !callback && !context) {
	            this._callbacks = {};
	            return;
	        }
	        var names = name ? [prefix(name)] : Collections.keys(this._callbacks);
	        if (callback || context) {
	            this.removeCallback(names, callback, context);
	        }
	        else {
	            this.removeAllCallbacks(names);
	        }
	    }
	    removeCallback(names, callback, context) {
	        Collections.apply(names, function (name) {
	            this._callbacks[name] = Collections.filter(this._callbacks[name] || [], function (binding) {
	                return (callback && callback !== binding.fn) ||
	                    (context && context !== binding.context);
	            });
	            if (this._callbacks[name].length === 0) {
	                delete this._callbacks[name];
	            }
	        }, this);
	    }
	    removeAllCallbacks(names) {
	        Collections.apply(names, function (name) {
	            delete this._callbacks[name];
	        }, this);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = CallbackRegistry;
	function prefix(name) {
	    return "_" + name;
	}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const collections_1 = __webpack_require__(11);
	const pusher_1 = __webpack_require__(1);
	const Logger = {
	    debug(...args) {
	        if (!pusher_1.default.log) {
	            return;
	        }
	        pusher_1.default.log(collections_1.stringify.apply(this, arguments));
	    },
	    warn(...args) {
	        var message = collections_1.stringify.apply(this, arguments);
	        if (pusher_1.default.log) {
	            pusher_1.default.log(message);
	        }
	        else if (global.console) {
	            if (global.console.warn) {
	                global.console.warn(message);
	            }
	            else if (global.console.log) {
	                global.console.log(message);
	            }
	        }
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Logger;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

	"use strict";
	var getDefaultStrategy = function (config) {
	    var wsStrategy;
	    if (config.encrypted) {
	        wsStrategy = [
	            ":best_connected_ever",
	            ":ws_loop",
	            [":delayed", 2000, [":http_loop"]]
	        ];
	    }
	    else {
	        wsStrategy = [
	            ":best_connected_ever",
	            ":ws_loop",
	            [":delayed", 2000, [":wss_loop"]],
	            [":delayed", 5000, [":http_loop"]]
	        ];
	    }
	    return [
	        [":def", "ws_options", {
	                hostUnencrypted: config.wsHost + ":" + config.wsPort,
	                hostEncrypted: config.wsHost + ":" + config.wssPort,
	                httpPath: config.wsPath
	            }],
	        [":def", "wss_options", [":extend", ":ws_options", {
	                    encrypted: true
	                }]],
	        [":def", "http_options", {
	                hostUnencrypted: config.httpHost + ":" + config.httpPort,
	                hostEncrypted: config.httpHost + ":" + config.httpsPort,
	                httpPath: config.httpPath
	            }],
	        [":def", "timeouts", {
	                loop: true,
	                timeout: 15000,
	                timeoutLimit: 60000
	            }],
	        [":def", "ws_manager", [":transport_manager", {
	                    lives: 2,
	                    minPingDelay: 10000,
	                    maxPingDelay: config.activity_timeout
	                }]],
	        [":def", "streaming_manager", [":transport_manager", {
	                    lives: 2,
	                    minPingDelay: 10000,
	                    maxPingDelay: config.activity_timeout
	                }]],
	        [":def_transport", "ws", "ws", 3, ":ws_options", ":ws_manager"],
	        [":def_transport", "wss", "ws", 3, ":wss_options", ":ws_manager"],
	        [":def_transport", "xhr_streaming", "xhr_streaming", 1, ":http_options", ":streaming_manager"],
	        [":def_transport", "xhr_polling", "xhr_polling", 1, ":http_options"],
	        [":def", "ws_loop", [":sequential", ":timeouts", ":ws"]],
	        [":def", "wss_loop", [":sequential", ":timeouts", ":wss"]],
	        [":def", "streaming_loop", [":sequential", ":timeouts", ":xhr_streaming"]],
	        [":def", "polling_loop", [":sequential", ":timeouts", ":xhr_polling"]],
	        [":def", "http_loop", [":if", [":is_supported", ":streaming_loop"], [
	                    ":best_connected_ever",
	                    ":streaming_loop",
	                    [":delayed", 4000, [":polling_loop"]]
	                ], [
	                    ":polling_loop"
	                ]]],
	        [":def", "strategy",
	            [":cached", 1800000,
	                [":first_connected",
	                    [":if", [":is_supported", ":ws"],
	                        wsStrategy,
	                        ":http_loop"
	                    ]
	                ]
	            ]
	        ]
	    ];
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = getDefaultStrategy;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	"use strict";
	function default_1() {
	    var self = this;
	    self.timeline.info(self.buildTimelineMessage({
	        transport: self.name + (self.options.encrypted ? "s" : "")
	    }));
	    if (self.hooks.isInitialized()) {
	        self.changeState("initialized");
	    }
	    else {
	        self.onClose();
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = default_1;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const http_request_1 = __webpack_require__(19);
	const http_socket_1 = __webpack_require__(20);
	const http_streaming_socket_1 = __webpack_require__(22);
	const http_polling_socket_1 = __webpack_require__(23);
	const http_wx_request_1 = __webpack_require__(24);
	var HTTP = {
	    createStreamingSocket(url) {
	        return this.createSocket(http_streaming_socket_1.default, url);
	    },
	    createPollingSocket(url) {
	        return this.createSocket(http_polling_socket_1.default, url);
	    },
	    createSocket(hooks, url) {
	        return new http_socket_1.default(hooks, url);
	    },
	    createXHR(method, url) {
	        return this.createRequest(http_wx_request_1.default, method, url);
	    },
	    createRequest(hooks, method, url) {
	        return new http_request_1.default(hooks, method, url);
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = HTTP;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const runtime_1 = __webpack_require__(2);
	const dispatcher_1 = __webpack_require__(13);
	const MAX_BUFFER_LENGTH = 256 * 1024;
	class HTTPRequest extends dispatcher_1.default {
	    constructor(hooks, method, url) {
	        super();
	        this.hooks = hooks;
	        this.method = method;
	        this.url = url;
	    }
	    start(payload) {
	        this.position = 0;
	        this.xhr = this.hooks.getRequest(this);
	        this.unloader = () => {
	            this.close();
	        };
	        runtime_1.default.addUnloadListener(this.unloader);
	        this.xhr.open(this.method, this.url, true);
	        if (this.xhr.setRequestHeader) {
	            this.xhr.setRequestHeader("Content-Type", "application/json");
	        }
	        this.xhr.send(payload);
	    }
	    close() {
	        if (this.unloader) {
	            runtime_1.default.removeUnloadListener(this.unloader);
	            this.unloader = null;
	        }
	        if (this.xhr) {
	            this.hooks.abortRequest(this.xhr);
	            this.xhr = null;
	        }
	    }
	    onChunk(status, data) {
	        while (true) {
	            var chunk = this.advanceBuffer(data);
	            if (chunk) {
	                this.emit("chunk", { status: status, data: chunk });
	            }
	            else {
	                break;
	            }
	        }
	        if (this.isBufferTooLong(data)) {
	            this.emit("buffer_too_long");
	        }
	    }
	    advanceBuffer(buffer) {
	        var unreadData = buffer.slice(this.position);
	        var endOfLinePosition = unreadData.indexOf("\n");
	        if (endOfLinePosition !== -1) {
	            this.position += endOfLinePosition + 1;
	            return unreadData.slice(0, endOfLinePosition);
	        }
	        else {
	            return null;
	        }
	    }
	    isBufferTooLong(buffer) {
	        return this.position === buffer.length && buffer.length > MAX_BUFFER_LENGTH;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = HTTPRequest;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const state_1 = __webpack_require__(21);
	const util_1 = __webpack_require__(8);
	const runtime_1 = __webpack_require__(2);
	var autoIncrement = 1;
	class HTTPSocket {
	    constructor(hooks, url) {
	        this.hooks = hooks;
	        this.session = randomNumber(1000) + "/" + randomString(8);
	        this.location = getLocation(url);
	        this.readyState = state_1.default.CONNECTING;
	        this.openStream();
	    }
	    send(payload) {
	        return this.sendRaw(JSON.stringify([payload]));
	    }
	    ping() {
	        this.hooks.sendHeartbeat(this);
	    }
	    close(code, reason) {
	        this.onClose(code, reason, true);
	    }
	    sendRaw(payload) {
	        if (this.readyState === state_1.default.OPEN) {
	            try {
	                runtime_1.default.createSocketRequest("POST", getUniqueURL(getSendURL(this.location, this.session))).start(payload);
	                return true;
	            }
	            catch (e) {
	                return false;
	            }
	        }
	        else {
	            return false;
	        }
	    }
	    reconnect() {
	        this.closeStream();
	        this.openStream();
	    }
	    ;
	    onClose(code, reason, wasClean) {
	        this.closeStream();
	        this.readyState = state_1.default.CLOSED;
	        if (this.onclose) {
	            this.onclose({
	                code: code,
	                reason: reason,
	                wasClean: wasClean
	            });
	        }
	    }
	    onChunk(chunk) {
	        if (chunk.status !== 200) {
	            return;
	        }
	        if (this.readyState === state_1.default.OPEN) {
	            this.onActivity();
	        }
	        var payload;
	        var type = chunk.data.slice(0, 1);
	        switch (type) {
	            case 'o':
	                payload = JSON.parse(chunk.data.slice(1) || '{}');
	                this.onOpen(payload);
	                break;
	            case 'a':
	                payload = JSON.parse(chunk.data.slice(1) || '[]');
	                for (var i = 0; i < payload.length; i++) {
	                    this.onEvent(payload[i]);
	                }
	                break;
	            case 'm':
	                payload = JSON.parse(chunk.data.slice(1) || 'null');
	                this.onEvent(payload);
	                break;
	            case 'h':
	                this.hooks.onHeartbeat(this);
	                break;
	            case 'c':
	                payload = JSON.parse(chunk.data.slice(1) || '[]');
	                this.onClose(payload[0], payload[1], true);
	                break;
	        }
	    }
	    onOpen(options) {
	        if (this.readyState === state_1.default.CONNECTING) {
	            if (options && options.hostname) {
	                this.location.base = replaceHost(this.location.base, options.hostname);
	            }
	            this.readyState = state_1.default.OPEN;
	            if (this.onopen) {
	                this.onopen();
	            }
	        }
	        else {
	            this.onClose(1006, "Server lost session", true);
	        }
	    }
	    onEvent(event) {
	        if (this.readyState === state_1.default.OPEN && this.onmessage) {
	            this.onmessage({ data: event });
	        }
	    }
	    onActivity() {
	        if (this.onactivity) {
	            this.onactivity();
	        }
	    }
	    onError(error) {
	        if (this.onerror) {
	            this.onerror(error);
	        }
	    }
	    openStream() {
	        this.stream = runtime_1.default.createSocketRequest("POST", getUniqueURL(this.hooks.getReceiveURL(this.location, this.session)));
	        this.stream.bind("chunk", (chunk) => {
	            this.onChunk(chunk);
	        });
	        this.stream.bind("finished", (status) => {
	            this.hooks.onFinished(this, status);
	        });
	        this.stream.bind("buffer_too_long", () => {
	            this.reconnect();
	        });
	        try {
	            this.stream.start();
	        }
	        catch (error) {
	            util_1.default.defer(() => {
	                this.onError(error);
	                this.onClose(1006, "Could not start streaming", false);
	            });
	        }
	    }
	    closeStream() {
	        if (this.stream) {
	            this.stream.unbind_all();
	            this.stream.close();
	            this.stream = null;
	        }
	    }
	}
	function getLocation(url) {
	    var parts = /([^\?]*)\/*(\??.*)/.exec(url);
	    return {
	        base: parts[1],
	        queryString: parts[2]
	    };
	}
	function getSendURL(url, session) {
	    return url.base + "/" + session + "/xhr_send";
	}
	function getUniqueURL(url) {
	    var separator = (url.indexOf('?') === -1) ? "?" : "&";
	    return url + separator + "t=" + (+new Date()) + "&n=" + autoIncrement++;
	}
	function replaceHost(url, hostname) {
	    var urlParts = /(https?:\/\/)([^\/:]+)((\/|:)?.*)/.exec(url);
	    return urlParts[1] + hostname + urlParts[3];
	}
	function randomNumber(max) {
	    return Math.floor(Math.random() * max);
	}
	function randomString(length) {
	    var result = [];
	    for (var i = 0; i < length; i++) {
	        result.push(randomNumber(32).toString(32));
	    }
	    return result.join('');
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = HTTPSocket;


/***/ }),
/* 21 */
/***/ (function(module, exports) {

	"use strict";
	var State;
	(function (State) {
	    State[State["CONNECTING"] = 0] = "CONNECTING";
	    State[State["OPEN"] = 1] = "OPEN";
	    State[State["CLOSED"] = 3] = "CLOSED";
	})(State || (State = {}));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = State;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

	"use strict";
	var hooks = {
	    getReceiveURL: function (url, session) {
	        return url.base + "/" + session + "/xhr_streaming" + url.queryString;
	    },
	    onHeartbeat: function (socket) {
	        socket.sendRaw("[]");
	    },
	    sendHeartbeat: function (socket) {
	        socket.sendRaw("[]");
	    },
	    onFinished: function (socket, status) {
	        socket.onClose(1006, "Connection interrupted (" + status + ")", false);
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = hooks;


/***/ }),
/* 23 */
/***/ (function(module, exports) {

	"use strict";
	var hooks = {
	    getReceiveURL: function (url, session) {
	        return url.base + "/" + session + "/xhr" + url.queryString;
	    },
	    onHeartbeat: function () {
	    },
	    sendHeartbeat: function (socket) {
	        socket.sendRaw("[]");
	    },
	    onFinished: function (socket, status) {
	        if (status === 200) {
	            socket.reconnect();
	        }
	        else {
	            socket.onClose(1006, "Connection interrupted (" + status + ")", false);
	        }
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = hooks;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const runtime_1 = __webpack_require__(2);
	var hooks = {
	    getRequest: function (socket) {
	        var Constructor = runtime_1.default.getXHRAPI();
	        var xhr = new Constructor();
	        xhr.onreadystatechange = xhr.onprogress = function () {
	            switch (xhr.readyState) {
	                case 3:
	                    if (xhr.responseText && xhr.responseText.length > 0) {
	                        socket.onChunk(xhr.status, xhr.responseText);
	                    }
	                    break;
	                case 4:
	                    if (xhr.responseText && xhr.responseText.length > 0) {
	                        socket.onChunk(xhr.status, xhr.responseText);
	                    }
	                    socket.emit("finished", xhr.status);
	                    socket.close();
	                    break;
	            }
	        };
	        return xhr;
	    },
	    abortRequest: function (xhr) {
	        xhr.onreadystatechange = null;
	        xhr.abort();
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = hooks;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const dispatcher_1 = __webpack_require__(13);
	function hasOnlineConnectionState(connectionState) {
	    return connectionState.type !== "none";
	}
	class NetInfo extends dispatcher_1.default {
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
	            if (this.online === isNowOnline)
	                return;
	            this.online = isNowOnline;
	            if (this.online) {
	                this.emit("online");
	            }
	            else {
	                this.emit("offline");
	            }
	        });
	    }
	    isOnline() {
	        return this.online;
	    }
	}
	exports.NetInfo = NetInfo;
	exports.Network = new NetInfo();


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const logger_1 = __webpack_require__(15);
	const runtime_1 = __webpack_require__(2);
	const url_store_1 = __webpack_require__(27);
	var ajax = function (context, socketId, callback) {
	    var self = this, xhr;
	    xhr = runtime_1.default.createXHR();
	    xhr.open("POST", self.options.authEndpoint, true);
	    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    for (var headerName in this.authOptions.headers) {
	        xhr.setRequestHeader(headerName, this.authOptions.headers[headerName]);
	    }
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4) {
	            if (xhr.status === 200) {
	                var data, parsed = false;
	                try {
	                    data = JSON.parse(xhr.responseText);
	                    parsed = true;
	                }
	                catch (e) {
	                    callback(true, 'JSON returned from webapp was invalid, yet status code was 200. Data was: ' + xhr.responseText);
	                }
	                if (parsed) {
	                    callback(false, data);
	                }
	            }
	            else {
	                var suffix = url_store_1.default.buildLogSuffix("authenticationEndpoint");
	                logger_1.default.warn(`Couldn't retrieve authentication info. ${xhr.status}` +
	                    `Clients must be authenticated to join private or presence channels. ${suffix}`);
	                callback(true, xhr.status);
	            }
	        }
	    };
	    xhr.send(this.composeQuery(socketId));
	    return xhr;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ajax;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	"use strict";
	const urlStore = {
	    baseUrl: "https://pusher.com",
	    urls: {
	        authenticationEndpoint: {
	            path: "/docs/authenticating_users",
	        },
	        javascriptQuickStart: {
	            path: "/docs/javascript_quick_start"
	        },
	    }
	};
	const buildLogSuffix = function (key) {
	    const urlPrefix = "See:";
	    const urlObj = urlStore.urls[key];
	    if (!urlObj)
	        return "";
	    let url;
	    if (urlObj.fullUrl) {
	        url = urlObj.fullUrl;
	    }
	    else if (urlObj.path) {
	        url = urlStore.baseUrl + urlObj.path;
	    }
	    if (!url)
	        return "";
	    return `${urlPrefix} ${url}`;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = { buildLogSuffix: buildLogSuffix };


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const logger_1 = __webpack_require__(15);
	const Collections = __webpack_require__(11);
	const runtime_1 = __webpack_require__(2);
	var getAgent = function (sender, encrypted) {
	    return function (data, callback) {
	        var scheme = "http" + (encrypted ? "s" : "") + "://";
	        var url = scheme + (sender.host || sender.options.host) + sender.options.path;
	        var query = Collections.buildQueryString(data);
	        url += ("/" + 2 + "?" + query);
	        var xhr = runtime_1.default.createXHR();
	        xhr.open("GET", url, true);
	        xhr.onreadystatechange = function () {
	            if (xhr.readyState === 4) {
	                let { status, responseText } = xhr;
	                if (status !== 200) {
	                    logger_1.default.debug(`TimelineSender Error: received ${status} from stats.pusher.com`);
	                    return;
	                }
	                try {
	                    var { host } = JSON.parse(responseText);
	                }
	                catch (e) {
	                    logger_1.default.debug(`TimelineSenderError: invalid response ${responseText}`);
	                }
	                if (host) {
	                    sender.host = host;
	                }
	            }
	        };
	        xhr.send();
	    };
	};
	var xhr = {
	    name: 'xhr',
	    getAgent: getAgent
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = xhr;


/***/ }),
/* 29 */
/***/ (function(module, exports) {

	"use strict";
	const UNSENT = 0;
	const OPENED = 1;
	const HEADERS_RECEIVED = 2;
	const LOADING = 3;
	const DONE = 4;
	const EVENT_READY_STATE_CHANGE = 'readystatechange';
	const EVENT_ERROR = 'error';
	const EVENT_TIMEOUT = 'timeout';
	const EVENT_ABORT = 'abort';
	const HTTP_CODE2TEXT = {
	    100: 'Continue',
	    101: 'Switching Protocol',
	    102: 'Processing',
	    200: 'OK',
	    201: 'Created',
	    202: 'Accepted',
	    203: 'Non-Authoritative Information',
	    204: 'No Content',
	    205: 'Reset Content',
	    206: 'Partial Content',
	    207: 'Multi-Status',
	    208: 'Multi-Status',
	    226: 'IM Used',
	    300: 'Multiple Choice',
	    301: 'Moved Permanently',
	    302: 'Found',
	    303: 'See Other',
	    304: 'Not Modified',
	    305: 'Use Proxy',
	    306: 'unused',
	    307: 'Temporary Redirect',
	    308: 'Permanent Redirect',
	    400: 'Bad Request',
	    401: 'Unauthorized',
	    402: 'Payment Required',
	    403: 'Forbidden',
	    404: 'Not Found',
	    405: 'Method Not Allowed',
	    406: 'Not Acceptable',
	    407: 'Proxy Authentication Required',
	    408: 'Request Timeout',
	    409: 'Conflict',
	    410: 'Gone',
	    411: 'Length Required',
	    412: 'Precondition Failed',
	    413: 'Payload Too Large',
	    414: 'URI Too Long',
	    415: 'Unsupported Media Type',
	    416: 'Requested Range Not Satisfiable',
	    417: 'Expectation Failed',
	    418: "I'm a teapot",
	    421: 'Misdirected Request',
	    422: 'Unprocessable Entity',
	    423: 'Locked',
	    424: 'Failed Dependency',
	    426: 'Upgrade Required',
	    428: 'Precondition Required',
	    429: 'Too Many Requests',
	    431: 'Request Header Fields Too Large',
	    451: 'Unavailable For Legal Reasons',
	    500: 'Internal Server Error',
	    501: 'Not Implemented',
	    502: 'Bad Gateway',
	    503: 'Service Unavailable',
	    504: 'Gateway Timeout',
	    505: 'HTTP Version Not Supported',
	    506: 'Variant Also Negotiates',
	    507: 'Insufficient Storage',
	    508: 'Loop Detected',
	    510: 'Not Extended',
	    511: 'Network Authentication Required'
	};
	const FORBIDDEN_HEADERS = [
	    `Accept-Charset`,
	    `Accept-Encoding`,
	    `Access-Control-Request-Headers`,
	    `Access-Control-Request-Method`,
	    `Connection`,
	    `Content-Length`,
	    `Cookie`,
	    `Cookie2`,
	    `Date`,
	    `DNT`,
	    `Expect`,
	    `Host`,
	    `Keep-Alive`,
	    `Origin`,
	    `Referer`,
	    `TE`,
	    `Trailer`,
	    `Transfer-Encoding`,
	    `Upgrade`,
	    `Via`
	]
	    .map(v => v.toLowerCase())
	    .map(v => v.trim());
	function lowerCaseIfy(headers) {
	    let output = {};
	    for (let header in headers) {
	        if (headers.hasOwnProperty(header)) {
	            output[header.toLowerCase()] = headers[header];
	        }
	    }
	    return output;
	}
	class XMLHttpRequest {
	    constructor() {
	        this.__listeners = {};
	        this.__onabortHandler = (event) => { };
	        this.__onprogressHandler = (event) => { };
	        this.__onloadHandler = (event) => { };
	        this.__onerrorHandler = (event) => { };
	        this.__ontimeoutHandler = (event) => { };
	        this.DONE = DONE;
	        this.LOADING = LOADING;
	        this.HEADERS_RECEIVED = HEADERS_RECEIVED;
	        this.OPENED = OPENED;
	        this.UNSENT = UNSENT;
	        this.name = 'XMLHttpRequest';
	        this.__method = null;
	        this.__async = true;
	        this.__requestHeader = {};
	        this.__responseHeader = {};
	        this.__aborted = false;
	        this.__requestTask = null;
	        this.__readyState = this.UNSENT;
	        this.__onreadystatechangeHandler = (event) => { };
	        this.__withCredentials = true;
	        this.__responseType = '';
	        this.__response = null;
	        this.__responseStatus = 0;
	        this.__timeout = 0;
	        this.__haveTimeout = false;
	        this.__requestDone = false;
	        this.addEventListener(EVENT_READY_STATE_CHANGE, ev => {
	            this.__onreadystatechangeHandler(ev);
	        });
	        this.addEventListener(EVENT_TIMEOUT, ev => {
	            this.__ontimeoutHandler(ev);
	        });
	        this.addEventListener(EVENT_ABORT, ev => {
	            this.__onabortHandler(ev);
	        });
	        this.addEventListener(EVENT_ERROR, ev => {
	            this.__onerrorHandler(ev);
	        });
	    }
	    addEventListener(type, callback) {
	        if (!(type in this.__listeners)) {
	            this.__listeners[type] = [];
	        }
	        this.__listeners[type].push(callback);
	    }
	    removeEventListener(type, callback) {
	        if (!(type in this.__listeners)) {
	            return;
	        }
	        const stack = this.__listeners[type];
	        for (let i = 0, l = stack.length; i < l; i++) {
	            if (stack[i] === callback) {
	                stack.splice(i, 1);
	                return this.removeEventListener(type, callback);
	            }
	        }
	    }
	    dispatchEvent(event) {
	        if (!(event.type in this.__listeners)) {
	            return;
	        }
	        const stack = this.__listeners[event.type];
	        Object.defineProperty(event, 'target', {
	            value: this
	        });
	        Object.defineProperty(event, 'srcElement', {
	            value: this
	        });
	        Object.defineProperty(event, 'currentTarget', {
	            value: this
	        });
	        for (let i = 0, l = stack.length; i < l; i++) {
	            stack[i].call(this, event);
	        }
	    }
	    get onabort() {
	        return this.__onabortHandler || null;
	    }
	    set onabort(func) {
	        this.__onabortHandler = func;
	    }
	    get onerror() {
	        return this.__onerrorHandler || null;
	    }
	    set onerror(func) {
	        this.__onerrorHandler = func;
	    }
	    get onprogress() {
	        return this.__onprogressHandler || null;
	    }
	    set onprogress(func) {
	        this.__onloadHandler = func;
	    }
	    get onload() {
	        return this.__onloadHandler || null;
	    }
	    set onload(func) {
	        this.__onprogressHandler = func;
	    }
	    get ontimeout() {
	        return this.__ontimeoutHandler || null;
	    }
	    set ontimeout(func) {
	        this.__ontimeoutHandler = func;
	    }
	    get readyState() {
	        return this.__readyState;
	    }
	    get onreadystatechange() {
	        return this.__onreadystatechangeHandler;
	    }
	    set onreadystatechange(callback) {
	        this.__onreadystatechangeHandler = callback;
	    }
	    get withCredentials() {
	        return this.__withCredentials;
	    }
	    set withCredentials(value) {
	        this.__withCredentials = value;
	    }
	    get response() {
	        return this.__response;
	    }
	    get responseText() {
	        return typeof this.__response === 'object'
	            ? JSON.stringify(this.__response)
	            : this.__response;
	    }
	    get responseURL() {
	        return this.__url;
	    }
	    get timeout() {
	        return this.__timeout;
	    }
	    set timeout(millisecond) {
	        this.__timeout = millisecond;
	    }
	    get status() {
	        return this.__responseStatus;
	    }
	    get statusText() {
	        return HTTP_CODE2TEXT[this.status] || 'unknown';
	    }
	    get responseType() {
	        return this.__responseType;
	    }
	    overrideMimeType(mimetype) {
	        if (this.readyState >= this.HEADERS_RECEIVED) {
	            throw new Error(`Can not apply 'overrideMimeType' after send data`);
	        }
	    }
	    open(method, url, async = true, user = null, password = null) {
	        if (this.readyState >= this.OPENED) {
	            this.abort();
	            return;
	        }
	        this.__method = method;
	        this.__url = url;
	        this.__async = async;
	        this.__user = user;
	        this.__password = password;
	        this.__readyState = this.OPENED;
	        this.dispatchEvent({ type: EVENT_READY_STATE_CHANGE });
	    }
	    send(data) {
	        if (this.__readyState !== this.OPENED) {
	            throw new Error(`Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.`);
	        }
	        if (this.__aborted === true) {
	            return;
	        }
	        if (this.__requestDone) {
	            return;
	        }
	        let timer = null;
	        if (this.timeout > 0) {
	            timer = setTimeout(() => {
	                if (this.__aborted === true) {
	                    return;
	                }
	                this.__haveTimeout = true;
	                if (this.__requestTask) {
	                    this.__requestTask.abort();
	                }
	                this.dispatchEvent({ type: EVENT_TIMEOUT });
	            }, this.timeout);
	        }
	        this.__requestTask = this.__requestTask = wx.request({
	            url: this.__url,
	            method: this.__method,
	            header: this.__requestHeader,
	            data: data,
	            dataType: 'json',
	            success: res => {
	                if (this.__haveTimeout || this.__aborted)
	                    return;
	                timer && clearTimeout(timer);
	                this.__requestDone = true;
	                this.__requestTask = null;
	                this.__responseStatus = res.statusCode;
	                this.__responseHeader = lowerCaseIfy(res.header);
	                this.__response = res.data === void 0 ? null : res.data;
	                if (this.__responseStatus >= 400) {
	                    this.dispatchEvent({ type: EVENT_ERROR });
	                }
	            },
	            fail: res => {
	                if (this.__haveTimeout || this.__aborted)
	                    return;
	                timer && clearTimeout(timer);
	                this.__requestDone = true;
	                this.__requestTask = null;
	                this.__responseStatus = res.statusCode;
	                this.__responseHeader = lowerCaseIfy(res.header);
	                this.__response = res.data === void 0 ? null : res.data;
	                this.dispatchEvent({ type: EVENT_ERROR });
	            },
	            complete: () => {
	                if (this.__haveTimeout || this.__aborted)
	                    return;
	                this.__readyState = this.HEADERS_RECEIVED;
	                this.dispatchEvent({ type: EVENT_READY_STATE_CHANGE });
	                this.__readyState = this.LOADING;
	                this.dispatchEvent({ type: EVENT_READY_STATE_CHANGE });
	                this.__readyState = this.DONE;
	                this.dispatchEvent({ type: EVENT_READY_STATE_CHANGE });
	            }
	        });
	    }
	    abort() {
	        if (this.__aborted || this.__requestDone) {
	            return;
	        }
	        if (this.__requestTask) {
	            this.__requestTask.abort();
	        }
	        this.__aborted = true;
	        this.dispatchEvent({ type: EVENT_ABORT });
	    }
	    setRequestHeader(header, value) {
	        if (this.readyState < this.OPENED) {
	            throw new Error(`Failed to execute 'setRequestHeader' on 'XMLHttpRequest': The object's state must be OPENED.`);
	        }
	        if (FORBIDDEN_HEADERS.findIndex(v => v.trim() === header) >= 0) {
	            throw new Error(`Invalid header ${header}`);
	        }
	        this.__requestHeader[header] = value + '';
	    }
	    getResponseHeader(header) {
	        const val = this.__responseHeader[header.toLowerCase()];
	        return val !== undefined ? val : null;
	    }
	    getAllResponseHeaders() {
	        const headers = [];
	        const headersObject = lowerCaseIfy(this.__responseHeader);
	        for (let header in headersObject) {
	            if (headersObject.hasOwnProperty(header)) {
	                const value = headersObject[header];
	                headers.push(`${header.toLowerCase()}: ${value}`);
	            }
	        }
	        return headers.join('\n');
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = XMLHttpRequest;


/***/ }),
/* 30 */
/***/ (function(module, exports) {

	"use strict";
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
	    var gloableEventHandler = handler;
	    if (isInitSocketGlobalEvent) {
	        return;
	    }
	    isInitSocketGlobalEvent = true;
	    wx.onSocketOpen(() => {
	        gloableEventHandler('open');
	    });
	    wx.onSocketError((res) => {
	        gloableEventHandler('error', res);
	    });
	    wx.onSocketClose(() => {
	        gloableEventHandler('close');
	    });
	    wx.onSocketMessage((res) => {
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
	            for (var key in ops) {
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
	    socketTask.onClose(() => {
	        handler('close');
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
	    constructor(url) {
	        this.name = 'XMLHttpRequest';
	        this.binaryType = '';
	        this.readyState = CONNECTING;
	        this.$id = 0;
	        this.$options = null;
	        this.$handler = null;
	        this.$socket = null;
	        this.$id = id;
	        this.$options = {
	            url: url,
	            header: {
	                'content-type': 'application/json',
	            },
	            method: 'GET',
	        };
	        this.$handler = (event, res) => {
	            if (event === 'close') {
	                this.readyState = CLOSED;
	            }
	            else if (event === 'open') {
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
	            data: data,
	        });
	    }
	    close(code, reason) {
	        this.readyState = CLOSING;
	        if (!this.$socket) {
	            throw new Error("Failed to execute 'close' on 'WebSocket': instance is undefined.");
	        }
	        this.$socket.close({
	            code: code,
	            reason: reason,
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = WebSocket;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const util_1 = __webpack_require__(8);
	const level_1 = __webpack_require__(32);
	class Timeline {
	    constructor(key, session, options) {
	        this.key = key;
	        this.session = session;
	        this.events = [];
	        this.options = options || {};
	        this.sent = 0;
	        this.uniqueID = 0;
	    }
	    log(level, event) {
	        if (level <= this.options.level) {
	            this.events.push(Collections.extend({}, event, { timestamp: util_1.default.now() }));
	            if (this.options.limit && this.events.length > this.options.limit) {
	                this.events.shift();
	            }
	        }
	    }
	    error(event) {
	        this.log(level_1.default.ERROR, event);
	    }
	    info(event) {
	        this.log(level_1.default.INFO, event);
	    }
	    debug(event) {
	        this.log(level_1.default.DEBUG, event);
	    }
	    isEmpty() {
	        return this.events.length === 0;
	    }
	    send(sendfn, callback) {
	        var data = Collections.extend({
	            session: this.session,
	            bundle: this.sent + 1,
	            key: this.key,
	            lib: "js",
	            version: this.options.version,
	            cluster: this.options.cluster,
	            features: this.options.features,
	            timeline: this.events
	        }, this.options.params);
	        this.events = [];
	        sendfn(data, (error, result) => {
	            if (!error) {
	                this.sent++;
	            }
	            if (callback) {
	                callback(error, result);
	            }
	        });
	        return true;
	    }
	    generateUniqueID() {
	        this.uniqueID++;
	        return this.uniqueID;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Timeline;


/***/ }),
/* 32 */
/***/ (function(module, exports) {

	"use strict";
	var TimelineLevel;
	(function (TimelineLevel) {
	    TimelineLevel[TimelineLevel["ERROR"] = 3] = "ERROR";
	    TimelineLevel[TimelineLevel["INFO"] = 6] = "INFO";
	    TimelineLevel[TimelineLevel["DEBUG"] = 7] = "DEBUG";
	})(TimelineLevel || (TimelineLevel = {}));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = TimelineLevel;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const util_1 = __webpack_require__(8);
	const transport_manager_1 = __webpack_require__(34);
	const Errors = __webpack_require__(45);
	const transport_strategy_1 = __webpack_require__(49);
	const sequential_strategy_1 = __webpack_require__(50);
	const best_connected_ever_strategy_1 = __webpack_require__(51);
	const cached_strategy_1 = __webpack_require__(52);
	const delayed_strategy_1 = __webpack_require__(53);
	const if_strategy_1 = __webpack_require__(54);
	const first_connected_strategy_1 = __webpack_require__(55);
	const runtime_1 = __webpack_require__(2);
	const { Transports } = runtime_1.default;
	exports.build = function (scheme, options) {
	    var context = Collections.extend({}, globalContext, options);
	    return evaluate(scheme, context)[1].strategy;
	};
	var UnsupportedStrategy = {
	    isSupported: function () {
	        return false;
	    },
	    connect: function (_, callback) {
	        var deferred = util_1.default.defer(function () {
	            callback(new Errors.UnsupportedStrategy());
	        });
	        return {
	            abort: function () {
	                deferred.ensureAborted();
	            },
	            forceMinPriority: function () { }
	        };
	    }
	};
	function returnWithOriginalContext(f) {
	    return function (context) {
	        return [f.apply(this, arguments), context];
	    };
	}
	var globalContext = {
	    extend: function (context, first, second) {
	        return [Collections.extend({}, first, second), context];
	    },
	    def: function (context, name, value) {
	        if (context[name] !== undefined) {
	            throw "Redefining symbol " + name;
	        }
	        context[name] = value;
	        return [undefined, context];
	    },
	    def_transport: function (context, name, type, priority, options, manager) {
	        var transportClass = Transports[type];
	        if (!transportClass) {
	            throw new Errors.UnsupportedTransport(type);
	        }
	        var enabled = (!context.enabledTransports ||
	            Collections.arrayIndexOf(context.enabledTransports, name) !== -1) &&
	            (!context.disabledTransports ||
	                Collections.arrayIndexOf(context.disabledTransports, name) === -1);
	        var transport;
	        if (enabled) {
	            transport = new transport_strategy_1.default(name, priority, manager ? manager.getAssistant(transportClass) : transportClass, Collections.extend({
	                key: context.key,
	                encrypted: context.encrypted,
	                timeline: context.timeline,
	                ignoreNullOrigin: context.ignoreNullOrigin
	            }, options));
	        }
	        else {
	            transport = UnsupportedStrategy;
	        }
	        var newContext = context.def(context, name, transport)[1];
	        newContext.Transports = context.Transports || {};
	        newContext.Transports[name] = transport;
	        return [undefined, newContext];
	    },
	    transport_manager: returnWithOriginalContext(function (_, options) {
	        return new transport_manager_1.default(options);
	    }),
	    sequential: returnWithOriginalContext(function (_, options) {
	        var strategies = Array.prototype.slice.call(arguments, 2);
	        return new sequential_strategy_1.default(strategies, options);
	    }),
	    cached: returnWithOriginalContext(function (context, ttl, strategy) {
	        return new cached_strategy_1.default(strategy, context.Transports, {
	            ttl: ttl,
	            timeline: context.timeline,
	            encrypted: context.encrypted
	        });
	    }),
	    first_connected: returnWithOriginalContext(function (_, strategy) {
	        return new first_connected_strategy_1.default(strategy);
	    }),
	    best_connected_ever: returnWithOriginalContext(function () {
	        var strategies = Array.prototype.slice.call(arguments, 1);
	        return new best_connected_ever_strategy_1.default(strategies);
	    }),
	    delayed: returnWithOriginalContext(function (_, delay, strategy) {
	        return new delayed_strategy_1.default(strategy, { delay: delay });
	    }),
	    "if": returnWithOriginalContext(function (_, test, trueBranch, falseBranch) {
	        return new if_strategy_1.default(test, trueBranch, falseBranch);
	    }),
	    is_supported: returnWithOriginalContext(function (_, strategy) {
	        return function () {
	            return strategy.isSupported();
	        };
	    })
	};
	function isSymbol(expression) {
	    return (typeof expression === "string") && expression.charAt(0) === ":";
	}
	function getSymbolValue(expression, context) {
	    return context[expression.slice(1)];
	}
	function evaluateListOfExpressions(expressions, context) {
	    if (expressions.length === 0) {
	        return [[], context];
	    }
	    var head = evaluate(expressions[0], context);
	    var tail = evaluateListOfExpressions(expressions.slice(1), head[1]);
	    return [[head[0]].concat(tail[0]), tail[1]];
	}
	function evaluateString(expression, context) {
	    if (!isSymbol(expression)) {
	        return [expression, context];
	    }
	    var value = getSymbolValue(expression, context);
	    if (value === undefined) {
	        throw "Undefined symbol " + expression;
	    }
	    return [value, context];
	}
	function evaluateArray(expression, context) {
	    if (isSymbol(expression[0])) {
	        var f = getSymbolValue(expression[0], context);
	        if (expression.length > 1) {
	            if (typeof f !== "function") {
	                throw "Calling non-function " + expression[0];
	            }
	            var args = [Collections.extend({}, context)].concat(Collections.map(expression.slice(1), function (arg) {
	                return evaluate(arg, Collections.extend({}, context))[0];
	            }));
	            return f.apply(this, args);
	        }
	        else {
	            return [f, context];
	        }
	    }
	    else {
	        return evaluateListOfExpressions(expression, context);
	    }
	}
	function evaluate(expression, context) {
	    if (typeof expression === "string") {
	        return evaluateString(expression, context);
	    }
	    else if (typeof expression === "object") {
	        if (expression instanceof Array && expression.length > 0) {
	            return evaluateArray(expression, context);
	        }
	    }
	    return [expression, context];
	}


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const factory_1 = __webpack_require__(35);
	class TransportManager {
	    constructor(options) {
	        this.options = options || {};
	        this.livesLeft = this.options.lives || Infinity;
	    }
	    getAssistant(transport) {
	        return factory_1.default.createAssistantToTheTransportManager(this, transport, {
	            minPingDelay: this.options.minPingDelay,
	            maxPingDelay: this.options.maxPingDelay
	        });
	    }
	    isAlive() {
	        return this.livesLeft > 0;
	    }
	    reportDeath() {
	        this.livesLeft -= 1;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = TransportManager;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const assistant_to_the_transport_manager_1 = __webpack_require__(36);
	const handshake_1 = __webpack_require__(37);
	const pusher_authorizer_1 = __webpack_require__(40);
	const timeline_sender_1 = __webpack_require__(41);
	const presence_channel_1 = __webpack_require__(42);
	const private_channel_1 = __webpack_require__(43);
	const channel_1 = __webpack_require__(44);
	const connection_manager_1 = __webpack_require__(47);
	const channels_1 = __webpack_require__(48);
	var Factory = {
	    createChannels() {
	        return new channels_1.default();
	    },
	    createConnectionManager(key, options) {
	        return new connection_manager_1.default(key, options);
	    },
	    createChannel(name, pusher) {
	        return new channel_1.default(name, pusher);
	    },
	    createPrivateChannel(name, pusher) {
	        return new private_channel_1.default(name, pusher);
	    },
	    createPresenceChannel(name, pusher) {
	        return new presence_channel_1.default(name, pusher);
	    },
	    createTimelineSender(timeline, options) {
	        return new timeline_sender_1.default(timeline, options);
	    },
	    createAuthorizer(channel, options) {
	        if (options.authorizer) {
	            return options.authorizer(channel, options);
	        }
	        return new pusher_authorizer_1.default(channel, options);
	    },
	    createHandshake(transport, callback) {
	        return new handshake_1.default(transport, callback);
	    },
	    createAssistantToTheTransportManager(manager, transport, options) {
	        return new assistant_to_the_transport_manager_1.default(manager, transport, options);
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Factory;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const util_1 = __webpack_require__(8);
	const Collections = __webpack_require__(11);
	class AssistantToTheTransportManager {
	    constructor(manager, transport, options) {
	        this.manager = manager;
	        this.transport = transport;
	        this.minPingDelay = options.minPingDelay;
	        this.maxPingDelay = options.maxPingDelay;
	        this.pingDelay = undefined;
	    }
	    createConnection(name, priority, key, options) {
	        options = Collections.extend({}, options, {
	            activityTimeout: this.pingDelay
	        });
	        var connection = this.transport.createConnection(name, priority, key, options);
	        var openTimestamp = null;
	        var onOpen = function () {
	            connection.unbind("open", onOpen);
	            connection.bind("closed", onClosed);
	            openTimestamp = util_1.default.now();
	        };
	        var onClosed = (closeEvent) => {
	            connection.unbind("closed", onClosed);
	            if (closeEvent.code === 1002 || closeEvent.code === 1003) {
	                this.manager.reportDeath();
	            }
	            else if (!closeEvent.wasClean && openTimestamp) {
	                var lifespan = util_1.default.now() - openTimestamp;
	                if (lifespan < 2 * this.maxPingDelay) {
	                    this.manager.reportDeath();
	                    this.pingDelay = Math.max(lifespan / 2, this.minPingDelay);
	                }
	            }
	        };
	        connection.bind("open", onOpen);
	        return connection;
	    }
	    isSupported(environment) {
	        return this.manager.isAlive() && this.transport.isSupported(environment);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AssistantToTheTransportManager;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const Protocol = __webpack_require__(38);
	const connection_1 = __webpack_require__(39);
	class Handshake {
	    constructor(transport, callback) {
	        this.transport = transport;
	        this.callback = callback;
	        this.bindListeners();
	    }
	    close() {
	        this.unbindListeners();
	        this.transport.close();
	    }
	    bindListeners() {
	        this.onMessage = (m) => {
	            this.unbindListeners();
	            var result;
	            try {
	                result = Protocol.processHandshake(m);
	            }
	            catch (e) {
	                this.finish("error", { error: e });
	                this.transport.close();
	                return;
	            }
	            if (result.action === "connected") {
	                this.finish("connected", {
	                    connection: new connection_1.default(result.id, this.transport),
	                    activityTimeout: result.activityTimeout
	                });
	            }
	            else {
	                this.finish(result.action, { error: result.error });
	                this.transport.close();
	            }
	        };
	        this.onClosed = (closeEvent) => {
	            this.unbindListeners();
	            var action = Protocol.getCloseAction(closeEvent) || "backoff";
	            var error = Protocol.getCloseError(closeEvent);
	            this.finish(action, { error: error });
	        };
	        this.transport.bind("message", this.onMessage);
	        this.transport.bind("closed", this.onClosed);
	    }
	    unbindListeners() {
	        this.transport.unbind("message", this.onMessage);
	        this.transport.unbind("closed", this.onClosed);
	    }
	    finish(action, params) {
	        this.callback(Collections.extend({ transport: this.transport, action: action }, params));
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Handshake;


/***/ }),
/* 38 */
/***/ (function(module, exports) {

	"use strict";
	exports.decodeMessage = function (message) {
	    try {
	        var params = JSON.parse(message.data);
	        if (typeof params.data === 'string') {
	            try {
	                params.data = JSON.parse(params.data);
	            }
	            catch (e) {
	                if (!(e instanceof SyntaxError)) {
	                    throw e;
	                }
	            }
	        }
	        return params;
	    }
	    catch (e) {
	        throw { type: 'MessageParseError', error: e, data: message.data };
	    }
	};
	exports.encodeMessage = function (message) {
	    return JSON.stringify(message);
	};
	exports.processHandshake = function (message) {
	    message = exports.decodeMessage(message);
	    if (message.event === "pusher:connection_established") {
	        if (!message.data.activity_timeout) {
	            throw "No activity timeout specified in handshake";
	        }
	        return {
	            action: "connected",
	            id: message.data.socket_id,
	            activityTimeout: message.data.activity_timeout * 1000
	        };
	    }
	    else if (message.event === "pusher:error") {
	        return {
	            action: this.getCloseAction(message.data),
	            error: this.getCloseError(message.data)
	        };
	    }
	    else {
	        throw "Invalid handshake";
	    }
	};
	exports.getCloseAction = function (closeEvent) {
	    if (closeEvent.code < 4000) {
	        if (closeEvent.code >= 1002 && closeEvent.code <= 1004) {
	            return "backoff";
	        }
	        else {
	            return null;
	        }
	    }
	    else if (closeEvent.code === 4000) {
	        return "ssl_only";
	    }
	    else if (closeEvent.code < 4100) {
	        return "refused";
	    }
	    else if (closeEvent.code < 4200) {
	        return "backoff";
	    }
	    else if (closeEvent.code < 4300) {
	        return "retry";
	    }
	    else {
	        return "refused";
	    }
	};
	exports.getCloseError = function (closeEvent) {
	    if (closeEvent.code !== 1000 && closeEvent.code !== 1001) {
	        return {
	            type: 'PusherError',
	            data: {
	                code: closeEvent.code,
	                message: closeEvent.reason || closeEvent.message
	            }
	        };
	    }
	    else {
	        return null;
	    }
	};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const dispatcher_1 = __webpack_require__(13);
	const Protocol = __webpack_require__(38);
	const logger_1 = __webpack_require__(15);
	class Connection extends dispatcher_1.default {
	    constructor(id, transport) {
	        super();
	        this.id = id;
	        this.transport = transport;
	        this.activityTimeout = transport.activityTimeout;
	        this.bindListeners();
	    }
	    handlesActivityChecks() {
	        return this.transport.handlesActivityChecks();
	    }
	    send(data) {
	        return this.transport.send(data);
	    }
	    send_event(name, data, channel) {
	        var message = { event: name, data: data };
	        if (channel) {
	            message.channel = channel;
	        }
	        logger_1.default.debug('Event sent', message);
	        return this.send(Protocol.encodeMessage(message));
	    }
	    ping() {
	        if (this.transport.supportsPing()) {
	            this.transport.ping();
	        }
	        else {
	            this.send_event('pusher:ping', {});
	        }
	    }
	    close() {
	        this.transport.close();
	    }
	    bindListeners() {
	        var listeners = {
	            message: (m) => {
	                var message;
	                try {
	                    message = Protocol.decodeMessage(m);
	                }
	                catch (e) {
	                    this.emit('error', {
	                        type: 'MessageParseError',
	                        error: e,
	                        data: m.data
	                    });
	                }
	                if (message !== undefined) {
	                    logger_1.default.debug('Event recd', message);
	                    switch (message.event) {
	                        case 'pusher:error':
	                            this.emit('error', { type: 'PusherError', data: message.data });
	                            break;
	                        case 'pusher:ping':
	                            this.emit("ping");
	                            break;
	                        case 'pusher:pong':
	                            this.emit("pong");
	                            break;
	                    }
	                    this.emit('message', message);
	                }
	            },
	            activity: () => {
	                this.emit("activity");
	            },
	            error: (error) => {
	                this.emit("error", { type: "WebSocketError", error: error });
	            },
	            closed: (closeEvent) => {
	                unbindListeners();
	                if (closeEvent && closeEvent.code) {
	                    this.handleCloseEvent(closeEvent);
	                }
	                this.transport = null;
	                this.emit("closed");
	            }
	        };
	        var unbindListeners = () => {
	            Collections.objectApply(listeners, (listener, event) => {
	                this.transport.unbind(event, listener);
	            });
	        };
	        Collections.objectApply(listeners, (listener, event) => {
	            this.transport.bind(event, listener);
	        });
	    }
	    handleCloseEvent(closeEvent) {
	        var action = Protocol.getCloseAction(closeEvent);
	        var error = Protocol.getCloseError(closeEvent);
	        if (error) {
	            this.emit('error', error);
	        }
	        if (action) {
	            this.emit(action);
	        }
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Connection;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const runtime_1 = __webpack_require__(2);
	class PusherAuthorizer {
	    constructor(channel, options) {
	        this.channel = channel;
	        let { authTransport } = options;
	        if (typeof runtime_1.default.getAuthorizers()[authTransport] === "undefined") {
	            throw `'${authTransport}' is not a recognized auth transport`;
	        }
	        this.type = authTransport;
	        this.options = options;
	        this.authOptions = (options || {}).auth || {};
	    }
	    composeQuery(socketId) {
	        var query = 'socket_id=' + encodeURIComponent(socketId) +
	            '&channel_name=' + encodeURIComponent(this.channel.name);
	        for (var i in this.authOptions.params) {
	            query += "&" + encodeURIComponent(i) + "=" + encodeURIComponent(this.authOptions.params[i]);
	        }
	        return query;
	    }
	    authorize(socketId, callback) {
	        PusherAuthorizer.authorizers = PusherAuthorizer.authorizers || runtime_1.default.getAuthorizers();
	        return PusherAuthorizer.authorizers[this.type].call(this, runtime_1.default, socketId, callback);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PusherAuthorizer;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const runtime_1 = __webpack_require__(2);
	class TimelineSender {
	    constructor(timeline, options) {
	        this.timeline = timeline;
	        this.options = options || {};
	    }
	    send(encrypted, callback) {
	        if (this.timeline.isEmpty()) {
	            return;
	        }
	        this.timeline.send(runtime_1.default.TimelineTransport.getAgent(this, encrypted), callback);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = TimelineSender;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const private_channel_1 = __webpack_require__(43);
	const logger_1 = __webpack_require__(15);
	const members_1 = __webpack_require__(46);
	const url_store_1 = __webpack_require__(27);
	class PresenceChannel extends private_channel_1.default {
	    constructor(name, pusher) {
	        super(name, pusher);
	        this.members = new members_1.default();
	    }
	    authorize(socketId, callback) {
	        super.authorize(socketId, (error, authData) => {
	            if (!error) {
	                if (authData.channel_data === undefined) {
	                    let suffix = url_store_1.default.buildLogSuffix("authenticationEndpoint");
	                    logger_1.default.warn(`Invalid auth response for channel '${this.name}',` +
	                        `expected 'channel_data' field. ${suffix}`);
	                    callback("Invalid auth response");
	                    return;
	                }
	                var channelData = JSON.parse(authData.channel_data);
	                this.members.setMyID(channelData.user_id);
	            }
	            callback(error, authData);
	        });
	    }
	    handleEvent(event, data) {
	        switch (event) {
	            case "pusher_internal:subscription_succeeded":
	                this.subscriptionPending = false;
	                this.subscribed = true;
	                if (this.subscriptionCancelled) {
	                    this.pusher.unsubscribe(this.name);
	                }
	                else {
	                    this.members.onSubscription(data);
	                    this.emit("pusher:subscription_succeeded", this.members);
	                }
	                break;
	            case "pusher_internal:member_added":
	                var addedMember = this.members.addMember(data);
	                this.emit('pusher:member_added', addedMember);
	                break;
	            case "pusher_internal:member_removed":
	                var removedMember = this.members.removeMember(data);
	                if (removedMember) {
	                    this.emit('pusher:member_removed', removedMember);
	                }
	                break;
	            default:
	                private_channel_1.default.prototype.handleEvent.call(this, event, data);
	        }
	    }
	    disconnect() {
	        this.members.reset();
	        super.disconnect();
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PresenceChannel;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const factory_1 = __webpack_require__(35);
	const channel_1 = __webpack_require__(44);
	class PrivateChannel extends channel_1.default {
	    authorize(socketId, callback) {
	        var authorizer = factory_1.default.createAuthorizer(this, this.pusher.config);
	        return authorizer.authorize(socketId, callback);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PrivateChannel;


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const dispatcher_1 = __webpack_require__(13);
	const Errors = __webpack_require__(45);
	const logger_1 = __webpack_require__(15);
	class Channel extends dispatcher_1.default {
	    constructor(name, pusher) {
	        super(function (event, data) {
	            logger_1.default.debug('No callbacks on ' + name + ' for ' + event);
	        });
	        this.name = name;
	        this.pusher = pusher;
	        this.subscribed = false;
	        this.subscriptionPending = false;
	        this.subscriptionCancelled = false;
	    }
	    authorize(socketId, callback) {
	        return callback(false, {});
	    }
	    trigger(event, data) {
	        if (event.indexOf("client-") !== 0) {
	            throw new Errors.BadEventName("Event '" + event + "' does not start with 'client-'");
	        }
	        return this.pusher.send_event(event, data, this.name);
	    }
	    disconnect() {
	        this.subscribed = false;
	        this.subscriptionPending = false;
	    }
	    handleEvent(event, data) {
	        if (event.indexOf("pusher_internal:") === 0) {
	            if (event === "pusher_internal:subscription_succeeded") {
	                this.subscriptionPending = false;
	                this.subscribed = true;
	                if (this.subscriptionCancelled) {
	                    this.pusher.unsubscribe(this.name);
	                }
	                else {
	                    this.emit("pusher:subscription_succeeded", data);
	                }
	            }
	        }
	        else {
	            this.emit(event, data);
	        }
	    }
	    subscribe() {
	        if (this.subscribed) {
	            return;
	        }
	        this.subscriptionPending = true;
	        this.subscriptionCancelled = false;
	        this.authorize(this.pusher.connection.socket_id, (error, data) => {
	            if (error) {
	                this.handleEvent('pusher:subscription_error', data);
	            }
	            else {
	                this.pusher.send_event('pusher:subscribe', {
	                    auth: data.auth,
	                    channel_data: data.channel_data,
	                    channel: this.name
	                });
	            }
	        });
	    }
	    unsubscribe() {
	        this.subscribed = false;
	        this.pusher.send_event('pusher:unsubscribe', {
	            channel: this.name
	        });
	    }
	    cancelSubscription() {
	        this.subscriptionCancelled = true;
	    }
	    reinstateSubscription() {
	        this.subscriptionCancelled = false;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Channel;


/***/ }),
/* 45 */
/***/ (function(module, exports) {

	"use strict";
	class BadEventName extends Error {
	}
	exports.BadEventName = BadEventName;
	class RequestTimedOut extends Error {
	}
	exports.RequestTimedOut = RequestTimedOut;
	class TransportPriorityTooLow extends Error {
	}
	exports.TransportPriorityTooLow = TransportPriorityTooLow;
	class TransportClosed extends Error {
	}
	exports.TransportClosed = TransportClosed;
	class UnsupportedTransport extends Error {
	}
	exports.UnsupportedTransport = UnsupportedTransport;
	class UnsupportedStrategy extends Error {
	}
	exports.UnsupportedStrategy = UnsupportedStrategy;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	class Members {
	    constructor() {
	        this.reset();
	    }
	    get(id) {
	        if (Object.prototype.hasOwnProperty.call(this.members, id)) {
	            return {
	                id: id,
	                info: this.members[id]
	            };
	        }
	        else {
	            return null;
	        }
	    }
	    each(callback) {
	        Collections.objectApply(this.members, (member, id) => {
	            callback(this.get(id));
	        });
	    }
	    setMyID(id) {
	        this.myID = id;
	    }
	    onSubscription(subscriptionData) {
	        this.members = subscriptionData.presence.hash;
	        this.count = subscriptionData.presence.count;
	        this.me = this.get(this.myID);
	    }
	    addMember(memberData) {
	        if (this.get(memberData.user_id) === null) {
	            this.count++;
	        }
	        this.members[memberData.user_id] = memberData.user_info;
	        return this.get(memberData.user_id);
	    }
	    removeMember(memberData) {
	        var member = this.get(memberData.user_id);
	        if (member) {
	            delete this.members[memberData.user_id];
	            this.count--;
	        }
	        return member;
	    }
	    reset() {
	        this.members = {};
	        this.count = 0;
	        this.myID = null;
	        this.me = null;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Members;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const dispatcher_1 = __webpack_require__(13);
	const timers_1 = __webpack_require__(9);
	const logger_1 = __webpack_require__(15);
	const Collections = __webpack_require__(11);
	const runtime_1 = __webpack_require__(2);
	class ConnectionManager extends dispatcher_1.default {
	    constructor(key, options) {
	        super();
	        this.key = key;
	        this.options = options || {};
	        this.state = "initialized";
	        this.connection = null;
	        this.encrypted = !!options.encrypted;
	        this.timeline = this.options.timeline;
	        this.connectionCallbacks = this.buildConnectionCallbacks();
	        this.errorCallbacks = this.buildErrorCallbacks();
	        this.handshakeCallbacks = this.buildHandshakeCallbacks(this.errorCallbacks);
	        var Network = runtime_1.default.getNetwork();
	        Network.bind("online", () => {
	            this.timeline.info({ netinfo: "online" });
	            if (this.state === "connecting" || this.state === "unavailable") {
	                this.retryIn(0);
	            }
	        });
	        Network.bind("offline", () => {
	            this.timeline.info({ netinfo: "offline" });
	            if (this.connection) {
	                this.sendActivityCheck();
	            }
	        });
	        this.updateStrategy();
	    }
	    connect() {
	        if (this.connection || this.runner) {
	            return;
	        }
	        if (!this.strategy.isSupported()) {
	            this.updateState("failed");
	            return;
	        }
	        this.updateState("connecting");
	        this.startConnecting();
	        this.setUnavailableTimer();
	    }
	    ;
	    send(data) {
	        if (this.connection) {
	            return this.connection.send(data);
	        }
	        else {
	            return false;
	        }
	    }
	    ;
	    send_event(name, data, channel) {
	        if (this.connection) {
	            return this.connection.send_event(name, data, channel);
	        }
	        else {
	            return false;
	        }
	    }
	    ;
	    disconnect() {
	        this.disconnectInternally();
	        this.updateState("disconnected");
	    }
	    ;
	    isEncrypted() {
	        return this.encrypted;
	    }
	    ;
	    startConnecting() {
	        var callback = (error, handshake) => {
	            if (error) {
	                this.runner = this.strategy.connect(0, callback);
	            }
	            else {
	                if (handshake.action === "error") {
	                    this.emit("error", { type: "HandshakeError", error: handshake.error });
	                    this.timeline.error({ handshakeError: handshake.error });
	                }
	                else {
	                    this.abortConnecting();
	                    this.handshakeCallbacks[handshake.action](handshake);
	                }
	            }
	        };
	        this.runner = this.strategy.connect(0, callback);
	    }
	    ;
	    abortConnecting() {
	        if (this.runner) {
	            this.runner.abort();
	            this.runner = null;
	        }
	    }
	    ;
	    disconnectInternally() {
	        this.abortConnecting();
	        this.clearRetryTimer();
	        this.clearUnavailableTimer();
	        if (this.connection) {
	            var connection = this.abandonConnection();
	            connection.close();
	        }
	    }
	    ;
	    updateStrategy() {
	        this.strategy = this.options.getStrategy({
	            key: this.key,
	            timeline: this.timeline,
	            encrypted: this.encrypted
	        });
	    }
	    ;
	    retryIn(delay) {
	        this.timeline.info({ action: "retry", delay: delay });
	        if (delay > 0) {
	            this.emit("connecting_in", Math.round(delay / 1000));
	        }
	        this.retryTimer = new timers_1.OneOffTimer(delay || 0, () => {
	            this.disconnectInternally();
	            this.connect();
	        });
	    }
	    ;
	    clearRetryTimer() {
	        if (this.retryTimer) {
	            this.retryTimer.ensureAborted();
	            this.retryTimer = null;
	        }
	    }
	    ;
	    setUnavailableTimer() {
	        this.unavailableTimer = new timers_1.OneOffTimer(this.options.unavailableTimeout, () => {
	            this.updateState("unavailable");
	        });
	    }
	    ;
	    clearUnavailableTimer() {
	        if (this.unavailableTimer) {
	            this.unavailableTimer.ensureAborted();
	        }
	    }
	    ;
	    sendActivityCheck() {
	        this.stopActivityCheck();
	        this.connection.ping();
	        this.activityTimer = new timers_1.OneOffTimer(this.options.pongTimeout, () => {
	            this.timeline.error({ pong_timed_out: this.options.pongTimeout });
	            this.retryIn(0);
	        });
	    }
	    ;
	    resetActivityCheck() {
	        this.stopActivityCheck();
	        if (this.connection && !this.connection.handlesActivityChecks()) {
	            this.activityTimer = new timers_1.OneOffTimer(this.activityTimeout, () => {
	                this.sendActivityCheck();
	            });
	        }
	    }
	    ;
	    stopActivityCheck() {
	        if (this.activityTimer) {
	            this.activityTimer.ensureAborted();
	        }
	    }
	    ;
	    buildConnectionCallbacks() {
	        return {
	            message: (message) => {
	                this.resetActivityCheck();
	                this.emit('message', message);
	            },
	            ping: () => {
	                this.send_event('pusher:pong', {});
	            },
	            activity: () => {
	                this.resetActivityCheck();
	            },
	            error: (error) => {
	                this.emit("error", { type: "WebSocketError", error: error });
	            },
	            closed: () => {
	                this.abandonConnection();
	                if (this.shouldRetry()) {
	                    this.retryIn(1000);
	                }
	            }
	        };
	    }
	    ;
	    buildHandshakeCallbacks(errorCallbacks) {
	        return Collections.extend({}, errorCallbacks, {
	            connected: (handshake) => {
	                this.activityTimeout = Math.min(this.options.activityTimeout, handshake.activityTimeout, handshake.connection.activityTimeout || Infinity);
	                this.clearUnavailableTimer();
	                this.setConnection(handshake.connection);
	                this.socket_id = this.connection.id;
	                this.updateState("connected", { socket_id: this.socket_id });
	            }
	        });
	    }
	    ;
	    buildErrorCallbacks() {
	        let withErrorEmitted = (callback) => {
	            return (result) => {
	                if (result.error) {
	                    this.emit("error", { type: "WebSocketError", error: result.error });
	                }
	                callback(result);
	            };
	        };
	        return {
	            ssl_only: withErrorEmitted(() => {
	                this.encrypted = true;
	                this.updateStrategy();
	                this.retryIn(0);
	            }),
	            refused: withErrorEmitted(() => {
	                this.disconnect();
	            }),
	            backoff: withErrorEmitted(() => {
	                this.retryIn(1000);
	            }),
	            retry: withErrorEmitted(() => {
	                this.retryIn(0);
	            })
	        };
	    }
	    ;
	    setConnection(connection) {
	        this.connection = connection;
	        for (var event in this.connectionCallbacks) {
	            this.connection.bind(event, this.connectionCallbacks[event]);
	        }
	        this.resetActivityCheck();
	    }
	    ;
	    abandonConnection() {
	        if (!this.connection) {
	            return;
	        }
	        this.stopActivityCheck();
	        for (var event in this.connectionCallbacks) {
	            this.connection.unbind(event, this.connectionCallbacks[event]);
	        }
	        var connection = this.connection;
	        this.connection = null;
	        return connection;
	    }
	    updateState(newState, data) {
	        var previousState = this.state;
	        this.state = newState;
	        if (previousState !== newState) {
	            var newStateDescription = newState;
	            if (newStateDescription === "connected") {
	                newStateDescription += " with new socket ID " + data.socket_id;
	            }
	            logger_1.default.debug('State changed', previousState + ' -> ' + newStateDescription);
	            this.timeline.info({ state: newState, params: data });
	            this.emit('state_change', { previous: previousState, current: newState });
	            this.emit(newState, data);
	        }
	    }
	    shouldRetry() {
	        return this.state === "connecting" || this.state === "connected";
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ConnectionManager;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const factory_1 = __webpack_require__(35);
	class Channels {
	    constructor() {
	        this.channels = {};
	    }
	    add(name, pusher) {
	        if (!this.channels[name]) {
	            this.channels[name] = createChannel(name, pusher);
	        }
	        return this.channels[name];
	    }
	    all() {
	        return Collections.values(this.channels);
	    }
	    find(name) {
	        return this.channels[name];
	    }
	    remove(name) {
	        var channel = this.channels[name];
	        delete this.channels[name];
	        return channel;
	    }
	    disconnect() {
	        Collections.objectApply(this.channels, function (channel) {
	            channel.disconnect();
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Channels;
	function createChannel(name, pusher) {
	    if (name.indexOf('private-') === 0) {
	        return factory_1.default.createPrivateChannel(name, pusher);
	    }
	    else if (name.indexOf('presence-') === 0) {
	        return factory_1.default.createPresenceChannel(name, pusher);
	    }
	    else {
	        return factory_1.default.createChannel(name, pusher);
	    }
	}


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const factory_1 = __webpack_require__(35);
	const util_1 = __webpack_require__(8);
	const Errors = __webpack_require__(45);
	const Collections = __webpack_require__(11);
	class TransportStrategy {
	    constructor(name, priority, transport, options) {
	        this.name = name;
	        this.priority = priority;
	        this.transport = transport;
	        this.options = options || {};
	    }
	    isSupported() {
	        return this.transport.isSupported({
	            encrypted: this.options.encrypted
	        });
	    }
	    connect(minPriority, callback) {
	        if (!this.isSupported()) {
	            return failAttempt(new Errors.UnsupportedStrategy(), callback);
	        }
	        else if (this.priority < minPriority) {
	            return failAttempt(new Errors.TransportPriorityTooLow(), callback);
	        }
	        var connected = false;
	        var transport = this.transport.createConnection(this.name, this.priority, this.options.key, this.options);
	        var handshake = null;
	        var onInitialized = function () {
	            transport.unbind("initialized", onInitialized);
	            transport.connect();
	        };
	        var onOpen = function () {
	            handshake = factory_1.default.createHandshake(transport, function (result) {
	                connected = true;
	                unbindListeners();
	                callback(null, result);
	            });
	        };
	        var onError = function (error) {
	            unbindListeners();
	            callback(error);
	        };
	        var onClosed = function () {
	            unbindListeners();
	            var serializedTransport;
	            serializedTransport = Collections.safeJSONStringify(transport);
	            callback(new Errors.TransportClosed(serializedTransport));
	        };
	        var unbindListeners = function () {
	            transport.unbind("initialized", onInitialized);
	            transport.unbind("open", onOpen);
	            transport.unbind("error", onError);
	            transport.unbind("closed", onClosed);
	        };
	        transport.bind("initialized", onInitialized);
	        transport.bind("open", onOpen);
	        transport.bind("error", onError);
	        transport.bind("closed", onClosed);
	        transport.initialize();
	        return {
	            abort: () => {
	                if (connected) {
	                    return;
	                }
	                unbindListeners();
	                if (handshake) {
	                    handshake.close();
	                }
	                else {
	                    transport.close();
	                }
	            },
	            forceMinPriority: (p) => {
	                if (connected) {
	                    return;
	                }
	                if (this.priority < p) {
	                    if (handshake) {
	                        handshake.close();
	                    }
	                    else {
	                        transport.close();
	                    }
	                }
	            }
	        };
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = TransportStrategy;
	function failAttempt(error, callback) {
	    util_1.default.defer(function () {
	        callback(error);
	    });
	    return {
	        abort: function () { },
	        forceMinPriority: function () { }
	    };
	}


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const util_1 = __webpack_require__(8);
	const timers_1 = __webpack_require__(9);
	class SequentialStrategy {
	    constructor(strategies, options) {
	        this.strategies = strategies;
	        this.loop = Boolean(options.loop);
	        this.failFast = Boolean(options.failFast);
	        this.timeout = options.timeout;
	        this.timeoutLimit = options.timeoutLimit;
	    }
	    isSupported() {
	        return Collections.any(this.strategies, util_1.default.method("isSupported"));
	    }
	    connect(minPriority, callback) {
	        var strategies = this.strategies;
	        var current = 0;
	        var timeout = this.timeout;
	        var runner = null;
	        var tryNextStrategy = (error, handshake) => {
	            if (handshake) {
	                callback(null, handshake);
	            }
	            else {
	                current = current + 1;
	                if (this.loop) {
	                    current = current % strategies.length;
	                }
	                if (current < strategies.length) {
	                    if (timeout) {
	                        timeout = timeout * 2;
	                        if (this.timeoutLimit) {
	                            timeout = Math.min(timeout, this.timeoutLimit);
	                        }
	                    }
	                    runner = this.tryStrategy(strategies[current], minPriority, { timeout: timeout, failFast: this.failFast }, tryNextStrategy);
	                }
	                else {
	                    callback(true);
	                }
	            }
	        };
	        runner = this.tryStrategy(strategies[current], minPriority, { timeout: timeout, failFast: this.failFast }, tryNextStrategy);
	        return {
	            abort: function () {
	                runner.abort();
	            },
	            forceMinPriority: function (p) {
	                minPriority = p;
	                if (runner) {
	                    runner.forceMinPriority(p);
	                }
	            }
	        };
	    }
	    tryStrategy(strategy, minPriority, options, callback) {
	        var timer = null;
	        var runner = null;
	        if (options.timeout > 0) {
	            timer = new timers_1.OneOffTimer(options.timeout, function () {
	                runner.abort();
	                callback(true);
	            });
	        }
	        runner = strategy.connect(minPriority, function (error, handshake) {
	            if (error && timer && timer.isRunning() && !options.failFast) {
	                return;
	            }
	            if (timer) {
	                timer.ensureAborted();
	            }
	            callback(error, handshake);
	        });
	        return {
	            abort: function () {
	                if (timer) {
	                    timer.ensureAborted();
	                }
	                runner.abort();
	            },
	            forceMinPriority: function (p) {
	                runner.forceMinPriority(p);
	            }
	        };
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SequentialStrategy;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const Collections = __webpack_require__(11);
	const util_1 = __webpack_require__(8);
	class BestConnectedEverStrategy {
	    constructor(strategies) {
	        this.strategies = strategies;
	    }
	    isSupported() {
	        return Collections.any(this.strategies, util_1.default.method("isSupported"));
	    }
	    connect(minPriority, callback) {
	        return connect(this.strategies, minPriority, function (i, runners) {
	            return function (error, handshake) {
	                runners[i].error = error;
	                if (error) {
	                    if (allRunnersFailed(runners)) {
	                        callback(true);
	                    }
	                    return;
	                }
	                Collections.apply(runners, function (runner) {
	                    runner.forceMinPriority(handshake.transport.priority);
	                });
	                callback(null, handshake);
	            };
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = BestConnectedEverStrategy;
	function connect(strategies, minPriority, callbackBuilder) {
	    var runners = Collections.map(strategies, function (strategy, i, _, rs) {
	        return strategy.connect(minPriority, callbackBuilder(i, rs));
	    });
	    return {
	        abort: function () {
	            Collections.apply(runners, abortRunner);
	        },
	        forceMinPriority: function (p) {
	            Collections.apply(runners, function (runner) {
	                runner.forceMinPriority(p);
	            });
	        }
	    };
	}
	function allRunnersFailed(runners) {
	    return Collections.all(runners, function (runner) {
	        return Boolean(runner.error);
	    });
	}
	function abortRunner(runner) {
	    if (!runner.error && !runner.aborted) {
	        runner.abort();
	        runner.aborted = true;
	    }
	}


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const util_1 = __webpack_require__(8);
	const runtime_1 = __webpack_require__(2);
	const sequential_strategy_1 = __webpack_require__(50);
	const Collections = __webpack_require__(11);
	class CachedStrategy {
	    constructor(strategy, transports, options) {
	        this.strategy = strategy;
	        this.transports = transports;
	        this.ttl = options.ttl || 1800 * 1000;
	        this.encrypted = options.encrypted;
	        this.timeline = options.timeline;
	    }
	    isSupported() {
	        return this.strategy.isSupported();
	    }
	    connect(minPriority, callback) {
	        var encrypted = this.encrypted;
	        var info = fetchTransportCache(encrypted);
	        var strategies = [this.strategy];
	        if (info && info.timestamp + this.ttl >= util_1.default.now()) {
	            var transport = this.transports[info.transport];
	            if (transport) {
	                this.timeline.info({
	                    cached: true,
	                    transport: info.transport,
	                    latency: info.latency
	                });
	                strategies.push(new sequential_strategy_1.default([transport], {
	                    timeout: info.latency * 2 + 1000,
	                    failFast: true
	                }));
	            }
	        }
	        var startTimestamp = util_1.default.now();
	        var runner = strategies.pop().connect(minPriority, function cb(error, handshake) {
	            if (error) {
	                flushTransportCache(encrypted);
	                if (strategies.length > 0) {
	                    startTimestamp = util_1.default.now();
	                    runner = strategies.pop().connect(minPriority, cb);
	                }
	                else {
	                    callback(error);
	                }
	            }
	            else {
	                storeTransportCache(encrypted, handshake.transport.name, util_1.default.now() - startTimestamp);
	                callback(null, handshake);
	            }
	        });
	        return {
	            abort: function () {
	                runner.abort();
	            },
	            forceMinPriority: function (p) {
	                minPriority = p;
	                if (runner) {
	                    runner.forceMinPriority(p);
	                }
	            }
	        };
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = CachedStrategy;
	function getTransportCacheKey(encrypted) {
	    return "pusherTransport" + (encrypted ? "Encrypted" : "Unencrypted");
	}
	function fetchTransportCache(encrypted) {
	    var storage = runtime_1.default.getLocalStorage();
	    if (storage) {
	        try {
	            var serializedCache = storage[getTransportCacheKey(encrypted)];
	            if (serializedCache) {
	                return JSON.parse(serializedCache);
	            }
	        }
	        catch (e) {
	            flushTransportCache(encrypted);
	        }
	    }
	    return null;
	}
	function storeTransportCache(encrypted, transport, latency) {
	    var storage = runtime_1.default.getLocalStorage();
	    if (storage) {
	        try {
	            storage[getTransportCacheKey(encrypted)] = Collections.safeJSONStringify({
	                timestamp: util_1.default.now(),
	                transport: transport,
	                latency: latency
	            });
	        }
	        catch (e) {
	        }
	    }
	}
	function flushTransportCache(encrypted) {
	    var storage = runtime_1.default.getLocalStorage();
	    if (storage) {
	        try {
	            delete storage[getTransportCacheKey(encrypted)];
	        }
	        catch (e) {
	        }
	    }
	}


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const timers_1 = __webpack_require__(9);
	class DelayedStrategy {
	    constructor(strategy, { delay: number }) {
	        this.strategy = strategy;
	        this.options = { delay: number };
	    }
	    isSupported() {
	        return this.strategy.isSupported();
	    }
	    connect(minPriority, callback) {
	        var strategy = this.strategy;
	        var runner;
	        var timer = new timers_1.OneOffTimer(this.options.delay, function () {
	            runner = strategy.connect(minPriority, callback);
	        });
	        return {
	            abort: function () {
	                timer.ensureAborted();
	                if (runner) {
	                    runner.abort();
	                }
	            },
	            forceMinPriority: function (p) {
	                minPriority = p;
	                if (runner) {
	                    runner.forceMinPriority(p);
	                }
	            }
	        };
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = DelayedStrategy;


/***/ }),
/* 54 */
/***/ (function(module, exports) {

	"use strict";
	class IfStrategy {
	    constructor(test, trueBranch, falseBranch) {
	        this.test = test;
	        this.trueBranch = trueBranch;
	        this.falseBranch = falseBranch;
	    }
	    isSupported() {
	        var branch = this.test() ? this.trueBranch : this.falseBranch;
	        return branch.isSupported();
	    }
	    connect(minPriority, callback) {
	        var branch = this.test() ? this.trueBranch : this.falseBranch;
	        return branch.connect(minPriority, callback);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = IfStrategy;


/***/ }),
/* 55 */
/***/ (function(module, exports) {

	"use strict";
	class FirstConnectedStrategy {
	    constructor(strategy) {
	        this.strategy = strategy;
	    }
	    isSupported() {
	        return this.strategy.isSupported();
	    }
	    connect(minPriority, callback) {
	        var runner = this.strategy.connect(minPriority, function (error, handshake) {
	            if (handshake) {
	                runner.abort();
	            }
	            callback(error, handshake);
	        });
	        return runner;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = FirstConnectedStrategy;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	const defaults_1 = __webpack_require__(5);
	exports.getGlobalConfig = function () {
	    return {
	        wsHost: defaults_1.default.host,
	        wsPort: defaults_1.default.ws_port,
	        wssPort: defaults_1.default.wss_port,
	        wsPath: defaults_1.default.ws_path,
	        httpHost: defaults_1.default.sockjs_host,
	        httpPort: defaults_1.default.sockjs_http_port,
	        httpsPort: defaults_1.default.sockjs_https_port,
	        httpPath: defaults_1.default.sockjs_path,
	        statsHost: defaults_1.default.stats_host,
	        authEndpoint: defaults_1.default.channel_auth_endpoint,
	        authTransport: defaults_1.default.channel_auth_transport,
	        activity_timeout: defaults_1.default.activity_timeout,
	        pong_timeout: defaults_1.default.pong_timeout,
	        unavailable_timeout: defaults_1.default.unavailable_timeout
	    };
	};
	exports.getClusterConfig = function (clusterName) {
	    return {
	        wsHost: "ws-" + clusterName + ".pusher.com",
	        httpHost: "sockjs-" + clusterName + ".pusher.com"
	    };
	};


/***/ })
/******/ ]);