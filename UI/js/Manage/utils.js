(function(global) {
  // Notice: global is window.message

  // Some variables only for this scope.
  // They'll stay in closures, is that a problem?
  var notify_categories = ['workflow', 'sendme', 'mentioned', 'announcement', 'comment', 'subscribe', 'default'];

  /** Common util functions **/
  global.utils = {
    normalize_comm_channel_name: function(comm_channel_name) {
      // Normalize low-level communication channel_name
      // E.g. 1: 'users.current<>users.other'=> 'users.other'
      // E.g. 2: 'category<>users.current'=> 'category'
      // E.g. 3: '123' / 123 => '123'
      if (/^users\./.test(comm_channel_name)) { // users.id<>users.id2 (user IDs are sorted)
        return comm_channel_name.replace(global.rtc.user.id, '').replace('<>', '');
      } else if (/^.+\<\>users\..+$/.test(comm_channel_name)) { // category<>users.id or just GROUP_ID
        return comm_channel_name.split('<>')[0];
      } else { // GROUP_ID (a number)
        return comm_channel_name;
      }
    },
    get_comm_channel_name: function(channel_name) {
      // Convert a human-readable channel_name to low-level communication channel_name
      // E.g. 1: 'users.other' => 'users.current<>users.other'// E.g. 2:'category'=> 'category<>users.current'// E.g. 3:'123'/ 123 => '123'
      if (/^users\./.test(channel_name)) {
        var users = [global.rtc.user.id, channel_name];
        users.sort();
        return users.join('<>');
      } else if ($.inArray(channel_name, notify_categories) != -1) {
        return [channel_name, global.rtc.user.id].join('<>');
      } else {
        return channel_name;
      }
    },
    get_channel_type: function(channel_name) {
      // Get channel_type out of given channel_name
      // Support both human-readable channel_name and low-level
      // communication channel_name.
      if (/^.+\<\>.+$/.test(channel_name)) {
        // channel_name is a low-level communication channel_name
        // convert into human-readable form
        channel_name = channel_name.replace(global.rtc.user.id, '').replace('<>', '');
      }

      // channel_name is a human-readable channel_name
      if (/^users\..+/.test(channel_name)) {
        return 'private';
      } else if ($.inArray(channel_name, notify_categories) != -1) {
        return 'notify';
      } else if (!isNaN(channel_name)) { // Caution: ref the MDN doc about `isNaN` to understand why we don't use `Number.isNaN`
        return 'group';
      } else {
        return 'invalid';
      }
    },
    get_channel_title_by_msg: function(msg) {
      // Get channal_title out of given msg (via RTC push or queried from
      // message service)
      // - Calls `get_channel_title_by_name;
      // - Trys to extract from `msg.from.name`;
      var channel_title = global.utils.get_channel_title_by_name(global.utils.normalize_comm_channel_name(msg.channel_name));
      if (!channel_title && msg.from && msg.from.name) {
        channel_title = msg.from.name;
      }
      return channel_title;
    },
    get_channel_title_by_name: function(channel_name) {
      // Get proper title for given channel_name
      // Support both human-readable channel_name and low-level
      // communication channel_name.
      // - Look up group title from `EDO.chat_groups` for group channel;
      // - Use the other user's name for private channel;
      // - Use translation for notify channel (by category);
      var channel_type = global.utils.get_channel_type(channel_name),
        channel_title = '';
      if (channel_type == 'group') {
        $.each(EDO.chat_groups, function(i, group_info) {
          if (group_info.uid.toString() == channel_name.toString()) {
            channel_title = group_info.title;
            return false; // break out of $.each loop
          }
        });
      } else if (channel_type == 'private') {
        var other_user = channel_name.replace(global.rtc.user.id, '').replace('<>', '');
        if (!other_user) {
          // Self-to-self private channel
          channel_title = global.rtc.user.title;
        } else {
          // Self-to-other private channel
          // We can't tell, you'll have to provide a msg to extract the title from
          // Or we can fetch user title from OC service, but it would
          // be async
          channel_title = '';
        }
      } else if (channel_type == 'notify') {
        $.each(EDO.notify_channels, function(i, notify_channel) {
          if (channel_name == notify_channel.name) {
            channel_title = notify_channel.title;
            return false; // break out of $.each loop
          }
        });
      }
      return channel_title;
    },
    isInteger: function(n) {
        // This is a polyfill for IE only
        return Number.isInteger ? Number.isInteger(n) : ((n ^ 0) === +n);
    },
    get_logger: function(name) {
      // Get a simple logger, it just logs to window.console if possible.
      // If window.console is not available, it does not do anything.
      // Usage: `get_logger(name, level)`, level is set to 20 if not
      // given. Level ranges are as follows:
      // [-Infinity, 10): LOG / DEBUG level;
      // [10, 20): INFO level;
      // [20, 30): WARNING level;
      // [30, 40): ERROR level;
      // [40, Infinity]: CRITICAL level;

      // Get level filter
      var init_args = [].slice.call(arguments, 1);
      if (init_args.length == 0 || isNaN(init_args[init_args.length - 1])) {
        init_args = [20];
      }

      if (!window.console) {
        function EmptyLogger() {};
        EmptyLogger.prototype.log = EmptyLogger.prototype.info = EmptyLogger.prototype.warn = EmptyLogger.prototype.error = EmptyLogger.prototype.critical = function() {};
        return new EmptyLogger();
      } else {
        function Logger() {
          var self = this;
          self.filter_level = init_args.pop(),
            self.logger_name = name || 'root',
            self.log_prefix = self.logger_name + ':';
        };

        if (!window.console.log) {
          Logger.prototype.log = function() {};
        } else {
          Logger.prototype.log = function(msg) { // Msg level defaults to 0 (DEBUG level)
            var self = this,
              args = [].slice.call(arguments, 1),
              level;
            if (args.length == 0 || !global.utils.isInteger(args[args.length - 1])) {
              level = 0;
            } else {
              level = parseInt(args.pop());
            }

            // Filter incomming msg by its level
            if (level < self.filter_level) {
              return;
            }

            // Map to proper window.console.* method
            // and init proper log prefix string
            var prefix, target;

            if (level < 10) {
              target = window.console.log;
              prefix = self.log_prefix + '[DEBUG]';
            } else if (10 <= level && level < 20) {
              target = window.console.info || window.console.log;
              prefix = self.log_prefix + '[INFO]';
            } else if (20 <= level && level < 30) {
              target = window.console.warn || window.console.log;
              prefix = self.log_prefix + '[WARN]';
            } else if (30 <= level && level < 40) {
              target = window.console.error || window.console.log;
              prefix = self.log_prefix + '[ERROR]';
            } else if (level >= 40) {
              target = window.console.error;
              prefix = self.log_prefix + '[CRITICAL]';
            }

            // Log to window.console
            target = target || window.console.log;
            if(typeof console == "object" && typeof console.log == "object"){
                target(([prefix].concat(msg, args)).join(' '));
            }else{
                target.apply(window.console, [prefix].concat(msg, args)); 
            }
          };
        }
        // 10
        Logger.prototype.info = function() {
          this.log.apply(this, [].slice.call(arguments).concat(10));
        };
        // 20
        Logger.prototype.warn = function(msg) {
          this.log.apply(this, [].slice.call(arguments).concat(20));
        };
        // 30
        Logger.prototype.error = function(msg) {
          this.log.apply(this, [].slice.call(arguments).concat(30));
        };
        // 40
        Logger.prototype.critical = function(msg) {
          this.log.apply(this, [].slice.call(arguments).concat(40));
        };
        return new Logger();
      }
    },
    mark_read: function(channel_name, channel_type, timestamp) {
      if (!channel_type) {
        var channel_type = global.utils.get_channel_type(channel_name);
      }
      if (!timestamp) {
        var timestamp = '';
      }
      global.client.mark_read((channel_type == 'notify') ? ('notify') : ('chat'),
        channel_type,
        channel_name,
        timestamp
      );
      // Trigger `mark_read` event on current page
      $(document).trigger('mark_read', {
        channel_name: channel_name,
        channel_type: channel_type
      });
      // Trigger `mark_read` on other pages
      global.rtc.trigger_event('mark_read', {
        channel_name: channel_name,
        channel_type: channel_type
      });
    },
    parse_unreads: function(unreads) {
      // 解析 unread_stat 数据成为更易于使用的格式
      var unread_channels = [];
      $.each(unreads, function(unread_channel_name, unread_data) {
        var cname_parts = unread_channel_name.split(':'),
          channel_type = cname_parts[0],
          comm_channel_name = cname_parts[1],
          unread = {
            channel_name: global.utils.normalize_comm_channel_name(comm_channel_name),
            channel_type: channel_type
          };
        $.each(unread_data, function(k, v) {
          unread[k] = v;
        });
        unread_channels.push(unread);
      });
      return unread_channels;
    },
    replace_links: function(text) {
      // 将给定字符串中的链接替换成 HTML 链接
      // e.g.: 'google.com' => '<a href="https://google.com">google.com</a>'
      var expression =
        /(?:\b[a-z\d.-]+:\/\/[^<>\s]+|\b(?:(?:(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]+)\.)+(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|ja|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?:[;/][^#?<>\s]*)?(?:\?[^#<>\s]*)?(?:#[^<>\s]*)?(?!\w))/gi;
      var with_protocol = /^(https|http|ftp):\/\//i;
      var urls = text.match(expression);
      if (urls && urls.length) {
        text = text.replace(expression, function(match, offset, original) {
          //删除链接最后的一个","
          if(match.endsWith(',')){
              match = match.slice(0, match.length - 1);
          }
          return '<a rel="nofollow noreferer noopener"target="_blank"href="' + ((with_protocol.test(match)) ? (match) : ('//' + match)) + '">' + match + '</a>'
        });
      }

      return text;
    }
  };

})(window.message = window.message || {});
