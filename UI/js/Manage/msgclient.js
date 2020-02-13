/**
 * Message Client
 * @date 2015.04.01
 * @require MsgClient.js
 * @require flXHR
 * @require jQuery
 */
!(function(obj){
    function MsgClient(rtc, options){
        var that = this;
        // RTC
        that.rtc = rtc;
        that.account = options.account || rtc.account;
        that.token = options.token || rtc.token;
        that.main_instance = options.main_instance || rtc.main_instance;
        that.user = options.user || rtc.user;
        that.server = options.server || rtc.server;
        // API 地址
        that._urls = {
            // trigger_notify_event: '/api/v2/message/trigger_notify_event', // 客户端不能发送通知
            trigger_private_event: '/api/v2/message/trigger_private_event', 
            trigger_group_event: '/api/v2/message/trigger_group_event', 
            unread_stat: '/api/v1/message/unread_stat', 
            query_count: '/api/v1/message/query_count', 
            query: '/api/v1/message/query'
        };
        that._api_event_mapping = {};
        that._api_event_mapping[that.server+'/api/v2/message/trigger_private_event'] = 'message:chat:failed';
        that._api_event_mapping[that.server+'/api/v2/message/trigger_group_event'] = 'message:chat:failed';
        that._api_event_mapping[that.server+'/api/v1/message/unread_stat'] = 'message:unread_stat:failed';
        that._api_event_mapping[that.server+'/api/v1/message/query_count'] = 'message:query_count:failed';
        that._api_event_mapping[that.server+'/api/v1/message/query'] = 'message:query:failed';

        that._debug = options.debug || false;
        return that;
    };
    MsgClient.prototype._get_channel = function(chat_target, is_group){
        // 获取频道
        var that = this;
        var is_group = is_group || false;
        if(is_group){ return chat_target; }
        var users = [chat_target, that.user.id];
        users.sort();
        return users.join(',');
    };
    MsgClient.prototype._log = function(e, is_error){
        // 根据调试设置和参数类型自动输出日志
        var that = this,
            // 出错或者调试模式下需要输出 stacktrace
            showstack = is_error || that._debug;
        if(e.constructor.name === 'Array'){
            var msg = [];
            for(var i = 0, l = e.length; i < l; i++){
                var _e = e[i];
                if(_e.constructor.name === 'Error'){
                    msg.push(_e.message || _e.toString());
                }else if(_e.constructor.name === 'Object'){
                    var _e = JSON.stringify(_e);
                }
                msg.push(_e);
            };
            var msg = msg.join('  ');
        }else if(e.constructor.name === 'Error'){
            var msg = e.message || e.toString();
        }else if(e.constructor.name === 'Object'){
            var msg = JSON.stringify(e);
        }else{
            var msg = e.toString();
        }
        if(window.console){
            // 输出 msg
            if (is_error) {
                console.error && console.error('消息中心日志: ', msg);
            } else {
                console.log && console.log('消息中心日志: ', msg);
            }
            // 如果是错误，本身有 stacktrace；否则要手动记录 stacktrace
            showstack && !is_error && console.trace && console.trace();
        }
    };
    MsgClient.prototype._dispatch_event = function(api_url, data){
        // 请求 API 失败时抛出一些事件，供有需要的地方使用
        var that = this, _data;
        if(!data.channel){
            if(data.group_id){
                data.channel = that._get_channel(data.group_id, true);
            }else{
                var _j = $.parseJSON(data.event_data);
                data.channel = that._get_channel(_j.to[0], false);
            }
        }
        $(document).trigger(that._api_event_mapping[api_url], data || {});
    };
    MsgClient.prototype._fallback_request = function(options, callback){
        // CautionL: do not directly use this. Use _proxy_request insted.
        // Use Flash proxy to send cross-origin requests
        // Does not handle Flash player disability.
        var that = this,
            callback = callback || options.complete || options.success || function(){},
            onerror = (typeof options.error === 'function')?(options.error):(function(){
                that._dispatch_event(options.url, options.data || {});
                //callback({});
            }),
            timeout = 10 * 1000;
        if(!(options.url && options.method)){
            return that._log(['flXHR: 没有指定请求方法或地址：', options], true);
        }
        var data = options.data || {};
        that._log(['flXHR: 使用 Flash 进行网络通信']);
        load(['flXHR/flXHR.js'], function(){
            try{
                if(!that._proxy){
                    that._proxy = new flensed.flXHR({
                        xmlResponseText: false,
                        loadPolicyURL: that.server + '/crossdomain.xml',
                        noCacheHeader: true,
                        timeout: timeout,
                        onerror: onerror,
                        ontimeout: onerror
                    });
                } else {
                    if(that._proxy.onerror){
                        // 如果 Flash player 不可用，.Reset() 会触发上一次设置的 onerror 处理器，这里先解除 onerror 再 Reset
                        that._proxy.onerror = new Function;
                    }
                    that._proxy.Reset();
                    that._proxy.Configure({
                        xmlResponseText: false,
                        loadPolicyURL: that.server + '/crossdomain.xml',
                        noCacheHeader: true,
                        timeout: timeout,
                        onerror: onerror,
                        ontimeout: onerror
                    });
                }
                that._proxy.open(options.method, options.url);
                that._proxy.onreadystatechange = function(proxy){
                    if(proxy.readyState === 4){
                        if(!callback){ return false; }
                        try{
                            var j = JSON.parse(proxy.responseText);
                            return callback(JSON.parse(proxy.responseText));
                        }catch(e){
                            try{
                                var j = jQuery.parseJSON(proxy.responseText);
                            }catch(e){
                                that._log(['flXHR: 在请求API接口之后产生了错误：', proxy.responseText, e], true);
                                return onerror(e);
                            }
                        }
                    }
                };
                data._nocache = Math.random();
                that._proxy.send($.param(data));
            }catch(e){
                that._log(['flXHR: 请求出错：', e], true);
                return onerror(e);
            }
        }, onerror);
    };
    MsgClient.prototype._proxy_request = function(options, callback){
        // 简化的跨域 XHR 请求
        var that = this,
            callback = callback || options.complete || options.success || function(){},
            onerror = (typeof options.error === 'function')?(options.error):(function(){
                that._dispatch_event(options.url, options.data || {});
                //callback({});
            }),
            timeout = 10 * 1000;
        if(!(options.url && options.method)){
            return that._log(['没有指定请求方法或地址：', options], true);
        }
        var data = options.data || {};
        try{
            if(typeof XDomainRequest === 'undefined'){
                $.ajax({
                    cache: false,
                    crossDomain: true,
                    data: data,
                    dataType: 'json',
                    method: options.method,
                    type: options.method,
                    success: callback,
                    timeout: timeout,
                    error: function(jqxhr, textStatus, error){
                        // IE 8-9 有 XDomainRequest，但是 jQuery 插件有问题，干脆用 Flash
                        if(obj.EDO.isIE7 || obj.EDO.isIE8 || obj.EDO.isIE9){
                            that._log(['网络请求出错，转为使用 flXHR 请求'], true);
                            return that._fallback_request(options, callback);
                        }else{
                            that._log(['网络请求出错', error], true);
                            return onerror(error);
                        }
                    },
                    traditional: true,
                    url: options.url
                });
            }else{
                var xdr = new XDomainRequest();
                xdr.open(options.method, options.url);
                xdr.ontimeout = function(){ callback({}); }
                xdr.onerror = onerror;
                xdr.onload = function(){ callback(JSON.parse(xdr.responseText)); };
                setTimeout(function(){
                    xdr.send($.param(data));
                }, 0);
            }
        }catch(e){
            that._log(['未预期的错误: ', e], true);
            return onerror(e);
        }
    };
    MsgClient.prototype.trigger_private_event = function(options, callback){
        var that = this, 
            data = {}, 
            channel_type = options.channel_type, 
            channel_names = options.channel_names, 
            evt_name = options.event_name || 'chat', 
            evt_data = options.event_data, 
            persist = options.persist || false;
        evt_data = evt_data || {};
        if(!evt_name || !evt_data.to.length){ return false; }
        if(!that.rtc.is_online()){
            return that._log('当前处于离线状态，不能发送消息、触发事件', true);
        }
        evt_data['type'] = evt_name;
        data = {
            account: that.account, 
            instance: that.main_instance, 
            access_token: that.token, 
            event_name: evt_name, 
            event_data: JSON.stringify(evt_data), 
            event_type: (persist)?('persistent'):('transient')
        };
        return that._proxy_request({
            method: 'POST', 
            url: that.server + that._urls.trigger_private_event , 
            data: data, 
            success: callback
        });
    };
    MsgClient.prototype.trigger_group_event = function(options, callback){
        var that = this, 
            data = {}, 
            evt_name = options.event_name || 'chat', 
            evt_data = options.event_data, 
            group_id = options.group_id, 
            persist = options.persist || false;
        evt_data = evt_data || {};
        if(!evt_name || !group_id){ return false; }
        if(!that.rtc.is_online()){
            return that._log('当前处于离线状态，不能发送消息、触发事件', true);
        }
        evt_data['type'] = evt_name;
        data = {
            account: that.account, 
            instance: that.main_instance, 
            access_token: that.token, 
            group_id: group_id, 
            event_name: evt_name, 
            event_data: JSON.stringify(evt_data), 
            event_type: (persist)?('persistent'):('transient')
        };
        return that._proxy_request({
            method: 'POST', 
            url: that.server + that._urls.trigger_group_event, 
            data: data, 
            success: callback
        });
    };
    MsgClient.prototype.send_message = function(to_user, body, context, attachments, subject, callback){
        // 私聊
        var that = this, 
            event_data;
        event_data = {
            to: [to_user], 
            from: that.user, 
            body: body || '', 
            account: that.account, 
            instance: that.main_instance, 
            attachments: attachments || [], 
            context: context || {}, 
            subject: subject || ''
        };
        return that.trigger_private_event({
            event_data: event_data, 
            persist: true
        }, callback);
    };
    MsgClient.prototype.send_group_message = function(room_uid, body, context, attachments, subject, callback, at){
        // 群聊
        var that = this, 
            tos = [], 
            event_data;
        if(!!at && at.length > 0 && $.isArray(at)){
            tos = at;
        }
        event_data = {
            from: that.user, 
            body: body || '', 
            account: that.account, 
            instance: that.main_instance, 
            attachments: attachments || [], 
            context: context || {}, 
            subject: subject || ''
        };
        if(tos.length > 0){
            event_data['to'] = tos;
        }
        return that.trigger_group_event({
            group_id: room_uid, 
            event_data: event_data, 
            persist: true
        }, callback);
    };
    MsgClient.prototype.mark_read = function(event_name, channel_type, channel_name, timestamp){
        // 标记已读
        var that = this,
            channel_name = channel_name;
        if(!that.rtc.is_online()){
            return that._log('当前处于离线状态', true);
        }
        // 传入的是高级 channel_name (human-readable channel name)，转换为通讯层
        // channel_name
        if(!(/^.+\<\>.+$/.test(channel_name))){
            if(channel_type == 'private' || /^users\..+$/.test(channel_name)){
                var users = [that.rtc.user.id, channel_name];
                users.sort();
                channel_name = users.join('<>');
            }else if(channel_type == 'notify'){
                channel_name = channel_name + '<>' + that.rtc.user.id;
            }
        }
        var event_data = {
            event_name: event_name, 
            channel_type: channel_type, 
            channel_name: channel_name, 
            timestamp: timestamp
        };
        that._log('标记'+event_data+':'+channel_type+'.'+channel_name+'的已读：'+timestamp);
        return that.rtc.trigger_event('archive', event_data, true);
    };
    MsgClient.prototype.unread_stat = function(options, callback){
        // 查询未读数
        var that = this,
            callback = callback || options.callback;
        return that._proxy_request({
            method: 'POST', 
            url: that.server + that._urls.unread_stat, 
            data: {
                account: that.account, 
                instance: options.instance || that.main_instance, 
                access_token: that.token
            }, 
            success: callback
        });
    };
    MsgClient.prototype.query_count = function(options, callback){
        // 查询指定时间段内的消息数
        var that = this;
        var options = options || {};
        var optional = ['time_start', 'time_end'];
        var data = {
            account: that.account, 
            instance: that.main_instance, 
            access_token: that.token
        };
        for(var i = optional.length - 1; i >= 0; i--){
            var key = optional[i];
            if(!!options[key]){
                data[key] = options[key];
            }
        };
        return that._proxy_request({
            method: 'POST', 
            url: that.server + that._urls.query_count, 
            data: data, 
            success: callback
        });
    };
    MsgClient.prototype.query = function(options, callback){
        // 搜索消息
        var that = this;
        var options = options || {};
        var optional = ['time_start', 'time_end', 'limit', 'id'];
        var data = {
            account: that.account,
            instance: that.main_instance,
            limit: options.limit || 50,
            event_name: options.event_name,
            channel_type: options.channel_type,
            channel_name: options.channel_name,
            access_token: that.token
        };
        for(var i = optional.length - 1; i >= 0; i--){
            var key = optional[i];
            if(!!options[key]){
                data[key] = options[key];
            }
        };
        return that._proxy_request({
            method: 'POST',
            url: that.server + that._urls.query,
            data: data,
            success: callback
        });
    };
    MsgClient.prototype.load_chatrooms = function(){
        return (typeof EDO.chat_groups === 'undefined')?([]):(EDO.chat_groups);
    };
    MsgClient.prototype.update_chatrooms = function(rooms){
        var that = this, 
            current_rooms = that.load_chatrooms(), 
            new_rooms = [], 
            updated = [];
        $.each(rooms, function(index, room){
            var has = false;
            $.each(current_rooms, function(_index, _room){
                if(_room.uid === room.uid){
                    has = true;
                    current_rooms[_index].title = room.title;
                    current_rooms[_index].attach = room.attach;
                    updated.push({
                        uid: room.uid, 
                        title: room.title, 
                        attach: room.attach
                    });
                    return false; // same as `continue;`
                }
            });
            if(has){
                return true; // same as `break;`
            }else{
                new_rooms.push({
                    uid: room.uid, 
                    title: room.title, 
                    attach: room.attach
                });
            }
        });
        $.each(new_rooms, function(__index, new_room){
            current_rooms.push(new_room);
        });
        if(typeof EDO.chat_groups === 'undefined'){
            EDO.chat_groups = current_rooms;
        }
        return {
            added: new_rooms, 
            updated: updated
        };
    };
    MsgClient.prototype._get_objects_info = function(options){
        var that = this,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            user_ids = options.user_ids,
            data = {
                account: that.account,
                access_token: that.token
            },
            objects = [];
        if(!user_ids || !EDO || !EDO.servers || !EDO.servers.org){
            return user_ids;
        }
        $.each(user_ids, function(_index, id){
            if(/^users\..+$/gi.test(id)){
                objects.push('person:'+id.replace('users.', ''));
            }else if(/^groups\.tree\..+$/gi.test(id)){
                objects.push('ou:'+id.replace('groups.tree.', ''));
            }
        });
        data.objects = objects.join(',');
        return that._proxy_request({
            method: 'POST',
            url: EDO.servers.org + '/api/v1/org/get_objects_info',
            data: data,
            success: callback
        });
    };
    // 绑定到 window
    obj.MsgClient = MsgClient;

})(window);

