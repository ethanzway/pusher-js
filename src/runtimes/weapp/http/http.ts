import HTTPRequest from "core/http/http_request";
import HTTPSocket from "core/http/http_socket";
import SocketHooks from "core/http/socket_hooks";
import RequestHooks from "core/http/request_hooks";
import streamingHooks from 'core/http/http_streaming_socket';
import pollingHooks from 'core/http/http_polling_socket';
import wxHooks from './http_wx_request';
import HTTPFactory from 'core/http/http_factory';

var HTTP : HTTPFactory = {

  createStreamingSocket(url : string) : HTTPSocket {
    return this.createSocket(streamingHooks, url);
  },

  createPollingSocket(url : string) : HTTPSocket {
    return this.createSocket(pollingHooks, url);
  },

  createSocket(hooks : SocketHooks, url : string) : HTTPSocket {
    return new HTTPSocket(hooks, url);
  },

  createXHR(method : string, url : string) : HTTPRequest {
    return this.createRequest(wxHooks, method, url);
  },

  createRequest(hooks : RequestHooks, method : string, url : string) : HTTPRequest {
    return new HTTPRequest(hooks, method, url);
  }
}

export default HTTP;
