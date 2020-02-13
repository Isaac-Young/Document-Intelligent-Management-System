!(function(obj) {
  var global = obj,
    I18N = window.EDO.i18n.im;
  /** Feature fixes start **/
  // In IE 8 an array has no `indexOf` method
  if ('undefined' === typeof root_url) {
    root_url = $("[rel=root-url]").attr("href");
  }
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(v) {
      for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] === v) {
          return i;
        }
      };
      return -1;
    };
  }
  var msg_options = EDO.msg_options;
  var default_settings = {
    'sound': true,
    'float': true
  };
  // 消息提醒设置
  // 本地存储不可用的情况，例如有些浏览器的隐身模式
  if (typeof store === 'undefined' || !store.enabled) {
    obj.settings = default_settings;
  } else {
    var settings = store.get('message');
    if (!settings) {
      store.set('message', default_settings);
      obj.settings = default_settings;
    } else {
      obj.settings = settings;
    }
  }
  /** Feature fixes end **/

  /** Handlebars helpers **/
  Handlebars.registerHelper('less', function(index, current_count, options) {
    // 得出未读消息:
    // 如果当前的索引值没有超过当前的数量
    // 高亮显示
    if ((index + 1) <= current_count || 0) {
      return options.fn(this);
    }
  });

  /** Fully parse given text, and do the following:
   *  - space (including multiple continuous spaces) => HTML nbsp entity;
   *  - URLs (links) to HTML a tags;
   *  - libe breaks (\n, \r and \r\n) to HTML br tags;
   */
  Handlebars.registerHelper('parsecontent', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    
    text = text.replace(/\ /gm, '\xa0');
    text = obj.utils.replace_links(text);

    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
  });

  /** Do the following:
   *  - Replace multiple continuous spaces into single spaces;
   *  - If result text is not longer than 200 chars:
   *    - Fully parse text, replacing links to HTML a tags;
   *    - Replace spaces to HTML nbsp entities;
      - Else:
   *    - Strip text to first 200 chars (197 and trailing ...);
   *    - Replace spaces to HTML nbsp entities;
   *    - Append a link to the end for viewing full text;
   */
  Handlebars.registerHelper('parselongcontent', function(text) {
    var detail_link = '';
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/\ +/g, ' '); // multiple continuous spaces to single spaces

    if (text.length > 200) {
      detail_link = '\
        <a class="notification-operation link view_notification_detail"style="cursor:pointer;">\
          <i class="fa fa-external-link"></i>' + I18N.view_detail +
        '</a>';
      text = text.substr(0, 197) + '...';
      text = text.replace(/\ /g, '\xa0');
    } else {
      text = text.replace(/\ /gm, '\xa0');
      text = obj.utils.replace_links(text);
    }
    return new Handlebars.SafeString(text + detail_link);
  });

  // 从 script 标签中读取模板
  // FIXME 清理无用的模板
  obj.load_templates = function(callback) {
    var tpls = [
      'zopen.message:notification.hb',
      'zopen.message:notify_message.hb'
    ];
    if (msg_options.enable_chat) {
      tpls = tpls.concat([
        'zopen.message:chat_starter.hb'
      ]);
    }

    load(tpls, callback);
  } // message.load_templates() end

  var rs = [
    'zopen.message:utils.js',
    'zopen.message:unread_counter.js',
    'zopen.message:ui.js',
    'zopen.message:templates.js',
    'zopen.message:chat.css',
    'zopen.message:chat_image.hb',
    'zopen.message:chat_message.hb'
  ];
  if (msg_options.enable_chat) {
    rs = rs.concat(['zopen.message:chat.js']);
  }
  load(rs, function() {
    // 注册用于连接消息的处理器
    $(document).on('rtc:connected', function(evt, msg) {
      // 同个用户有其他客户端上线，略过
      if (msg.client_id && msg.client_id != obj.rtc.id) {
        return false;
      }

      // 查询未读消息，更新未读计数（如果有未读消息的话）
      var type_and_channel, channel_name, channel_type;
      obj.client.unread_stat({}, function(unreads) { // 先丢弃无效数据，剩余的数据按类型 (聊天 / 通知 等) 分开
        var valid_unreads = {};
        $.each(unreads, function(key, unread) {
          var type_and_channel = key.split(':'),
            channel_type = type_and_channel[0],
            channel_name = type_and_channel[1];
          if (unread.count === 0) { // 无效数据
            obj.client.mark_read(channel_type, channel_name, unread.time_start);
          } else {
            unread.channel_name = channel_name;
            if (valid_unreads[channel_type]) {
              valid_unreads[channel_type].push(unread);
            } else {
              valid_unreads[channel_type] = [unread];
            }
          }
        });
        // 每种类型触发一次事件将数据批量传给 handler
        $.each(valid_unreads, function(channel_type, unreads) {
          $(document).trigger('message:update_unreads', {
            channel_type: channel_type,
            unreads: unreads
          });
        });
      }); // end unread_stat function call
    });

    // 全局的消息未读数管理器，与界面无关。与界面组件之间通过事件传递数据
    if (typeof global.counter === 'undefined') {
      global.counter = {};
    }
    var counter = global.counter;

    // 如果没有开启聊天功能，不要接收 chat 事件
    if (EDO.msg_options.enable_chat) {
      $(document).on('chat', function(event, data) {
        var comm_channel_name = data.channel_name,
          channel_name = global.utils.normalize_comm_channel_name(comm_channel_name),
          from_self = data.from && data.from.id == global.client.user.id;

        // 自己发出的聊天消息不计入未读数
        if (!from_self) {
          // 还没有这个聊天，此时记录数据
          if (typeof counter.data[channel_name] === 'undefined') {
            counter.data[channel_name] = {
              type: data.channel_type,
              count: 1
            };
          } else {
            $.each(counter.data, function(c_name, c_data) {
              if (c_name == channel_name && c_data.type == data.channel_type) {
                c_data.count += 1;
                return false; // break $.each loop
              }
            });
          }

          $(document).trigger('message:count_updated', counter.data);
        }
      });
    }
    $(document).on('notify', function(event, data) {
      var comm_channel_name = data.channel_name,
        channel_name = global.utils.normalize_comm_channel_name(comm_channel_name);

      $.each(counter.data, function(c_name, c_data) {
        if (c_name == channel_name && c_data.type == data.channel_type) {
          c_data.count += 1;
        }
      });
      $(document).trigger('message:count_updated', counter.data);
    }).on('mark_read', function(event, data) {
      var channel_name = data.channel_name;

      $.each(counter.data, function(c_name, c_data) {
        if (c_name == channel_name && c_data.type == data.channel_type) {
          c_data.count = 0;
        }
      });
      $(document).trigger('message:count_updated', counter.data);
    }).on('message:update_unreads', function(event, data) {
      var that = global.counter;
      $.each(data.unreads, function(i, unread) {
        var channel_name = global.utils.normalize_comm_channel_name(unread.channel_name);

        if (typeof counter.data[channel_name] === 'undefined') {
          counter.data[channel_name] = {
            type: data.channel_type,
            count: unread.count || 0
          };
        } else {
          $.each(counter.data, function(c_name, c_data) {
            if (c_name == channel_name && c_data.type == data.channel_type) {
              c_data.count += unread.count;
            }
          });
        }
      });
      $(document).trigger('message:count_updated', counter.data);
    }).on('rtc:connected', function(event, data) {
      if (data.client_id === global.rtc.id) {
        counter.data = {};

        $.each(EDO.notify_channels, function(i, channel) {
          counter.data[channel.name] = {
            type: 'notify',
            count: 0
          };
        });
      }
    });

    // 初始化连接
    msg_options.server = EDO.servers.message;
    obj.rtc = new RTC(msg_options);

    // localStorage 满了之后，MQTT 库会无法连接，这里做一下简单的清理
    if (!obj.rtc._FALLBACK && window.localStorage) {
      var quota_test_key = 'rtc:quota_test',
        quota_test_content = (function(n) {
          return new Array(n + 1).join('x');
        })(1000); // 2kbytes of content
      // 总数超过 200 条，先尝试清除所有的 MQTT 数据
      if (window.localStorage.length > 200) {
        try {
          localStorage.setItem(quota_test_key, quota_test_content);
        } catch (e) {
          window.console && console.warn && console.warn('Local storage length> 200 and quota exceeded');
          var i, key;
          for (i = localStorage.length - 1; i > 0; i--) {
            key = localStorage.key(i);
            if (/^Sent:/i.test(key)) {
              localStorage.removeItem(key);
            }
          }
        }
      }
      // 清除之后仍然超限的话不管了
      try {
        localStorage.setItem(quota_test_key, quota_test_content);
      } catch (e) {
        obj.rtc._log(['Storage quota still not enough after all MQTT content cleared'], true);
      }
      // 最后清除测试内容
      localStorage.removeItem(quota_test_key)
    }

    // 连接
    setTimeout(function() {
      obj.rtc.connect({
        instances: [EDO.msg_instance],
        main_instance: EDO.msg_instance
      });
      obj.client = new MsgClient(obj.rtc, msg_options);
      // 消息客户端初始化完成，依赖于客户端的组件可以开始相关操作了
      $(document).trigger('message:client_inited', {});
    }, 500);
    $(document).trigger('message:inited', {});
  });

})(window.message = window.message || {});