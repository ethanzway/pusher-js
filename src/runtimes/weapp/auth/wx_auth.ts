import Logger from 'core/logger';
import {AuthTransport} from 'core/auth/auth_transports';
import AbstractRuntime from 'runtimes/interface';
import UrlStore from 'core/utils/url_store';

var request : AuthTransport = function(context : AbstractRuntime, socketId, callback){
  var self = this, task, header;

  header["Content-Type"] = "application/x-www-form-urlencoded";
  for(var headerName in this.authOptions.headers) {
    header[headerName] = this.authOptions.headers[headerName];
  }

  task = wx.request({
    url: self.options.authEndpoint,
    method: 'POST',
    data: this.composeQuery(socketId),
    dataType: 'text',
    responseType: 'text',
    header: header,
    success: function (data, statusCode) {
      if (statusCode === 200) {
        var data, parsed = false;

        try {
          data = JSON.parse(data);
          parsed = true;
        } catch (e) {
          callback(true, 'JSON returned from webapp was invalid, yet status code was 200. Data was: ' + data);
        }

        if (parsed) { // prevents double execution.
          callback(false, data);
        }
      } else {
        var suffix = UrlStore.buildLogSuffix("authenticationEndpoint");
        Logger.warn(
          `Couldn't retrieve authentication info. ${statusCode}` +
          `Clients must be authenticated to join private or presence channels. ${suffix}`
        );
        callback(true, statusCode);
      }
    }
  });

  return task;
}

export default request;
