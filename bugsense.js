Bugsense = {
    notify: function (b) {
        var e = this;
        this.notice = b;
        this.status = (this.notice && this.notice.request && this.notice.request.status).toString();
        this.errors = this.notice && this.notice.request && this.notice.request.errors;
        b = this.notice.request || {
            message: "Unknown Error"
        };
        var h = this.notice.response && this.notice.response.stack;
        this.defaults = {
            apiKey: "<insert_you_bugsense_key>",
            url: "https://bugsense.appspot.com/api/errors?api_key="
        };

        this.data = {
          application_environment: {
              appver: window.navigator.userAgent || "unknown",
              osver: window.navigator.oscpu || "unknown"
          },
          client: {
              name: "Blossom Bugsense Notifier",
              protocol_version: 1,
              version: "0.1"
          },
          exception: {
              klass: e.notice.settings && e.notice.settings.modelType || "Unknown Component",
              message: e.notice.error || b.message,
              backtrace: e.generateBackTrace(h),
              where: "n/a:0"
          },
          request: function () {
              var k = {
                  remote_ip: "0.0.0.0",
                  url: window.location.href,
                  custom_data: {
                      document_referrer: e.escapeText(document.referrer),
                      http_status: e.escapeText(this.status),
                      navigator_user_agent: e.escapeText(navigator.userAgent),
                      navigator_platform: e.escapeText(navigator.platform),
                      navigator_vendor: e.escapeText(navigator.vendor),
                      navigator_language: e.escapeText(navigator.language),
                      screen_width: e.escapeText(screen.width),
                      screen_height: e.escapeText(screen.height),
                      response: e.escapeText(e.notice.request.responseText),
                      request: {}
                  }
              };
              e.notice.settings && _.each(e.notice.settings, function (t, x) {
                  if (/boolean|number|string/.test($.type(t))) k.custom_data.request[x] = t
              });
              k.custom_data.request = JSON.stringify(k.custom_data.request);
              return k
          }()
        }
        b = this.defaults.url + this.defaults.apiKey + "&data=" + escape(JSON.stringify(this.data));
        $("#bugsense-iframe")[0] ? $("#bugsense-iframe").attr("src", b) : $("body").append('<iframe id="bugsense-iframe" src="' + b + '" width="1" height="1">');
    },
    errorFilters: function () {
        return false;
    },
    escapeText: function (b) {
        if(typeof(b) !== "undefined" && b !== null) {
          b = b.toString() || "";
          return b.replace(/&/g, "&#38;").replace(/</g, "&#60;").replace(/>/g, "&#62;").replace(/'/g, "&#39;").replace(/"/g, "&#34;");
        } else {
          return undefined;
        }
    },
    generateBackTrace: function (b) {
        if (b) return b.file + ":" + b.line;
        try {
            throw Error();
        } catch (e) {
            if (e.stack) {
                var h = /\s+at\s(.+)\s\((.+?):(\d+)(:\d+)?\)/;
                return $.map(e.stack.split("\n").slice(4), _.bind(function (k) {
                    k = k.match(h);
                    var t = this.escapeText(k[1]);
                    return this.escapeText(k[2]) + ":" + k[3] + "in" + t
                }, this)).join("\n")
            } else if (e.sourceURL) return e.sourceURL + ":" + e.line
        }
        return "n/a:0"
    }
};

window.onerror = function (message, file, line) {
  setTimeout(function () {
    Bugsense.notify({
      request: {
        message: message,
        status: "uncatched-error"
      },
      response: {
        stack: {
          file: file,
          line: line
        }
      }
    })
  }, 100);
  return true
};
