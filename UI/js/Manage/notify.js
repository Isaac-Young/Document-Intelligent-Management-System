!(function(obj) {
  var I18N = window.EDO.i18n.im;
  obj.notify = {
    // 通知频道数据
    channels: {
      'sendme': {
        count: 0
      },
      'workflow': {
        count: 0
      },
      'comment': {
        count: 0
      },
      'subscribe': {
        count: 0
      },
      'default': {
        count: 0
      }
    },
    // 通知相关的翻译
    translation: {},
    // 渲染频道列表（点击站点未读数后展开的菜单）
    render: function(channels) {
      var that = obj.notify;
      // 初始化 category 的数据
      $.each(channels, function(i, channel) {
        that.channels[channel.name] = {
          name: channel.name,
          title: channel.title,
          count: channel.count || 0
        };
      });

      // 2017.09.05 使用新的通知组件
      $.each(channels, function(i, channel) {
        channel.type = 'notify';
      });
      message.ui.create_conversation_list('#notify-center #notify-channels', ['notify'], channels);
      // We'll create each notify conversation dynamically when we receive channel:opened event,
      // so leave the `channels` arg to an empty array
      message.ui.create_conversation_manager('#notify-center #msg-history', ['notify'], []);
    },
    collapse: function() {
      // 缩小为小面板
      var that = obj.notify;
      $('#notify-center').find('dd').css({
        width: '580px',
        height: 'auto'
      }).children('table td').css({
        height: '200px'
      }).find('#msg-history').css({
        height: '200px'
      });

      $('#notify-center .conversation_list_item.current').removeClass('current');
    },
    // FIXME COMPONENT_FUNCTIONS_START 这些不属于应用层的内容，应该放到通知组件模块内部
    _msg2context: function(msg) {
      var that = obj.notify,
        is_chat_mention = false,
        context;
      context = $.extend(true, {}, msg);
      if (context.action === 'mention_in_group') {
        is_chat_mention = true;
      }
      if (!$.isEmptyObject(context.context)) {
        context.context.object_types = context.context.object_types || [];
        context.context.url = root_url + '/++intid++' + context.context.uid;
        if (context.context.object_types.indexOf('Container') > -1) {
          context.context.preview = false;
        } else if (context.context.object_types.indexOf('Container') > -1) {
          context.context.preview = false;
        } else {
          context.context.preview = true;
        }
        if (context.context.object_types.indexOf('File') > -1) {
          context.context.is_file = true;
          context.has_comment = true;
        }
        if (context.context.object_types.indexOf('Container') > -1) {
          context.has_comment = false;
        } else {
          context.has_comment = true;
        }
        if (is_chat_mention) {
          context.has_comment = false;
          context.preview = false;
          context.is_chat = true;
        }
      } else {
        context.context = null;
      }
      if (!!context.attachments && context.attachments.length > 0) {
        for (var k = context.attachments.length - 1; k >= 0; k--) {
          var _attach = context.attachments[k];
          _attach.url = root_url + '/++intid++' + _attach.uid;
          if (_attach.object_types.indexOf('Container') > -1) {
            _attach.preview = false;
          } else {
            if (_attach.object_types.indexOf('File') > -1) {
              _attach.is_file = true;
            }
            _attach.preview = true;
          }
        }
      }
      // action 翻译
      context.action = that.translation.actions[context.action] || context.action;
      // JavaScript timestamps unit is `millisencod`
      context.time = timestampToShowDateString(context.timestamp, true, true);
      context.body = context.body || '';
      return context;
    },
    // FIXME COMPONENT_FUNCTIONS_END 这些不属于应用层的内容，应该放到通知组件模块内部

    // 飘窗提示，包含声音提示
    _floating_alert: function(msg) {
      var that = obj.notify,
        template = EDO.templates['zopen.message:notify_message.hb'];
      obj.settings.sound && sound();
      if (!obj.settings.float) {
        return false;
      }
      // 只显示一个飘窗
      if ($('[name=jquery-notify]').length > 2) {
        return false;
      }
      // Copy this object instead of refering to it
      context = $.extend(true, {}, msg);
      context.action = that.translation.actions[context.action] || context.action;
      if (context.context) {
        if ($.inArray('DataItem', context.context.object_types) === -1) {
          delete context.context;
        } else {
          var typs = context.context.object_types,
            types = ['Container', 'Dataitem', 'Datamanager', 'Document',
              'File', 'Flow', 'Flowsheet', 'Folder',
              'Image', 'Plan', 'Project', 'Shortcut',
              'Workgroup', 'Worksite'
            ];
          $.each(types, function(i, v) {
            if ($.inArray(v, typs) > -1) {
              context.context.type = that.translation.types[v.toLowerCase()] || '';
            }
          });
        }
      }
      var title = context.subject || I18N.new_notification,
        _with_attach = I18N.with_attach,
        has_attachments = context.attachments && context.attachments.length > 0;
      context.has_attachments = has_attachments;
      context.attach_icon = '<img src="' + cacheURL('/icon/attach.png') + '"alt="' + _with_attach + '"/>';
    // 如果是公告，悬浮显示不消失；
    if(msg.action=='announce'){
        message_float(template(context), title, true);
    }else{
        message_float(template(context), title);
    }
    },

    show_msg_detail: function(channel_name, msgid) {
      $(this).kss(root_url + '/@zopen.message:notify_detail?id=' + msgid);
    }
  };
  obj.notify.init = function(channels) {
    /** 事件绑定 **/
    // 接收通知消息事件
    $(document).on('notify', function(e, msg) {
      // 只接收发给自己的通知
      if (msg.channel_type == 'notify' && $.inArray(obj.client.user.id, msg.to) != -1) {
        // 飘窗提示
        window.message.rtc && !window.message.rtc._FALLBACK && that._floating_alert(msg);
      }
    });
    // 显示一个通知频道的消息
    $(document).on('channel:opened', function(e, data) {
      if (data.channel_type == 'notify') {
        var that = obj.notify,
          _width, _height;

        // FIXME
        // 展开成大面板
        // 根据窗口大小自动计算
        _width = $(window).width() - 360,
          _height = $(window).height() - 200;
        if (_width < 580) {
          _width = 580;
        }
        if (_height < 200) {
          _height = 200;
        }
        _width = '' + _width + 'px';
        _height = '' + _height + 'px';
        $('#notify-center').find('dd').css({
          overflow: 'auto'
        }).animate({
          width: _width,
          height: _height
        }).find('#msg-history').css({
          width: '100%',
          height: '100%'
        });

        // 显示消息历史区域
        $('#notify-center #msg-history').removeClass('hidden');

        $('#msg-history').scrollTop(0);
      }
    }).on('message:update_unreads', function(e, data){ 
        // 页面加载后查询到未读数时，如果有未读公告，也应该置顶显示
        var that = obj.notify;
        if(data.channel_type == 'notify'){
            $.each(data.unreads, function(_index, unread){
                if(unread.channel_name.split('<>')[0] == 'announcement'){
                    message.client.query({
                        time_start: unread.time_start,
                        limit: unread.count,
                        channel_type: data.channel_type,
                        channel_name: unread.channel_name.replace('<>', ','),
                        event_name: 'notify'
                    }, function(unread_msgs){
                        $.each(unread_msgs, function(_i, msg){
                            that._floating_alert(msg);
                        });
                    });
                }
            });
        }
    }).on('click', '.show-notify-detail-link', function(){ // 查看悬浮公告详情
        var msgid = $(this).data('msg-id');
        var that = obj.notify;
        that.show_msg_detail('announcement', msgid);
        $(this).closest('.jquery-message-content').find('a.close.cancelBubble').click();
        setTimeout(function(){
            if($('.show-notify-detail-link').length == 0){
                message.utils.mark_read('announcement', 'notify', new Date() / 1000.0);
        }}, 1000);
        return false;
    });
    // 点击站点未读数区域，展开通知菜单
    $('body').on('click', '#notify-trigger', function(e) {
      var that = obj.notify;
      // 恢复菜单高度
      that.collapse();
      // 折叠消息历史区域
      $('#notify-center').find('dd').css('width', 181);
      // 取消聚焦的频道
      $('li.message a.navTreeCurrentItem').removeClass('navTreeCurrentItem');
      // 隐藏消息历史区域
      $('#msg-history').closest('.CustomShowHideArea').find('#msg-history').addClass('hidden');

      /** 增加一些额外界面 **/
      var container = $('#notify-center'),
        conv_list = container.find('#notify-channels ul.ui_conversation_list');

      // 消息通知设置按钮
      if (conv_list.find('#message-notify-setting').length == 0) {
        conv_list.append($('\
            <li class="seperator"></li>\
            <li class="message">\
              <a href="javascript:void(0);"id="message-notify-setting">\
                <span>' + I18N.notification_settings + '</span>\
              </a>\
            </li>\
        '));
      }

      return false;
    });
    // 显示消息提醒设置界面
    $('body').on('click', '#message-notify-setting', function(e) {
      load(['zopen.message:notify_setting.hb'], function() {
        // 显示设置弹窗，读取数据存储中的设置项值并且还选项勾选状态
        $(EDO.templates['zopen.message:notify_setting.hb'](obj.settings)).bPopup({
          modalClose: false,
          follow: [false, false],
          opacity: 0.5,
          closeClass: "b-close",
          position: ['auto', 'auto']
        });
        return false;
      });
    });
    // 保存消息提醒设置
    $('body').on('click', '#bPopup-msg-notify input[type="submit"]', function(e) {
      var that = obj.notify,
        popup = $('#bPopup-msg-notify'),
        settings;
      // 保存设置项到数据存储中
      settings = {
        'sound': $('input[name="message_notify_sound"]').get(0).checked,
        'float': $('input[name="message_notify_float"]').get(0).checked
      };
      closeModal();
      store.set('message', settings);
      obj.settings = settings;
    });
    // 初始化：渲染频道列表
    var that = obj.notify;
    channels.length && that.render(channels);

    that.ready = true;
  };
  // TODO Directly use `I18N` object
  obj.notify.translation.actions = {
    'share': I18N.shared,
    'edit': I18N.edited,
    'new': I18N.created,
    'upload': I18N.uploaded,
    'comment': I18N.commented,
    'remind': I18N.reminded,
    'new_revision': I18N.updated_revision,
    'fix_revision': I18N.fixed_revision,
    'workflow_sign': I18N.signed_workflow,
    'publish': I18N.published,
    'workflow_resign': I18N.resigned_workflow,
    'sendme': I18N.sent_to_me,
    'mentioned': I18N.mentioned, // should deprecate this
    'mention_in_group': I18N.mention_in_group,
    'mention_in_comment': I18N.mention_in_comment,
    'announce': I18N.announced,
    'default': ''
  };
  obj.notify.translation.types = {
    'file': I18N.file,
    'folder': I18N.folder,
    'image': I18N.image,
    'document': I18N.document,
    'container': I18N.container,
    'dataitem': I18N.form,
    'shortcut': I18N.shortcut,
    'datamanager': I18N.workflow
  };
})(window.message = window.message || {});