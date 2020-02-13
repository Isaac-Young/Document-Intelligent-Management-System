!(function(global) {
  // Notice: global is window;

  // Ensure namespace existence
  if (typeof global.EDO === 'undefined') {
    global.EDO = {};
  }
  if (typeof global.EDO.templates === 'undefined') {
    global.EDO.templates = {};
  }

  var I18N = global.EDO.i18n.im;
  /** ui.message.conversation_list components **/
  global.EDO.templates.conversation_list_item = Handlebars.compile('\
        <li class="conversation_list_item channel_{{channel_type}}">\
            <a href="javascript:void(0);"data-channel="{{channel_name}}" data-type="{{channel_type}}">\
                <span class="title pull-left"title="{{channel_title}}">{{channel_title}}</span>\
                <span class="unread pull-right"></span>\
            </a>\
            <span class="conversation_close_trigger">\
                <i class="fa fa-remove"></i>\
            </span>\
        </li>\
    ');

  /** ui.conversation (for'notify'channel_type) components **/
  global.EDO.templates.notify_conversation = Handlebars.compile('\
        <div class="ui_conversation conversation"data-channel="{{category}}" data-type="notify">\
            <div class="notification-list"></div>\
            <div class="notification-tools">\
                <span class="loading">' + I18N.loading_ +
    '<i class="fa fa-spinner" ></i>\
                </span>\
                <span class="no_more_msg">' + I18N.no_more_msg + '</span>\
                <button class="button load-more"\
                  data-time-end="{{time_end}}"\
                  data-category="{{category}}" >' + I18N.view_more + '</button>\
            </div>\
        </div>\
    ');

  /** chat panel (a left-right layout inside a container with header above) **/
  global.EDO.templates.chat_panel = Handlebars.compile('\
        <div class="chat-head">\
            <a class="min-chatpanel-button chatpanel-button"title="' + I18N.minimize + '">\
                <i class="fa fa-minus"></i>\
            </a>\
            <a class="info-chatpanel-button chatpanel-button hidden"title="' + I18N.conversation_info + '">\
                <i class="fa fa-info-circle"></i>\
            </a>\
            <div class="chat-title">\
                <span> ' + I18N.im + ' - </span>\
                <span class="online-state">(离线)</span>\
            </div>\
        </div>\
        <div class="chat-body">\
            <div id="left-tab"class="pull-left"></div>\
            <div id="right-content"class="pull-right"></div>\
        </div>\
    ');

  // 最小化的聊天窗口
  EDO.templates.chat_min_panel = Handlebars.compile('\
        <div id="chatpanel-tray"class="min-chatpanel" title="{{i18n "im.im"}}">\
            <i class="fa fa-comments fa-2x" ><span class="badge chat-unread hidden"></span></i>\
        </div>\
    ');

  // Group chat item
  EDO.templates.group_template = Handlebars.compile('\
<div id="groupchat-select" style="margin-left:10px; margin-top:-10px;">\
 <i class="fa fa-users" style="margin-left:5px;margin-top:5px;"></i> \
  <span style="margin-left:10px; color:#989898; cursor:pointer;" id="chatgroups"> <i class="fa fa-angle-down"></i> {{i18n "im.group_chat"}}</span>\
  <div>\
    <div style="margin-left:35px;" >\
      <ul style="margin-left: 14px;">\
        {{#each chatgroups }}\
        <li style="margin-bottom: 4px;">\
        <a href="javascript:void(0);" onclick="return message.chat.start_group_conversation(\'{{uid}}\');">\
          <span class="title">{{title}}</span>\
        </a>\
        </li>\
        {{/each}}\
      </ul>\
    </div>\
   {{#if archived_chatgroups}}\
    <div style="margin-left:35px; height:100px;" >\
      <span id="archived_groups" style="margin-left:13px; color:#989898; cursor:pointer"> <i class="fa fa-angle-right"></i> {{i18n "im.archived_group_chat"}}</span>\
      <ul style="margin-left: 27px; display: none; heigh:100%">\
        {{#each archived_chatgroups }}\
        <li style="margin-bottom: 4px;">\
        <a href="javascript:void(0);" onclick="return message.chat.start_group_conversation(\'{{uid}}\');">\
          <span class="title">{{title}}</span>\
        </a>\
        </li>\
        {{/each}}\
      </ul>\
    </div>\
   {{/if}}\
  </div>\
</div>');
})(window);