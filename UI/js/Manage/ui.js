(function(global) {
  // Notice: global is window.message

  // Some variables only for this scope.
  // They'll stay in closures, is that a problem?
  var notify_categories = ['workflow', 'sendme', 'mentioned', 'announcement', 'comment', 'subscribe', 'default'],
    I18N = window.EDO.i18n.im;

  /** The actual UI component implementations **/
  global.ui = {
    /** Logger **/
    logger: global.utils.get_logger('message.ui', (EDO.debug) ? (0) : (undefined)),

    /** conversation_list 组件 **/
    create_conversation_list: function(selector, allowed_channel_types, _channels) {
      var that = global,
        container = $(selector),
        channels = _channels || [],
        channel_type_events = {
          'private': 'chat',
          'group': 'chat',
          'notify': 'notify'
        },
        requirements = [
          'zopen.message:init.js',
          'zopen.message:templates.js'
        ];

      load(requirements, function() {
        // 去重：如果目标容器里已经有这个 channel 的组件，就直接返回
        if (container.find('.ui_conversation_list').length > 0) {
          global.ui.logger.info('conversation_list UI component already exists in container', container.selector);
          return false;
        }
        var rendered_html = '';

        // 加载会话列表
        $.each(channels, function(i, channel) {
          // 略过不符合的频道类型
          var this_channel_type;
          if ($.inArray(channel.name, notify_categories) != -1) {
            this_channel_type = 'notify';
          } else {
            if (/^users\./.test(channel.name)) {
              this_channel_type = 'private';
            } else {
              this_channel_type = 'group';
            }
          }
          rendered_html = rendered_html + EDO.templates.conversation_list_item({
            channel_type: this_channel_type,
            channel_name: channel.name,
            channel_title: channel.title
          });
          global.ui.logger.log('Loaded conversation_list item', channel.name, 'of type', this_channel_type);
        });
        container.append('<ul class="ui_conversation_list">' + rendered_html + '</ul>');
        global.ui.logger.log('UI updated');

        // 事件绑定
        container.on('click', '.conversation_list_item a', function(event) {
          // 点击列表项，抛出事件（注意：不对 UI 做任何操作）
          $(document).trigger('channel:opened', {
            channel_type: $(this).attr('data-type'),
            channel_name: $(this).attr('data-channel'),
            channel_title: $(this).find('.title').text()
          });
        }).on('click', '.conversation_close_trigger', function(e) {
          var list_item_link = $(this).siblings('a'),
            channel_type = list_item_link.attr('data-type');

          // 非聊天会话暂时不允许关闭
          if ($.inArray(channel_type, ['private', 'group']) == -1) {
            global.ui.logger.info('Currently you can only close channel of "chat" type');
            return;
          }
          $(document).trigger('channel:closed', {
            channel_type: channel_type,
            channel_name: list_item_link.attr('data-channel'),
            channel_title: list_item_link.find('.title').text()
          });
        });
        $(document).on('mark_read', function(event, data) {
          // 标记已读时更新未读数
          if ($.inArray(data.channel_type, allowed_channel_types) != -1) {
            var conversation_list_item = container.find('.conversation_list_item [data-channel="' + data.channel_name + '"][data-type="' + data.channel_type + '"]'),
              unread_container = conversation_list_item.find('.unread'),
              current_unread = parseInt(unread_container.text());
            if (current_unread > 0) {
              unread_container.text('');
            }
          }
        }).on('channel:opened', function(event, data) {
          if ($.inArray(data.channel_type, allowed_channel_types) != -1) {
            // 接收到频道打开事件，更新 UI
            container.find('.conversation_list_item.current').removeClass('current');
            // 界面上添加这个频道
            if (container.find('a[data-type="' + data.channel_type + '"][data-channel="' + data.channel_name + '"]').length === 0) {
              var rendered_html = EDO.templates.conversation_list_item({
                channel_type: data.channel_type,
                channel_name: data.channel_name,
                channel_title: data.channel_title
              });
              container.find('ul').append(rendered_html);
            }
            container.find('a[data-type="' + data.channel_type + '"][data-channel="' + data.channel_name + '"]').parent().addClass('current')
          }
        }).on('channel:closed', function(event, data) {
          if ($.inArray(data.channel_type, allowed_channel_types) != -1) {
            // 接收到频道关闭事件，更新 UI
            container.find('a[data-type="' + data.channel_type + '"][data-channel="' + data.channel_name + '"]').parent().remove();
          }
        }).on('notify chat', function(event, data) {
          // 新消息到来时更新未读数
          // 自己发送的聊天消息不进入未读
          var from_self = event.type == 'chat' && data.from && data.from.id == global.rtc.user.id;
          if ($.inArray(data.channel_type, allowed_channel_types) != -1 && !from_self) {
            var comm_channel_name = data.channel_name, // Low-level communication channel name
              channel_name = global.utils.normalize_comm_channel_name(comm_channel_name),
              conversation_list_item = container.find('.conversation_list_item [data-channel="' + channel_name + '"][data-type="' + data.channel_type + '"]');
            // 还不存在这个会话，界面上新增（但不需要触发打开会话的事件）
            if (conversation_list_item.length === 0) {
              var rendered_html = EDO.templates.conversation_list_item({
                channel_type: data.channel_type,
                channel_name: channel_name,
                channel_title: global.utils.get_channel_title_by_msg(data)
              });
              container.find('ul').append(rendered_html);
            }

            // 更新未读数
            var conversation_list_item = container.find('.conversation_list_item [data-channel="' + channel_name + '"][data-type="' + data.channel_type + '"]'),
              unread_container = conversation_list_item.find('.unread'),
              current_unread = parseInt(unread_container.text());
            if (unread_container.length > 0) {
              unread_container.text((current_unread) ? (current_unread + 1) : (1));
            }
          }
        }).on('message:update_unreads', function(event, data) {
          if ($.inArray(data.channel_type, allowed_channel_types) != -1) {
            setTimeout(function() {
              $.each(data.unreads, function(i, unread) {
                var channel_name = global.utils.normalize_comm_channel_name(unread.channel_name),
                  conversation_list_item = container.find('.conversation_list_item [data-channel="' + channel_name + '"][data-type="' + data.channel_type + '"]');
                if (conversation_list_item.length > 0) {
                  conversation_list_item.find('.unread').text(unread.count);
                }
              });
            }, 20);
          }
        });
        global.ui.logger.log('Container event listeners set, conversation_list component init done');
      });

    },
    /** Dummy API entrance **/
    create_conversation: function(selector, channel_type, channel_name, callback) {
      global.ui.logger.log('Attempt to create conversation component of type', channel_type, 'for', channel_name);
      if (channel_type == 'notify') {
        return global.ui.create_notify_conversation(selector, channel_name, callback);
      } else if ($.inArray(channel_type, ['private', 'group']) != -1) {
        return global.ui.create_chat_conversation(selector, channel_name, callback);
      }
    },
    /** conversation 组件：聊天类型 **/
    // TODO: 这个组件是在新消息组件架构设计前实现的，可能需要改进内部实现
    create_chat_conversation: function(selector, channel_name, callback) {
      var that = global,
        container = $(selector),
        requirements = [
          'zopen.message:init.js',
          'zopen.message:templates.js',
          'zopen.message:chat.js',
          'zopen.message:conversation.hb',
          'zopen.message:paste_image.hb',
          'zopen.message:paste_image.js'
        ],
        inner_container;

      load(requirements, function() {
        var users = [],
          user_re = /^users\./,
          menus = [],
          archived=false,
          comm_channel_name = global.utils.get_comm_channel_name(channel_name), // Low-level communication channel_name
          chat_type,
          attachment_folder;
        if (user_re.test(channel_name)) {
          // private conversation
          chat_type = 'private';
          attachment_folder = global.rtc.user.id; // FIXME what does this mean?
        } else {
          // group conversation
          chat_type = 'group';
          $.each(global.client.load_chatrooms(), function(i, r) {
            if (r.uid && r.uid.toString() === channel_name.toString()) {
              attachment_folder = r.attach;
              menus = r.menus;
              archived = r.archived;
              return false; // break $.each loop earlier
            }
          });
        }

        // 去重：如果目标容器里已经有这个 channel 的组件，就直接返回
        if (container.find('.ui_conversation[data-channel="' + channel_name + '"][data-type="' + chat_type + '"]').length > 0) {
          return false;
        }

        // 渲染模板，插入指定容器中
        container.append(
          $(EDO.templates['zopen.message:conversation.hb']({
            channel_name: comm_channel_name,
            conversation_id: channel_name,
            chat_type: chat_type,
            attachment_folder: attachment_folder,
            root_url: root_url,
            archived: archived,
            menus: menus // insert HTML contents from room `menus` attribute,\
          })).removeClass('hidden')
        );
        // inner_container is where we bind all our event listeners and
        // we only do DOM manipulations inside this scope
        inner_container = container.find('.ui_conversation[data-channel="' + channel_name + '"][data-type="' + chat_type + '"]');

        // Hide and show 'load more' button upon scroll
        inner_container.find('.conversation-history-body').on('scroll', function(e) {
          var conv = $(this).closest('.conversation'),
            msg_board, header;
          if (conv && conv.hasClass('hidden')) {
            return false;
          }
          msg_board = $(this);
          header = conv.find('.conversation-history-header');
          if (msg_board.get(0).scrollTop > 10) {
            !header.hasClass('transparent') && header.addClass('transparent');
          } else {
            header.hasClass('transparent') && header.removeClass('transparent');
          }
          return true;
        });

        // File selector
        inner_container.find('.send-file.conversation-menu-button').on('click', function(){
            $(document).off('select-files');
            $(document).one('select-files', function(e, data){
                if($('input[value="chat_sendfile:list"]').length == 0){return};
                if($('.min-chatpanel').hasClass('hidden') || EDO.isMobile){
                    global.chat.send_files(data['items'], channel_name, comm_channel_name, chat_type);
            }})
        })
        
        // Hide image sender on mobile
        if(EDO.isMobile){
            inner_container.find('.send-image.conversation-menu-button').hide();
        }

        // Image paster
        var paste_container = inner_container.find('.menu-container');
        if (paste_container.find('form.paste-image').length === 0) {
          paste_container.find('.menu-render').append(
            EDO.templates['zopen.message:paste_image.hb']({
              // TODO improve parameter naming
              receiver: channel_name,
              type: chat_type,
              sender: attachment_folder
            })
          );
          new ImagePaster(global.chat.image_input_name, paste_container.find('.paster-container').get(0));
        }

        /** Component-scope event listeners **/
        // 点击关闭菜单
        inner_container.on('click', '.close-menu', function(e) {
          var that = global.chat,
            conv = $(this).closest('.conversation'),
            menu_container = conv.find('.menu-container'),
            image_form = menu_container.find('form.paste-image'),
            paste_input = conv.find('.paster-container').find('[name="' + that.image_input_name + '"]').parent(),
            conv_id = conv.find('input[name="conversation_id"]').val();
          menu_container.addClass('hidden') && image_form.addClass('hidden');
          // $('#chatpanel').find('.menu-render').empty();}
        }).on('click', '.conversation-alert i.fa-remove', function(e){
          // 点击关闭信息栏
          var that = global.chat,
          conv = $(this).closest('.conversation'),
          conv_id = conv.find('input[name="conversation_id"]').val()
          that._clear_alert(conv_id);
        }).on('click', 'a.more-msg', function(e) {
          // 查询消息历史
          // FIXME 从 .ui_conversation 容器上获得参数，不再使用 hidden inputs
          var that = global.chat,
            conversation = $(this).closest('.ui_conversation'),
            channel_name = conversation.attr('data-channel'),
            comm_channel_name = global.utils.get_comm_channel_name(channel_name),
            channel_type = conversation.attr('data-type'),
            time_end = conversation.find('input[name="time_end"]').val(),
            query_options;

          // 查询历史消息
          query_options = {
            event_name: 'chat',
            channel_type: channel_type,
            channel_name: comm_channel_name,
            time_end: time_end,
            limit: 20
          };
          // 显示 loading
          global.ui._show_conversation_loading(channel_name);
          // 查询
          global.client.query(query_options, function(msgs) {
            // 停止 loading
            global.ui._hide_conversation_loading(channel_name);

            // 插入模板
            $.each(msgs, function(index, msg) {
              global.ui.insert_chat_msg(channel_name, msg, true);
            });
            // 如果加载到最后了，把按钮禁用掉，显示 "没有更多通知"
            var saved_timestamp = $('.conversation[cid="' + channel_name + '"] input[name="time_end"]').val();

            if (msgs.length == 0 || (msgs[msgs.length - 1].timestamp.toString() == saved_timestamp)) {
              global.ui.logger.log('chat_conversation', channel_name, 'has reached end of history');
              var conv_header = $('.conversation[cid="' + channel_name + '"] .conversation-history-header');
              !conv_header.hasClass('no-more-msg') && conv_header.addClass('no-more-msg');
            }

            if (msgs.length > 0) {
              // 保存消息历史的结尾时间戳
              global.ui.set_conversation_time_end(
                channel_name,
                msgs[msgs.length - 1].timestamp || new Date() / 1000.0);
            }
          });

          return false;
        }).on('submit', 'form.sendMessage', function(e) {
          // 发送聊天消息
          var that = global.chat,
            conversation = $(this).closest('.ui_conversation'),
            input = conversation.find('textarea.conversation-input'),
            body = input.val(),
            to = conversation.attr('data-channel'),
            comm_channel_name = global.utils.get_comm_channel_name(to),
            channel_type = conversation.attr('data-type'),
            msg_board, callback;
          if (!(to && body)) {
            return false;
          }
          if (!global.client.rtc.is_online()) {
            that._alert(to, I18N.u_r_offline, 'warning');
            return false;
          }

          input.get(0).disabled = true;
          that._show_sending();

          callback = function(result) {
            //  $('.send-message-button').removeClass('hidden');
            // 显示在消息历史中
            // 统一在发送时显示，在接收时忽略来自自己的消息
            var msg_sent = {
              body: body,
              attachments: null,
              timestamp: result.timestamp || new Date() / 1000.0,
              subject: '',
              from: global.rtc.user,
              to: to,
              instance: global.rtc.main_instance,
              context: null,
              action: "",
              channel: comm_channel_name,
              failed: !result.timestamp && !result.id,
              id: result.id
            };
            $('.send-message-button').val(I18N.send);
            $('.send-message-button').attr('disabled', false);
            if(result.errcode=='30103'){
                that._alert(to, I18N.group_chat_has_archived, 'warning');
                input.get(0).disabled = false;
                return
            }
            global.ui.insert_chat_msg(to, msg_sent);
            that._hide_sending();
            input.val('');
            input.get(0).disabled = false;
            input.focus();

            // 滚动到最新一条消息
            msg_board = conversation.find('.conversation-history-body');
            msg_board.animate({
              scrollTop: msg_board.get(0).scrollHeight
            }, {
              duration: 50
            });
          };

          try {
            // 私聊
            if (channel_type === 'private') {
              global.client.send_message(to, body, null, null, '', callback);
              // 群聊
            } else if (channel_type === 'group') {
              global.client.send_group_message(to, body, null, null, '', callback);
            }
          } catch (e) {
            // TODO Use new logger instead of message.client._log
            global.client._log(['发送消息时出现错误：', e], true);
          }

          return false;
        }).on('keydown', 'form.sendMessage textarea.conversation-input', function(e) {
          // 消息的编写
          if (e.keyCode && e.keyCode == 13) {
            // Ctrl / Shift + Enter 发送
            if (e.ctrlKey || e.shiftKey) {
                e.preventDefault();
                $('.send-message-button').val(I18N.sending);
                $('.send-message-button').attr('disabled', true);
                return $(this).closest('form.sendMessage').submit();
            }
          }
        }).on('paste', 'form.sendMessage textarea.conversation-input', function(e) {
        // 如果当前页面贴图窗口已打开则不再创建窗口
        if ($('#msg_paste_box').length > 0) {
            return false;
        };
          var that = global.chat,
            conv = $(this).closest('.conversation');
          conv.find('form.paste-image').trigger(e);
          // 捕捉到了图片的话才显示贴图工具
          // 插入 DOM 元素可能需要一些时间，这里延时去检测
          setTimeout(function() {
            if (conv.find('.paster-container img').length > 0) {
              var image_form = conv.find('form.paste-image'),
                container = conv.find('.menu-container');
              if (!container.hasClass('hidden')) {
                return false;
              }
              $(this).kss("@zopen.message:paste_image", {
                  'sender': image_form.find('input[name="sender"]').val(),
                  'receiver': image_form.find('input[name="receiver"]').val(),
                  'chat_type': image_form.find('input[name="chat_type"]').val()
              });
              // 判断弹窗是否已经渲染成功
              function insert_img_timer(){
                var $clipboard  = $('#msg_clipboard');
                if($clipboard.length > 0){
                    $clipboard.click();
                    var template = '<input name="image:list" type="hidden" value="{value}"><img src="{src}">';
                    $clipboard.html(template.replace(/{src}/, image_form.find('img').attr('src')).replace(/{value}/, image_form.find('input[name="image:list"]').val()));
                    image_form.find('img').remove();
                    image_form.find('input[name="image:list"]').val('');
                }else{
                    setTimeout(insert_img_timer, 50);
                }
              };
              insert_img_timer();
              return false;
            }
          }, 50);
        }).on('click', '.chat-message-nonehuman .profile', function(e) {
          // 如果不是人类用户发出的消息（例如群组公告或是系统发送的消息），成员链接是不能点击的
          return false;
        });
        $(document).on('chat', function(event, data) {
          var comm_channel_name = data.channel_name,
            incomming_channel_name = global.utils.normalize_comm_channel_name(comm_channel_name),
            from_self = data.from && data.from.id && data.from.id == global.client.user.id;

          // 如果不是自己发出的消息，就播放声音（受设置的制约）
          !from_self && global.settings.sound && sound();

          if (incomming_channel_name == channel_name) {
            // 当消息为空时保存收到的最早一条消息的时间戳作为 time_end
            if (inner_container.find('.conversation-history-body').html()==''){
                global.ui.set_conversation_time_end(channel_name, data.timestamp);
            };
            // 插入到消息历史区域
            global.ui.insert_chat_msg(incomming_channel_name, data);

            // 如果自身可见，认为是已读
            if (inner_container.is(':visible')) {
              global.utils.mark_read(incomming_channel_name, chat_type, data.timestamp);
            }
          }
        }).on('message:update_unreads', function(event, data) {
          if (data.channel_type == chat_type) {
            $.each(data.unreads, function(i, unread) {
              var _channel_name = global.utils.normalize_comm_channel_name(unread.channel_name);
              if (_channel_name == channel_name) {
                var _chat_conv = container.find('.ui_conversation[data-channel="' + _channel_name + '"][data-type="notify"]');
                // 会话中已经有历史消息，说明之前断线过
                // TESTING 如果 time_end 被设置过，说明之前断线过
                var _last_msg_ts = parseInt(_chat_conv.find('input[name="time_end"]').val());
                var _now_ts = new Date() / 1000.0,
                  _last_msg_ts = _last_msg_ts || 0;

                if (_now_ts - _last_msg_ts < 86400) {
                  global.ui.logger.log('Filling offline gap for', chat_type, 'conversation "', channel_name, '"');
                  // 如果断线时间很短，补充从断线时到当前时间的未读消息
                  global.client.query({
                    event_name: 'chat',
                    limit: unread.count,
                    channel_type: chat_type,
                    channel_name: global.utils.get_comm_channel_name(channel_name),
                    time_start: _last_msg_ts,
                    time_end: _now_ts
                  }, function(data) {
                    global.ui.logger.log('Queried', data.length, chat_type, 'msgs for', channel_name, 'from message API');
                    // 这里不是填充历史消息，所以插入顺序是：按消息时间顺序，从尾部插入（将新的消息插在后面 / 倒序依次 append）
                    $.each(data.reverse(), function(i, msg) {
                      // Deduplication
                      if (_chat_conv.find('.conversation-history-body [id="msg.' + channel_name + msg.id + '"]').length == 0) {
                        global.ui.insert_chat_msg(channel_name, msg, false);
                        global.ui.logger.log(chat_type, 'msg', msg.id, 'updated to UI');
                      }
                    });

                    if (data.length > 0) {
                      _chat_conv.find('input[name="time_end"]').val(data[data.length - 1].timestamp);
                    }

                  });
                } else {
                  // 如果断线时间超过 24 小时，清除列表重新加载
                  _chat_conv.find('.chat-message').remove();
                  _chat_conv.find('input[name="time_end"]').val('');
                  global.client.query({
                    event_name: 'chat',
                    limit: unread.count,
                    channel_type: chat_type,
                    channel_name: global.utils.get_comm_channel_name(channel_name),
                    time_start: _last_msg_ts,
                    time_end: _now_ts
                  }, function(data) {
                    global.ui.logger.log('Queried', data.length, chat_type, 'msgs for', channel_name, 'from message API');
                    // 这里不是填充历史消息，所以插入顺序是：按消息时间顺序，从尾部插入（将新的消息插在后面 / 倒序依次 append）
                    $.each(data.reverse(), function(i, msg) {
                      // Deduplication
                      if (_chat_conv.find('.conversation-history-body [id="msg.' + channel_name + msg.id + '"]').length == 0) {
                        global.ui.insert_chat_msg(channel_name, msg, false);
                        global.ui.logger.log(chat_type, 'msg', msg.id, 'updated to UI');
                      }
                    });

                    // 如果加载到最后了，把按钮禁用掉，显示 "没有更多通知"
                    var conv_header = _chat_conv.find('.conversation-history-header');
                    if (data.length == 0 || (data[data.length - 1].timestamp.toString() == _last_msg_ts)) {
                      global.ui.logger.log(chat_type, 'conversation', channel_name, 'has reached end of history');
                      !conv_header.hasClass('no-more-msg') && conv_header.addClass('no-more-msg');
                    } else {
                      conv_header.hasClass('no-more-msg') && conv_header.removeClass('no-more-msg');
                    }

                    global.ui._hide_conversation_loading(channel_name);
                    if (data.length > 0) {
                      _chat_conv.find('input[name="time_end"]').val(data[data.length - 1].timestamp);
                    }

                  });
                }
              }
            });
          }
        });

        // 群组有公告，此时显示公告
        if (chat_type == 'group') {
          $.each(global.client.load_chatrooms(), function(i, room) {
            if (room.uid.toString() === channel_name.toString() && room.announcement) {
              global.ui.insert_chat_msg(channel_name, {
                from: {
                  name: I18N.group_announcement,
                  id: 'zopen.group_announcement'
                },
                body: room.announcement,
                timestamp: new Date() / 1000.0,
                channel_name: global.utils.get_comm_channel_name(channel_name),
                channel_type: 'group',
                to: [global.rtc.user.id],
                id: 'group_announcement_' + channel_name
              });
              return false; // break out of $.each loop
            }
          });
        }

        // 加载首屏消息
        var _load_first_screen = function(unread_count) {
          // 限定最多加载 40 条消息，避免未读过多时浏览器卡顿
          var limit = (unread_count > 40) ? (40) : (unread_count),
            _callback = function() {
              // 组件加载完成
              if (typeof callback === 'function') {
                try {
                  callback();
                } catch (e) {}
              }
            };

          _callback();
          if (!unread_count) {
            return;
          }

          // 显示 loading
          global.ui._show_conversation_loading(channel_name);

          global.client.query({
            event_name: 'chat',
            limit: limit,
            channel_type: chat_type,
            channel_name: global.utils.get_comm_channel_name(channel_name)
          }, function(msgs) {
            // 停止 loading
            global.ui._hide_conversation_loading(channel_name);

            // 插入模板
            $.each(msgs, function(index, msg) {
              global.ui.insert_chat_msg(channel_name, msg, true);
            });
            if (msgs.length > 0) {
              // 保存消息历史的结尾时间戳
              global.ui.set_conversation_time_end(
                channel_name,
                msgs[msgs.length - 1].timestamp || new Date() / 1000.0);
            }

          });

        };

        // 有未读消息的话，加载首屏消息，否则让消息历史空着
        var count_data = global.counter.data[channel_name] || {},
          channel_unread_count = count_data.count || 0;
        _load_first_screen(channel_unread_count);

      });
    },
    /** conversation 组件：通知类型 **/
    create_notify_conversation: function(selector, category, callback) {
      var that = global,
        container = $(selector),
        requirements = [
          'zopen.message:init.js',
          'zopen.message:templates.js',
          'zopen.message:notify.js',
          'zopen.message:notification.hb'
        ];

      load(requirements, function() {
        // 去重：如果目标容器里已经有这个 channel 的组件，就直接返回
        if (container.find('.ui_conversation[data-type="notify"][data-channel="' + category + '"]').length > 0) {
          global.ui.logger.info('notify_conversation UI component', category, 'already exists in container', container.selector);
          return false;
        }

        // inner_container is where we bind all our event listeners, we
        // limit our DOM manipulations in this scope
        var rendered_html = '',
          inner_container;

        // 渲染模板，插入指定容器中
        rendered_html = EDO.templates.notify_conversation({
          category: category,
          time_end: new Date() / 1000.0
        });
        container.append(rendered_html);

        inner_container = container.find('.ui_conversation[data-type="notify"][data-channel="' + category + '"]');

        inner_container.find('.loading').addClass('hidden')
        inner_container.find('.no_more_msg').addClass('hidden');
        global.ui.logger.log('UI updated');

        var _load_first_screen = function(unread_count) {
          // 组件加载完成回调
          if (typeof callback === 'function') {
            try {
              callback();
            } catch (e) {
              // TODO log
              global.ui.logger.error('Error calling callback upon notify_conversation component finishing');
            }
          }

          var limit = (unread_count > 40) ? (40) : (unread_count),
            load_button = inner_container.find('.notification-tools .load-more');

          load_button.addClass('hidden');
          inner_container.find('.loading').removeClass('hidden');

          global.ui.logger.log('About to query for', limit, 'notify msgs');
          var _existing_msg_count = inner_container.find('.msg_item').length;
          limit = limit - _existing_msg_count;
          global.ui.logger.log('Decide to query for', limit, 'notify msgs');
          if (_existing_msg_count == 0) {
            limit = 20;
            global.ui.logger.log('Currently no msg rendered for notify category', category, ', decide to query for', limit, 'msgs');
          }

          if (limit <= 0) {
            global.ui.logger.log('No need to query message API for notify msgs, skip loading first screen');
            load_button.removeClass('hidden');
            inner_container.find('.loading').addClass('hidden');
            return false;
          }

          global.client.query({
            event_name: 'notify',
            limit: limit,
            channel_type: 'notify',
            channel_name: [category, global.rtc.user.id].join(',')
          }, function(data) {
            global.ui.logger.log('Queried', data.length, 'notify msgs in', category, 'category from message API');
            $.each(data, function(i, msg) {
              // Deduplication
              if (inner_container.find('.notification-list .msg_item[data-msg-id="' + msg.id + '"]').length == 0) {
                var context = global.notify._msg2context(msg);
                if (i <= unread_count - 1) {
                  context.unread = true;
                }
                inner_container.find('.notification-list').append(EDO.templates['zopen.message:notification.hb'](context));
                global.ui.logger.log('Notify msg', msg.id, 'updated to UI');
              }
            });

            // 如果加载到最后了，把按钮禁用掉，显示 "没有更多通知"
            if (data.length < limit || (data[data.length - 1].timestamp.toString() == load_button.attr('data-time-end'))) {
              global.ui.logger.log('notify_conversation', category, 'has reached end of history');
              inner_container.find('.no_more_msg').removeClass('hidden');
            } else {
              load_button.removeClass('hidden');
            }

            inner_container.find('.loading').addClass('hidden');
            if (data.length > 0) {
              load_button.attr({
                'data-time-end': data[data.length - 1].timestamp
              });
            }

          });

        };

        inner_container.on('click', '.notification-tools .load-more', function(event) {
          /** 点击按钮加载更多通知历史 **/
          var load_button = $(this),
            category = load_button.attr('data-category'),
            time_end = load_button.attr('data-time-end'),
            limit = 20;

          load_button.addClass('hidden');
          inner_container.find('.loading').removeClass('hidden')

          global.client.query({
            event_name: 'notify',
            limit: limit,
            channel_type: 'notify',
            channel_name: [category, global.rtc.user.id].join(','),
            time_end: time_end
          }, function(data) {
            global.ui.logger.log('Queried', data.length, 'notify msgs in', category, 'category from message API');
            $.each(data, function(i, msg) {
              // Deduplication
              if (inner_container.find('.notification-list .msg_item[data-msg-id="' + msg.id + '"]').length == 0) {
                inner_container.find('.notification-list').append(EDO.templates['zopen.message:notification.hb'](global.notify._msg2context(msg)));
                global.ui.logger.log('Notify msg', msg.id, 'updated to UI');
              }
            });

            // 如果加载到最后了，把按钮禁用掉，显示 "没有更多通知"
            if (data.length == 0 || (data[data.length - 1].timestamp.toString() == load_button.attr('data-time-end'))) {
              global.ui.logger.log('notify_conversation', category, 'has reached end of history');
              inner_container.find('.no_more_msg').removeClass('hidden');
            } else {
              load_button.removeClass('hidden');
            }

            inner_container.find('.loading').addClass('hidden')
            if (data.length > 0) {
              load_button.attr({
                'data-time-end': data[data.length - 1].timestamp
              });
            }
          });
          return false;
        }).on('click', '.msg_item.unread', function(e) {
          // 从界面上消除【未读】高亮
          $(this).removeClass('unread');
          $(this).find('.unread-tag').remove();
        }).on('click', '.view_notification_detail', function(e) {
          // 显示完整的消息详情
          var msg_item = $(this).closest('.msg_item'),
            msgid = msg_item.attr('data-msg-id');

          global.notify.show_msg_detail('', msgid); // channel_name is a compatibility stub
          return false;
        });

        $(document).on('notify', function(event, data) {
          /** 接收通知推送 **/
          // Not interested in other categories
          if (global.utils.normalize_comm_channel_name(data.channel_name) == category) {
            // Deduplication
            if (!data.id || inner_container.find('.notification-list .msg_item[data-msg-id="' + data.id + '"]').length == 0) {
              // Prepare template context
              var context = global.notify._msg2context(data);
              context.unread = true;

              // Insert to the beginning of notification list
              inner_container.find('.notification-list').prepend(EDO.templates['zopen.message:notification.hb'](context));
            }
            // TODO 如果这个通知会话当前可见，应该也自动标记已读
          }
        }).on('message:update_unreads', function(event, data) {
          if (data.channel_type == 'notify') {
            $.each(data.unreads, function(i, unread) {
              var _channel_name = global.utils.normalize_comm_channel_name(unread.channel_name);
              if (_channel_name == category) {
                var _notify_conv = container.find('.ui_conversation[data-channel="' + _channel_name + '"][data-type="notify"]');
                // 会话中已经有历史消息，说明之前断线过
                if (_notify_conv.find('.msg_item').length > 0) {
                  var _now_ts = new Date() / 1000.0,
                    _last_msg_ts = parseInt(_notify_conv.find('.load-more').data('time-end')) || 0;

                  if (_now_ts - _last_msg_ts < 86400) {
                    global.ui.logger.log('Filling offline gap for notify category', category);
                    // 如果断线时间很短，补充从断线时到当前时间的未读消息
                    global.client.query({
                      event_name: 'notify',
                      limit: unread.count,
                      channel_type: 'notify',
                      channel_name: [category, global.rtc.user.id].join(','),
                      time_start: _last_msg_ts,
                      time_end: _now_ts
                    }, function(data) {
                      global.ui.logger.log('Queried', data.length, 'notify msgs in', category, 'category from message API');
                      // 这里不是填充历史消息，所以插入顺序是：按消息时间顺序，从头部插入（将旧的消息插在后面）
                      $.each(data.reverse(), function(i, msg) {
                        // Deduplication
                        if (_notify_conv.find('.notification-list .msg_item[data-msg-id="' + msg.id + '"]').length == 0) {
                          var context = global.notify._msg2context(msg);
                          context.unread = true;
                          _notify_conv.find('.notification-list').prepend(EDO.templates['zopen.message:notification.hb'](context));
                          global.ui.logger.log('Notify msg', msg.id, 'updated to UI');
                        }
                      });

                      if (data.length > 0) {
                        _notify_conv.find('.load-more').attr({
                          'data-time-end': data[data.length - 1].timestamp
                        });
                      }

                    });
                  } else {
                    // 如果断线时间超过 24 小时，清除列表重新加载
                    _notify_conv.find('.msg_item').remove();
                    _notify_conv.find('.load-more').attr({
                      'data-time-end': ''
                    });
                    global.client.query({
                      event_name: 'notify',
                      limit: unread.count,
                      channel_type: 'notify',
                      channel_name: [category, global.rtc.user.id].join(','),
                      time_start: _last_msg_ts,
                      time_end: _now_ts
                    }, function(data) {
                      global.ui.logger.log('Queried', data.length, 'notify msgs in', category, 'category from message API');
                      $.each(data, function(i, msg) {
                        // Deduplication
                        if (_notify_conv.find('.notification-list .msg_item[data-msg-id="' + msg.id + '"]').length == 0) {
                          var context = global.notify._msg2context(msg);
                          context.unread = true;
                          _notify_conv.find('.notification-list').append(EDO.templates['zopen.message:notification.hb'](context));
                          global.ui.logger.log('Notify msg', msg.id, 'updated to UI');
                        }
                      });

                      // 如果加载到最后了，把按钮禁用掉，显示 "没有更多通知"
                      if (data.length == 0 || (data[data.length - 1].timestamp.toString() == _last_msg_ts)) {
                        global.ui.logger.log('notify_conversation', category, 'has reached end of history');
                        _notify_conv.find('.no_more_msg').removeClass('hidden');
                      } else {
                        _notify_conv.find('.load-more').removeClass('hidden');
                      }

                      _notify_conv.find('.loading').addClass('hidden');
                      if (data.length > 0) {
                        _notify_conv.find('.load-more').attr({
                          'data-time-end': data[data.length - 1].timestamp
                        });
                      }

                    });
                  }
                }
              }
            });
          }
        });
        global.ui.logger.log('Container event listeners set');

        // 查询这个会话的未读数，加载首屏消息
        if(!global.counter.hasOwnProperty('data')){
           global.counter.data = {} 
        }
        if(!global.counter.data.hasOwnProperty(category)){
           global.counter.data['category'] = {}
        }
        
        var count_data = global.counter.data[category] || {},
          channel_unread_count = count_data.count || 0;
        _load_first_screen(channel_unread_count);

        global.ui.logger.log('notify_conversation component init done');

      });

    },
    /** conversation_manager 组件，用于管理多个会话 **/
    create_conversation_manager: function(selector, allowed_channel_types, channels) {
      var that = global,
        container = $(selector),
        requirements = [ // TODO maybe we don't need `message.init` module?
          'zopen.message:init.js',
          'zopen.message:templates.js'
        ];

      load(requirements, function() {
        // 去重，如果已有管理器组件就不要创建
        if (container.find('.ui_conversation_manager').length > 0) {
          global.ui.logger.info('conversation_manager UI component already exists in container', container.selector);
          return false;
        }

        var rendered_html = '\
          <div class="ui_conversation_manager">\
            <div class="conversations"></div>\
          </div>',
          conversations_container;

        container.append(rendered_html);
        conversations_container = container.find('.conversations');
        global.ui.logger.log('UI updated');

        // 依次创建会话
        $.each(channels, function(i, channel) {
          var conv_selector = '.ui_conversation[data-type="' + channel.type + '"][data-channel="' + channel.name + '"]';

          if (conversations_container.find(conv_selector).length == 0) {
            // Create a container to contain this conversation
            global.ui.create_conversation(
              conversations_container.selector,
              channel.type,
              channel.name,
              function() {
                // 隐藏会话
                var _target = conversations_container.find(conv_selector);
                !_target.hasClass('hidden') && _target.addClass('hidden');
              }
            );
          }
        });
        global.ui.logger.log('', channels.length, 'init conversations created, conversation_manager component init done');

        $(document).on('channel:opened', function(event, data) {
          /**
           * 如果还没有初始化这个会话，就初始化；
           * 否则，取消展示其他会话，改为展示这个会话
           * */
          if ($.inArray(data.channel_type, allowed_channel_types) != -1) {
            var conversations_container = container.find('.conversations'),
              conv_selector = '.ui_conversation[data-type="' + data.channel_type + '"][data-channel="' + data.channel_name + '"]',
              target_conversation = conversations_container.find(conv_selector),
              toggle_current_conversation;

            toggle_current_conversation = function() {
              var target_conversation = conversations_container.find(conv_selector);
              conversations_container.find('.ui_conversation:not(.hidden)').addClass('hidden');
              target_conversation.removeClass('hidden');

              // 如果会话自身可见，认为是已读
              if (target_conversation.is(':visible')) {
                global.utils.mark_read(data.channel_name, data.channel_type);
              }
            };

            if (target_conversation.length == 0) {
              global.ui.create_conversation(
                conversations_container.selector,
                data.channel_type,
                data.channel_name,
                toggle_current_conversation
              );
            } else {
              toggle_current_conversation();
            }
          }
        }).on('channel:closed', function(event, data) {
          /**
           * 如果容器内有这个会话，就删除
           * */
          if ($.inArray(data.channel_type, allowed_channel_types) != -1) {
            var conversations_container = container.find('.conversations'),
              conv_selector = '.ui_conversation[data-type="' + data.channel_type + '"][data-channel="' + data.channel_name + '"]';

            if (conversations_container.find(conv_selector).length > 0) {
              conversations_container.find(conv_selector).remove();
            }
          }
        });

        // 如果会话已经创建了，后续会话自身可以接收没有 ID 的消息，不需要管理器接手。管理器只需要在会话首次创建时处理一次没有 ID 的消息
        $.each(allowed_channel_types, function(i, channel_type) {
          var event_name = (channel_type == 'notify') ? ('notify') : ('chat');
          $(document).on(event_name, function(event, data) {
            var conversations_container = container.find('.conversations'),
              _channel_name = global.utils.normalize_comm_channel_name(data.channel_name),
              conv_selector = '.ui_conversation[data-type="' + data.channel_type + '"][data-channel="' + _channel_name + '"]',
              _insert_msg = null;

            if (conversations_container.find(conv_selector).length == 0) {
              if (event_name == 'chat') {
                _insert_msg = function() {
                  global.ui.insert_chat_msg(_channel_name, data);
                  var _target = conversations_container.find(conv_selector);
                  !_target.hasClass('hidden') && _target.addClass('hidden');
                };
              } else if (event_name == 'notify') {
                _insert_msg = function() {
                  var _conv_inner_container = conversations_container.find(conv_selector);
                  !_conv_inner_container.hasClass('hidden') && _conv_inner_container.addClass('hidden');
                  if (!data.id || _conv_inner_container.find('.notification-list .msg_item[data-msg-id="' + data.id + '"]').length == 0) {
                    // Prepare template context
                    var context = global.notify._msg2context(data);
                    context.unread = true;

                    // Insert to the beginning of notification list
                    _conv_inner_container.find('.notification-list').prepend(EDO.templates['zopen.message:notification.hb'](context));
                    global.ui.logger.log('Inserted initial notify msg', data);
                  }
                }
              }

              global.ui.create_conversation(
                conversations_container.selector,
                data.channel_type,
                _channel_name,
                _insert_msg
              );
            }
          });
        });
      });

    },
    // 渲染一条聊天消息到消息历史区域
    insert_chat_msg: function(channel_name, msg, before) {
      var __insert = function(before) {
          var that = global.chat,
            from_self = msg.from.id === global.client.user.id,
            none_human = !(/^users\..+/.test(msg.from.id)),
            is_image = !$.isEmptyObject(msg.context || {}),
            is_file = msg.attachments && msg.attachments.length,
            template = (is_image) ? (EDO.templates['zopen.message:chat_image.hb']) : (EDO.templates['zopen.message:chat_message.hb']),
            template = (is_file) ? (EDO.templates['zopen.message:chat_message.hb']) : (template),
            image_id = (is_image) ? ('chat-image-' + msg.context.uid) : (null),
            file_id = (is_file) ? ('chat-files-' + msg.timestamp) : (null),
            context = {
              message: msg.body || '',
              sender: (from_self) ? ('me') : ('them'),
              username: (from_self) ? (I18N.me) : (msg.from.name),
              pid: msg.from.id,
              time: timestampToShowDateString(msg.timestamp, true, true),
              id: 'msg.' + channel_name + (msg.id || msg.from.id + msg.channel_name + 'ts_' + msg.timestamp),
              failed: msg.failed || false
            },
            msg_board = $('.ui_conversation[data-channel="' + channel_name + '"] .conversation-history-body'),
            file_uids = [];

          // 注意：transient 消息没有 id，使用时间戳作为 ID 的一部分
          if (typeof msg.id === 'undefined') {
            msg.id = context.id;
          }
          if (none_human) {
            context.sender = 'nonehuman';
            context.nonehuman = none_human;
          }
          if (is_file) {
            $.each(msg.attachments, function(index, attach) {
              attach.uid && file_uids.push(attach.uid);
            });
          }
          // 首尾消息去重
          if (msg.id) {
            if ($('[id="' + context.id + '"]').length !== 0) {
              return false;
            }

            msg_html = template(context);

            if (before) {
              (msg_board.children().length > 0) ? (msg_board.children().eq(0).before($(msg_html))) : (msg_board.append($(msg_html)));
            } else {
              msg_board.append($(msg_html));
            }

            // Lightbox 图片处理
            if (is_image) { // var viewer = EdoViewer.createViewer(context.id);
              $('[id="' + context.id + '"]').kss('@zopen.message:render_chat_image', {
                image_uid: msg.context.uid,
                node_id: context.id
              });
            } else if (is_file) {
              $('[id="' + context.id + '"]').kss('@@render-chat-files', {
                file_uids: JSON.stringify(file_uids),
                node_id: context.id
              });
            }
          }
        },
        _ts = EDO.templates,
        before = before || false;
        __insert(before);
    },

    /** FIXME Clean up and remove these legacy code **/
    set_conversation_time_end: function(cid, timestamp) {
      $('.conversation[cid="' + cid + '"] input[name="time_end"]').val(timestamp);
    },
    _show_conversation_loading: function(cid) { // conversation_id
      var conv = $('.conversation[cid="' + cid + '"] .conversation-history-header');
      !conv.hasClass('loading') && conv.addClass('loading');
    },
    _hide_conversation_loading: function(cid) { // conversation_id
      var conv = $('.conversation[cid="' + cid + '"] .conversation-history-header');
      conv.hasClass('loading') && conv.removeClass('loading');
    },
  };
})(window.message = window.message || {});