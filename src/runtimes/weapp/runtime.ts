import Runtime from "../interface";
import * as Collections from 'core/utils/collections';
import Transports from "weapp/transports/transports";
import TimelineSender from 'core/timeline/timeline_sender';
import Ajax from 'core/http/ajax';
import getDefaultStrategy from './default_strategy';
import TransportsTable from "core/transports/transports_table";
import transportConnectionInitializer from './transports/transport_connection_initializer';
import HTTPFactory from './http/http';
import {Network} from './net_info';
import xhrAuth from 'weapp/auth/xhr_auth';
import {AuthTransports} from 'core/auth/auth_transports';
import xhrTimeline from 'weapp/timeline/xhr_timeline';
import XMLHttpRequest from './http/http_wx_xhr';
import WebSocket from './http/http_wx_websocket';

var Weapp : Runtime = {
  getDefaultStrategy,
  Transports: <TransportsTable> Transports,
  transportConnectionInitializer,
  HTTPFactory,

  setup(PusherClass) : void {
    PusherClass.ready();
  },

  getLocalStorage() : any {
    return undefined;
  },

  getProtocol() : string {
    return "http:";
  },

  isXHRSupported() : boolean {
    return true;
  },

  createSocketRequest(method : string, url : string) {
    return this.HTTPFactory.createXHR(method, url);
  },

  createXHR() : Ajax {
    var Constructor = this.getXHRAPI();
    return new Constructor();
  },

  createWebSocket(url : string) : any {
    var Constructor = this.getWebSocketAPI();
    return new Constructor(url);
  },

  addUnloadListener(listener : any) {},
  removeUnloadListener(listener : any) {},

  TimelineTransport: xhrTimeline,

  getAuthorizers() : AuthTransports {
    return {ajax: xhrAuth};
  },

  getWebSocketAPI() {
    return WebSocket;
  },

  getXHRAPI() {
    return XMLHttpRequest;
  },

  getNetwork() {
    return Network;
  }
}

export default Weapp;
