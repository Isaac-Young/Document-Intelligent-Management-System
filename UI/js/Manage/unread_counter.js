!(function(global) {
  var get_notify_unread_count = function(data) {
    // Get total unread count number of notify channels
    var count = 0;
    $.each(data, function(channel_name, channel_data) {
      if (channel_data.type == 'notify') {
        count += channel_data.count || 0;
      }
    });
    return count;
  };
  var get_chat_unread_count = function(data) {
    // Get total unread count number of chat channels
    var count = 0;
    $.each(data, function(channel_name, channel_data) {
      if ($.inArray(channel_data.type, ['private', 'group']) != -1) {
        if ((channel_data.count || 0) > 0) {
          count += 1;
        }
      }
    });
    return count;
  };

  if (typeof global.counter === 'undefined') {
    global.counter = {};
  }
  global.counter.init = function(selector) {
    var that = global.counter,
      container = $(selector);

    // Event bindings
    $(document).on('message:count_updated', function(event, data) {
      // 通知未读数
      var notify_count = get_notify_unread_count(data),
        chat_count = get_chat_unread_count(data),
        total_count = notify_count + chat_count;
      container.text(notify_count);
      if (notify_count > 0) {
        container.removeClass('unmsg_num');
        !container.hasClass('msg_num') && container.addClass('msg_num');
      } else {
        container.removeClass('msg_num');
        !container.hasClass('unmsg_num') && container.addClass('unmsg_num');
      }

      // 页面标题的总未读数
      // 改变页面标题
      var test_reg = /^\[\d+\]/gi,
        title = $(document).attr('title');

      // Drop current count from page title
      if (test_reg.test(title)) {
        title = title.replace((title.match(test_reg)[0] || ''), '');
      }
      // Set new count value to page title
      if (total_count > 0) {
        title = '[' + total_count + '] ' + title;
      }
      $(document).attr({
        title: title
      });
    });
  };
})(window.message = window.message || {});