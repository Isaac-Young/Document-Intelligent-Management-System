/**
 * Real Time Communication
 * @date 2015.03.31
 * @require Socket.IO (for compability. And a MQT-Socket.IO bridge must be run somewhere else.)
 * @require Paho JavaScript lib
 * @require flXHR (for cross-domain request)
 * @require jQuery (for event triggering)
 * Publick APIs:
 *     .connect({instances: []})
 *     .close()
 *     .trigger_event(name, data)
 *     .is_online()
 *     .user_state([user_ids], callback)
 */
!(function(obj){
    function RTC(options){
        this._appname = 'Web (JS)';
        this._id_store_key = 'client_ids';
        this.server = options.server;
        this.account = options.account;
        if(!!options.token){
            this.token = options.token;
        }
        this.user = options.user;
        this._topic_mapping = {};
        this._debug = options.debug || false;
        this._client = null;
        this._iosocket = null;
        this.use_ssl = false;
        this._FALLBACK = !('WebSocket' in obj);
        // Debugging purpose
        if(this._debug && options.fallback){
            this._FALLBACK = true;
        }
        this._errors = {
            LICENSE_EXPIRED: 'license_expired',
            COUNT_EXCEEDED: 'count_exceeded'
        };
        this._subscribed = [];
        this.id = null;
        this.retry_id = null;
        this.retry_interval = 10;
        this._broker = null;
        this._iobridge = null;
        this._qos = 1;
        this._sys_topic = 'msgcenter';
        this._online = false;
        this._online_detection_id = null;
        this._online_detection_interval = 60; // 每分钟检测一次
        this._prepare_timeout = 60 * 2; // 申请连接之后经过这么长时间就不能使用申请的凭证连接了

        // 用到的 HTTP API 地址
        this._urls = {
            connect: '/api/v1/message/connect',
            user_state: '/api/v1/session/user_state'
        };
        // 连接消息的不同状态与事件名称的对应关系
        this._connection_event_mapping = {
            fail: 'rtc:failed',
            offline: 'rtc:disconnected',
            online: 'rtc:connected',
            refuse: 'rtc:refused',
            kill: 'rtc:killed'
        };
        this.main_instance = null;
        return this;
    };
    RTC.prototype._log = function(e, is_error){
        // 根据调试设置和参数类型自动输出日志
        var that = this;
        if(!that._debug){ return false; }
        if(e === undefined){ return; }
        if(e.constructor.name === 'Array'){
            var msg = [];
            for(var i = 0, l = e.length; i < l; i++){
                var _e = e[i];
                if(_e === undefined){ continue; }
                if(_e.constructor.name === 'Error'){
                    var _e = [_e.message || 'Error: ', _e.stack].join('\n');
                }else if(e.constructor.name === 'Object'){
                    var _e = JSON.stringify(_e);
                }
                msg.push(_e);
            };
            var msg = msg.join('  ');
        }else if(e.constructor.name === 'Error'){
            var msg = [e.message || 'Error: ', e.stack].join('\n');
        }else if(e.constructor.name === 'Object'){
            var msg = JSON.stringify(e);
        }else{
            var msg = e.toString();
        }
        if(is_error){
            return window.console && console.error('RTC 错误: ', msg);
        }
        return that._debug && window.console && console.log('RTC 日志: ', msg);
    };
    RTC.prototype._reconnect = function(){
        var that = this,
            instances = [],
            main_instance = that.main_instance || null;
        for(var instance in that._topic_mapping){
            instances.push(instance);
        };
        if($.inArray(main_instance, instances) == -1){
            instances.push(main_instance);
        }
        if(!that.retry_id && main_instance){
            that.retry_id = setInterval(function(){
                that._log('正在尝试重新连接');
                that.connect({
                    instances: instances,
                    main_instance: main_instance
                });
            }, that.retry_interval * 1000);
        }
    };
    RTC.prototype._stop_reconnect = function(){
        var that = this;
        if(that.retry_id){
            clearInterval(that.retry_id);
            that.retry_id = null;
            that._log('自动重连已停止');
        }
    };
    RTC.prototype._dispatch_event = function(msg){
        // 根据消息的具体情况抛出不同的事件
        var that = this;
        // 丢弃不属于自己的消息
        if((typeof msg.user_id !== 'undefined') && (msg.user_id !== that.user.id)){ return false; }
        // 丢弃太旧的消息
        var now = new Date() / 1000.0;
        if(!msg.event_name){ // ??
            return that._log(['缺少消息类型数据，无法确定事件名称：', msg], true);
        }else{
            // 其他站点的消息事件
            if(msg.instance != that.main_instance){
                return $(document).trigger('rtc_msg:othersite', msg.event_data);
            }else{
                switch(msg.event_name){
                    case 'connection':
                        // 连接消息
                        if(!!msg.client_id && msg.client_id != that.id){
                            that._log(['收到发送给其他客户端的连接消息：', msg.client_id]);
                        }
                        // 根据连接消息具体内容确定抛出什么事件
                        var event_name = that._connection_event_mapping[msg.event_data.status],
                            to_all = !msg.client_id,
                            to_me = (!!msg.client_id && (msg.client_id === that.id));
                        if(!!event_name){
                            switch(event_name){
                                case 'rtc:disconnected':
                                    // 可能是服务端要求下线，先关闭连接再重连
                                    if(that._online && (to_all || to_me)){
                                        that._log(['服务端要求重连', JSON.stringify(msg)]);
                                        that._online = false;
                                        that.close();
                                        that._reconnect();
                                    } else {
                                        // 不是发给自己的，不用理会
                                        return false;
                                    }
                                break;
                                case 'rtc:failed':
                                    // 非主站点登录失败，不影响主站点消息接收，不应该重连
                                    that._log(['登录失败', JSON.stringify(msg)]);
                                    if(to_me && ($.inArray(that.main_instance, msg.event_data.instances) > -1)){
                                        that._online = false;
                                        that._reconnect();
                                    }
                                break;
                                case 'rtc:connected':
                                    if(!that._online && to_me){
                                        that._log(['连接成功', JSON.stringify(msg)]);
                                        that._online = true;
                                        that._stop_reconnect();
                                    }
                                    // 有新设备登录
                                    if(window.store && !to_me && store.get(that._id_store_key, []).indexOf(msg.client_id) === -1){
                                        // TODO Should we break with `return` here?
                                        return $(document).trigger('rtc:new_login', msg);
                                    }
                                break;
                                // 连接被拒绝或连接被杀死，不再继续重连
                                case 'rtc:killed':
                                    if(to_me || to_all){
                                        that._log(['连接被杀死', JSON.stringify(msg)]);
                                        that._online = false;
                                        that.close();
                                        that._stop_reconnect();
                                    } else {
                                        // 不是发给自己的，不用理会
                                        return false;
                                    }
                                break;
                                case 'rtc:refused':
                                that._log(['连接被拒绝', JSON.stringify(msg)]);
                                // 主站点被拒绝登录时才断开连接，其余站点被拒绝连接，不做任何操作（收不到消息的）
                                    if(to_me && ($.inArray(that.main_instance, msg.event_data.instances) > -1)){
                                        that._online = false;
                                        that.close();
                                        that._stop_reconnect();
                                        msg.reason = msg.event_data.reason;
                                    }
                                break;
                            };
                            return $(document).trigger(event_name, msg);
                        }
                        return that._log(['无法确定连接事件名称：', msg], true);
                    break;
                    default:
                        // 抛出自定义事件
                        // 只抛出当前实例的事件
                        var valid = (msg.account === that.account) && (msg.instance === that.main_instance);
                        if(!valid){ return false; }

                        // Ignore events sent by current client (self)
                        if(msg.client_id == that.id){ return false; }
                        // What the hell?
                        if(!!msg.client_id){ msg.event_data.client_id = msg.client_id; }
                        return $(document).trigger(msg.event_name, msg.event_data);
                };
            }
        }
    };
    RTC.prototype._proxy_request = function(options){
        // 简化的跨域 XHR 请求
        var that = this;
        if(!(options.url && options.method)){
            return that._log(['没有指定请求方法或地址：', options], true);
        }
        var data = options.data || {},
            error = (typeof options.error === 'function')?(options.error):(function(){}),
            callback = (typeof options.success === 'function')?(options.success):(function(){}),
            timeout = 10 * 1000;
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
                    error: function(jqXHR, textStatus, e){
                        that._log(['ajax 跨域请求出错，转为 Flash 兼容模式：', e]);
                        load(['flXHR/flXHR.js'], function(){
                            if(!that._proxy){
                                that._proxy = new flensed.flXHR({
                                    xmlResponseText: false,
                                    loadPolicyURL: that.server + '/crossdomain.xml',
                                    noCacheHeader: true,
                                    onerror: function(){},
                                    ontimeout: function(){},
                                    timeout: timeout
                                });
                            }
                            that._proxy.open(options.method, options.url);
                            that._proxy.onreadystatechange = function(proxy){
                                if(proxy.readyState === 4){
                                    if(!callback){ return false; }
                                    try{
                                        return callback(JSON.parse(proxy.responseText));
                                    }catch(e){
                                        return that._log(['在请求API接口之后产生了错误：', proxy.responseText, e], true);
                                    }
                                }
                            };
                            data._nocache = Math.random();
                            that._proxy.send($.param(data));
                        });
                    },
                    traditional: true,
                    url: options.url
                });
            }else{
                var xdr = new XDomainRequest();
                xdr.open(options.method, options.url);
                xdr.ontimeout = function(){ callback({}); }
                xdr.timeout = timeout;
                xdr.onerror = error;
                xdr.onload = function(){ callback(JSON.parse(xdr.responseText)); };
                setTimeout(function(){
                    xdr.send($.param(data));
                }, 0);
            }
        }catch(e){
            return (typeof options.error === 'function')?(options.error()):(null);
        }
    };
    RTC.prototype._unsubscribe = function(topic){
        var that = this;
        if((!that._iosocket && that._FALLBACK)||(!that._client && !that._FALLBACK)){
            that._log(['RTC 底层尚未连接但被请求取消订阅', topic]);
            return false;
        }
        if(that._FALLBACK){
            if(!that._iosocket || !that._iosocket.connected){
                that._log(['RTC 兼容模式已断开，但被请求取消订阅', topic]);
                return false;
            }
            that._iosocket.emit('unsubscribe', {topic: topic});
        }else{
            if(!that._client || !that._client.isConnected()){
                that._log(['RTC MQTT模式已断开，但被请求取消订阅', topic]);
                return false;
            }
            that._client.unsubscribe(topic);
        }
    };
    RTC.prototype.connect = function(options, callback){
        // 连接
        var that = this;
        that.main_instance = options.main_instance || null;
        if(!that.main_instance){
            return that._log(['没有指定要连接的主实例：', options], true)
        }
        if(that.is_online()){
            that._stop_reconnect();
            $(document).trigger('rtc:connected', that._generate_connection_msg(true));
            return that._log('RTC 底层已经连接，无需重连');
        }
        for(var _topic in that._subscribed){
            that._unsubscribe(_topic);
        }
        that._subscribed = [];
        that._topic_mapping = {};
        var parameters = {
            account: that.account,
            instances: JSON.stringify(options.instances),
            access_token: that.token
        };
        that._proxy_request({
            url: that.server + that._urls.connect,
            method: 'POST',
            data: parameters,
            success: function(response){
                // 获取连接服务器的地址和端口
                that._broker = response.broker;
                that._iobridge = response.io_bridge;
                that.id = response.client_id;
                // 获取要连接的 instances
                var instances = [],
                    expired = response.expired_instances || [],
                    exceeded = response.exceeded_instances || [];
                for(var instance in response.topics){
                    if(!!response.topics[instance]){
                        that._topic_mapping[instance] = response.topics[instance];
                        instances.push(instance);
                    }
                }
                if(instances.length === 0){
                    if($.inArray(that.main_instance, expired) !== -1){
                        that._log('当前站点许可已过期', true);
                        $(document).trigger('rtc:refused', {
                            'reason': that._errors.LICENSE_EXPIRED
                        });
                    }
                    if($.inArray(that.main_instance, exceeded) !== -1){
                        that._log('当前站点在线人数超出限制', true);
                        $(document).trigger('rtc:refused', {
                            'reason': that._errors.COUNT_EXCEEDED
                        });
                    }
                }
                that.use_ssl = response.use_ssl || false;
                // 根据浏览器情况选择连接到 Socket.io 或 MQTT
                if(that._FALLBACK){
                    that._connect_socketio();
                }else{
                    that._connect_mqtt();
                }
                // Share ids within the same browser
                if(window.store){
                    var stored_ids = store.get(that._id_store_key, []);
                    if(stored_ids.indexOf(that.id) === -1){
                        stored_ids.unshift(that.id);
                        // Limit to 20 ids
                        while(stored_ids.length > 20){
                            stored_ids.pop();
                        }
                        store.set(that._id_store_key, stored_ids);
                    }
                }
                if(that._online_detection_id !== null){
                    clearInterval(that._online_detection_id);
                }
                that._online_detection_id = setInterval(function(){
                    if(that.is_online()){
                        return false;
                    }
                    var connected_offline = false,
                        disconnected = false;
                    if(that._FALLBACK){
                        disconnected = (!that._iosocket || !that._iosocket.connected);
                    }else{
                        disconnected = (!that._client || !that._client.isConnected());
                    }
                    if(disconnected){
                        // 底层连接已断开，请求重新连接
                        that._log('在线状态检测：RTC 底层连接已断开，将会尝试重连');
                        $(document).trigger('rtc:disconnected', that._generate_connection_msg(false));
                        return that._reconnect();
                    }
                    if(!disconnected && !that.is_online()){
                        // 底层连接正常，但是并没有处于在线状态
                        that._log('在线状态检测：RTC 底层连接正常，但当前离线，将重新发送上线消息');
                        $(document).trigger('rtc:disconnected', that._generate_connection_msg(false));
                        return that._send_connection_msg(true);
                    }
                }, that._online_detection_interval * 1000);
                var callback = callback || that.on_connect || null;
                if(typeof callback === 'function'){
                    try{
                        return callback();
                    }catch(e){
                        that._log(['连接回调出错：', e], true);
                    }
                }
            }, 
            error: function(){
                $(document).trigger('rtc:failed', {});
                var callback = callback || that.on_connect || null;
                if(typeof callback === 'function'){
                    try{
                        callback();
                    }catch(e){
                        that._log(['连接回调出错：', e], true);
                    }
                }
                that._reconnect();
            }
        });
    };
    RTC.prototype._connect_socketio = function(){
        var that = this;
        that._socketio_per_msg_delay = 400;
        that._socketio_events_pool = [];
        var prefix = (that.use_ssl)?('https://'):('http://'),
            bridge_host = that._iobridge.replace(/^(http|https)\:\/\//gi, ''),
            host_and_port = bridge_host.split(':');
        if(host_and_port.length > 1){
            host_and_port[1] = host_and_port[1].split('/')[0];
            bridge_host = host_and_port.join(':');
        }
        that._iobridge = prefix + bridge_host;
        that._iosocket = io.connect(
            that._iobridge, {forceNew: true, transports: ['polling']}
        );

        that._iosocket.on('connect', function(){
            // Monkey patch Socket.io to avoid performance issue on IE8.
            // Make a backup reference of the original Polling.ptototype.onData method
            if(typeof that._iosocket.io.engine.transport._onData == 'undefined'){
                that._iosocket.io.engine.transport._onData = that._iosocket.io.engine.transport.onData;
            }
            // Periodically popping data from the pool instead of processing them immediately
            if(typeof that._iosocket.io.engine.transport._mp_parse_packet == 'undefined'){
                that._iosocket.io.engine.transport._mp_parse_packet = function(){
                    var data = that._socketio_events_pool.pop();
                    if(!!data){
                        that._iosocket.io.engine.transport._onData(data);
                        // 如果有连续的消息（后面还有消息），延时来处理
                        if(that._socketio_events_pool.length > 0){
                            that._socketio_current_delay = that._socketio_current_delay + that._socketio_per_msg_delay;
                        }
                    }else{
                        // 如果现在空闲，那么恢复最短延时，让下一条新消息可以尽快被处理
                        that._socketio_current_delay = that._socketio_per_msg_delay;
                    }
                    setTimeout(
                        that._iosocket.io.engine.transport._mp_parse_packet,
                        that._socketio_current_delay
                    );
                };
                // Replace the Polling.ptototype.onData method to just push data into the pool
                that._iosocket.io.engine.transport.onData = function(data){
                    that._socketio_events_pool.push(data);
                };
                // Start the data consumer to check for data from the pool
                setTimeout(that._iosocket.io.engine.transport._mp_parse_packet, 100);
            }
            that._iosocket.on('mqtt', function(io_msg){
                that._log(['兼容模式，收到新消息：', io_msg]);
                try{
                    // 触发事件
                    that._dispatch_event(JSON.parse(io_msg.message));
                }catch(e){
                    return that._log(['兼容模式，消息解析失败：', io_msg, e], true);
                }
            });
            for(var instance in that._topic_mapping){
                var topic = that._topic_mapping[instance];
                if(that._subscribed.indexOf(topic) != -1){
                    continue;
                }
                that._iosocket.emit('subscribe', {topic: topic});
                that._subscribed.push(topic)
                that._log(['兼容模式，订阅了频道：', topic]);
            }
            // Set last will in fallback mode
            that._iosocket.emit(
                'will',
                {
                    topic: that._sys_topic,
                    message: that._generate_connection_msg(false)
                }
            );
            that._log('兼容模式，will 消息已设置');
            that._send_connection_msg(true);
            that._log('兼容模式，上线消息已发送');
            $(document).trigger('rtc:connected', that._generate_connection_msg(true));
        });
        that._iosocket.on('disconnect', function(e){
            that._log(['兼容模式，Socket.io 已断开连接：', e], true);
            $(document).trigger('rtc:disconnected', that._generate_connection_msg(false));
        });
        that._iosocket.on('error', function(error){
            that._log(['兼容模式，Sockt.io 发生错误：', error], true);
            $(document).trigger('rtc:failed', that._generate_connection_msg(false));
        });
        that._iosocket.on('reconnect_error', function(error){
            that._log(['兼容模式，Sockt.io 重连时发生错误：', error], true);
            $(document).trigger('rtc:failed', that._generate_connection_msg(false));
        });
        that._iosocket.on('reconnect_failed', function(){
            that._log(['兼容模式，Sockt.io 重连失败：'], true);
            $(document).trigger('rtc:failed', that._generate_connection_msg(false));
        });
    };
    RTC.prototype._connect_mqtt = function(){
        var that = this;

        that._broker = that._broker.replace(/^(http|https)\:\/\//gi, '');
        var _host = that._broker.split(':')[0],
            _port = that._broker.split(':')[1];
        if(typeof _port !== 'undefined') {
            _port = _port.split('/')[0];
        }else{
            // Use default HTTP/HTTPS port
            _port = that.use_ssl ? 443 : 80;
        }

        that._client = new Paho.MQTT.Client(
            _host,
            Number(_port),
            that.id
        );
        // Bind onMessageArrived callback, which will do:
        // * catch & filter connection msgs
        // * dispatch msgs to their registerd handlers
        that._client.onMessageArrived = function(mqtt_msg){
            that._log(['收到新消息：', mqtt_msg.payloadString]);
            try{
                var msg = JSON.parse(mqtt_msg.payloadString);
                return that._dispatch_event(msg);
            }catch(e){
                that._log(['消息解析失败：', mqtt_msg, e], true);
            }
        };
        that._client.onMessageDelivered = function(mqtt_msg){
            try{
                var msg = JSON.parse(mqtt_msg.payloadString);
                if(msg.event_name === 'connection' && msg.event_data.status === 'offline'){
                    that._log('下线消息已经发送');
                    that._client.disconnect();
                    that._log('已经下线');
                }
            }catch(e){
                return that._log(['发送了一个消息，但消息解析失败：', mqtt_msg, e], true)
            }
        };
        // Bind onConnectionLost callback
        that._client.onConnectionLost = function(error){
            that._log(['连接已断开，代码：', error.errorCode, '，信息：', error.errorMessage], true);
            if(error.errorCode !== 0){ that._reconnect(); }
            $(document).trigger('rtc:disconnected', that._generate_connection_msg(false));
        };
        that._paho_options = that._generate_paho_options();
        // All callbacks are ready, connect to MQTT broker
        try{
            that._client.connect(that._paho_options);
        }catch(e){
            // 网络原因连接失败
            that._log(['连接失败：', e], true);
            return $(document).trigger('rtc:failed', {});
        }
    };
    RTC.prototype._generate_paho_options = function(){
        // 生成 MQTT 连接参数
        var that = this;
        return {
            onSuccess: function(resp){
                // that._client.onConnectionLost = function(){
                    // window.console && that._debug && console.log('Connection lost, reconnecting...');
                    // this.connect(that._paho_options);
                // };
                for(var instance in that._topic_mapping){
                    // 已经订阅的 topic 不要重复订阅
                    var topic = that._topic_mapping[instance];
                    if(that._subscribed.indexOf(topic) != -1){
                        continue;
                    }
                    that._client.subscribe(
                        topic,
                        {
                            qos: that._qos,
                            onSuccess: function(resp){
                                that._log(['已经订阅', topic]);
                                that._subscribed.push(topic);
                            },
                            onFailure: function(resp){
                                that._log(['订阅', topic, '失败'], true);
                            }
                        }
                    );
                }
                that._send_connection_msg(true);
            },
            // 使用 cleanSession 来避免一直重复收到同一批消息
            cleanSession: false,
            useSSL: that.use_ssl,
            willMessage: that._wrap_msg(that._generate_connection_msg(false)),
            mqttVersion: 3
        };
    };
    RTC.prototype._wrap_msg = function(msg, topic){
        // 按连接模式规格化消息体：WebSocket 模式下处理成 MQTT 消息对象，兼容模式下处理成简单对象
        var that = this;
        var topic = topic || that._sys_topic;
        if(that._FALLBACK){
            return {
                topic: topic,
                message: msg
            };
        }else{
            var message = new Paho.MQTT.Message(JSON.stringify(msg));
            message.destinationName = topic;
            message.qos = that._qos;
            message.retained = false;
            return message;
        }
    };
    RTC.prototype._generate_connection_msg = function(online){
        var that = this;
        var instances = [], online = online || false;
        for(var instance in that._topic_mapping){
            instances.push(instance);
        }
        if(online){
            if(instances.length === 0){
                online = false;
            }
        }
        return {
            event_name: 'connection',
            account: that.account,
            client_id: that.id,
            instance: instances[0],
            user_id: that.user.id,
            event_data: {
                status: (online)?('online'):('offline'),
                instances: instances,
                timestamp: new Date() / 1000.0,
                appname: that._appname
            }
        };
    };
    RTC.prototype._close_socketio = function(){
        var that = this;
        that._iosocket.disconnect();
    };
    RTC.prototype._send_connection_msg = function(online){
        var that = this;
        var msg = that._generate_connection_msg(online);
        that._send(that._wrap_msg(msg), true);
        that._log((msg.event_data.status === 'online')?('上线消息已发送'):('下线消息已发送'));
        // Fix for Socket.io 因为 Socket.io 没有 delivered 事件，所以发送消息后马上断开吧
        if(!online && that._FALLBACK){
            that._close_socketio();
        }
    };
    RTC.prototype.close = function(){
        // 关闭连接
        var that = this;
        // FIXME
        that._send_connection_msg(false);
    };
    RTC.prototype.is_online = function(){
        // 检测自身在线状态
        var that = this,
            underlayer_online = false;
        if(that._FALLBACK && that._iosocket){
            underlayer_online = that._iosocket.connected;
        }else if(!that._FALLBACK && that._client){
            underlayer_online = that._client.isConnected();
        }
        return that._online && underlayer_online;
    };
    RTC.prototype.user_state = function(user_ids, callback){
        // 查询用户在线状态
        var that = this;
        that._proxy_request({
            url: that.server + that._urls.user_state,
            method: 'POST',
            data: {
                account: that.account,
                access_token: that.token,
                instance: that.main_instance,
                users: JSON.stringify(user_ids)
            },
            success: callback
        });
    };
    RTC.prototype._send = function(msg, insist){
        var that = this;
        if(!insist && !that.is_online()){
            return that._log(['处于离线状态，不能发送消息：', msg], true);
        }
        if(that._FALLBACK){
            return that._iosocket.emit('mqtt', msg);
        }else{
            return that._client.send(msg);
        }
    };
    RTC.prototype.trigger_event = function(event_name, event_data, use_sys_topic){
        // 触发多端事件
        var that = this;
        var topic = (!!use_sys_topic)?(that._sys_topic):(that._topic_mapping[that.main_instance]);
        var event_data = event_data || {};
        if(typeof event_data.timestamp === 'undefined'){
            event_data.timestamp = new Date() / 1000.0;
        }
        // 消息头在此处拼接
        var msg = {
            account: that.account,
            instance: that.main_instance,
            client_id: that.id,
            user_id: that.user.id,
            event_name: event_name,
            event_data: event_data
        };
        var msg = that._wrap_msg(msg, topic);
        that._send(msg);
    };
    // 绑定到 window
    obj.RTC = RTC;

})(window);
