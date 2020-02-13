var EDOViewer={previewPatterns:{flash:/^(.doc|.docm|.docx|.dot|.dotx|.pot|.potm|.ppt|.pps|.pptx|.mpp|.ppsx|.pdf|.rtf|.wps|.wpt|.et|.ett|.dps|.dpt|.odt|.odp|.ott|.ots|.otp|.vsd|.vsdx|.psd|.vss|.vst|.dwg|.dxf|.cdr|.wmf|.key|.pages|.numbers|.tif|.tiff|.xmind|.xlt|.xltx|.emf|.wpsx|.etx)$/i,html:/^(.json|.bat|.md|.eml|.xls|.xlsx|.xlsm|.mht|.html|.htm|.txt|.rst|.xml|.css|.csv|.java|.c|.cpp|.jsp|.asp|.php|.py|.as|.sh|.ini|.yaml|.dart|.js|.go|.coffee|.log|.ods|.dot|.fodt|.uot|.odg|.otg|.fodg|.fodp|.uop|.fods|.xlt|.xmind|.slk|.msg|.chm)$/i,compress:/^(.rar|.zip|.tar|.tgz|.gz|.7z)$/i,audio:/^(.mp3|.wma|.wav|.mid|.ogg|.m4a)$/i,video:/^(.avi|.rmvb|.rmvb|.mov|.mp4|.swf|.flv|.mpg|.ram|.wmv|.m4v|.3gp|.vob|.dat|.rm)$/i,image:/^(.png|.gif|.jpg|.jpeg|.bmp|.ppm|.ico)$/i},retryCount:200,intervalSecond:3,langs:{zh:{loading:"加载中请稍候",converting:"转换中请稍候",timeout:"转换超时，请刷新后重试",menu:"目录",no_menu_info:"没有目录信息",print:"打印",rotate:"旋转",origin:"原图",fullscreen:"全屏",back:"还原",no_support_preview:"该文件不支持预览！",zoom_in:"放大",zoom_out:"缩小",prev:"上一页",next:"下一页",fit_width:"合适宽度",fit_height:"合适高度",no_install_flash:'浏览器没有安装Flash插件，请 <a href="{flash_url}" target="_blank">安装</a> 后再刷新页面查看',items:"项",download:"下载",preview:"预览",attachment:"附件",play_fail:"播放失败，文件正在加载，请稍候",last_view_page:"上次查看到第 {page} 页",continue_view:"继续查看"},en:{loading:"Loading",converting:"Converting",timeout:"Conversion timeout",menu:"Menu",no_menu_info:"No menu info",print:"Print",rotate:"Rotate",origin:"Origin",fullscreen:"Fullscreen",back:"Back",no_support_preview:"This file does not support preview!",zoom_in:"Zoom in",zoom_out:"Zoom out",prev:"Prev",next:"Next",fit_width:"Fit width",fit_height:"Fit height",no_install_flash:'The browser does not install the Flash plugin, please <a href="{flash_url}" target="_blank">install</a> and then refresh the page view.',items:" items",download:"Download",preview:"Preview",attachment:"Attachment",play_fail:"Failed to play, the file is loading, please wait",last_view_page:"You last read at page {page}",continue_view:"continue view"}},isMobile:/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(navigator.userAgent),flashVersion:swfobject.getFlashPlayerVersion()["major"]};function tipsFunc(serverURL,type,info,lang){if(info==undefined){var lang=EDOViewer.langs[lang];if(type=="loading"){return lang[type]+' <img src="'+serverURL+'/static/waiting.gif">'}else if(type=="converting"){return lang[type]+' <img src="'+serverURL+'/static/waiting.gif">'}else{return lang["timeout"]}}else{var re=/^function\s?(.*)/;if(info instanceof Function){return info()}else if(re.test(info)){var func=info.match(re)[1];if(func){return eval("info="+info+";info();")}else{return info}}else{return info}}}function statusFunc(xmlHttp,kwargs){if(xmlHttp.status==408){return"IP不匹配，此文件只允许 "+kwargs.ip+" 机器访问，但本次访问的IP是："+xmlHttp.getResponseHeader("signerror")}else{var statusText={400:"签名不正确",401:"超时",403:"路径无权限",404:"无此文件",405:"正在转换",406:"转换失败",407:"正在下载",409:"账户不存在"};return statusText[xmlHttp.status]||"Error: status code is "+xmlHttp.status}}String.prototype.encodeJs=function(){return encodeURIComponent(this)};Object.serializeStr=function(obj){if(obj==null)return null;if(obj.serializeStr)return obj.serializeStr();var cst=obj.constructor;switch(cst){case String:return'"'+obj.encodeJs()+'"';case Date:return"new Date("+obj.getTime()+")";case Array:var ar=[];for(var i=0;i<obj.length;i++)ar[i]=Object.serializeStr(obj[i]);return"["+ar.join(",")+"]";case Object:var ar=[];for(var i in obj){ar.push('"'+(i+"").encodeJs()+'":'+Object.serializeStr(obj[i]))}return"{"+ar.join(",")+"}";case Function:return'"'+obj.toString().encodeJs()+'"';default:return obj}};function embedFrame(type,identify,kwargs,url){var newKwargs={};var re=/^server_url|account|instance|location|username|preview_signcode|pdf_signcode|download_signcode|ip|app_id|timestamp|height|width|allow_copy|allow_print|mode|flash_first|paged_excel|image_url|waterprint_text|waterprint_size|waterprint_color|waterprint_font|waterprint_alpha|waterprint_rotation|lang|device|filename|params|source_mime$/;for(var key in kwargs){if(re.test(key)){if(key=="width"){newKwargs[key]="99%"}else{newKwargs[key]=kwargs[key]}}}newKwargs["embedded"]=true;var src=kwargs.server_url+"/edo_viewer?kwargs="+Object.serializeStr(newKwargs);var width=getParentValue("100%");var height=getParentValue(kwargs.height);var name=identify+"-frame";var allowPrint=eval(kwargs.allow_print)==false?false:true;var lang=EDOViewer.langs[kwargs.lang];var obj=$("#"+identify);var $iframe=$('<iframe frameBorder="0"></iframe>').attr("src",src).attr("id",name).attr("name",name).css({width:width[0],height:height[0],"background-color":"#FFF"});if(type=="html"){var $actions=$('<div class="preview-actions"></div>').css({background:"#FFF","text-align":"right","font-size":"16px",padding:"2px 0",width:"100%"});if(allowPrint&&!EDOViewer.isMobile){$actions.append($('<a href="javascript:;" style="margin-right: 10px"><i class="fa fa-print"></i></a>').attr("title",lang["print"]).on("click",function(){Viewer(identify).print(name)}))}var $fullscreen=$('<a href="javascript:;" style="margin-right: 10px"><i class="fa fa-expand"></i></a>').attr("title",lang["fullscreen"]).on("click",function(){if(!obj.data("isFullScreen")){$("body").css("overflow","hidden");obj.css({position:"fixed",height:$(window).height(),width:$(window).width(),top:0,left:0,"z-index":3e3}).addClass("crocodoc-viewer").data("isFullScreen",true);$iframe.css("height",$(window).height());$fullscreen.find("i").removeClass("fa-expand").addClass("fa-compress");$fullscreen.attr("title",lang["back"])}else{$("body").css("overflow","visible");obj.css({position:"static",height:kwargs.height,width:"100%",top:"auto",left:"auto","z-index":"auto"}).removeClass("crocodoc-viewer").data("isFullScreen",false);obj.find("iframe").css("height",height[0]);$fullscreen.find("i").addClass("fa-expand").removeClass("fa-compress");$fullscreen.attr("title",lang["fullscreen"])}});$actions.append($fullscreen);$(document).keyup(function(e){if(e.keyCode===27){if(obj.data("isFullScreen")){$fullscreen.trigger("click");e.stopPropagation()}}});obj.html($actions)}else{obj.html("")}if(EDOViewer.isMobile){obj.append($('<div style="overflow: scroll;-webkit-overflow-scrolling: touch"></div>').css({width:width[1],height:height[1]}).append($iframe))}else{obj.append($iframe)}if(/eml$/.test(kwargs.ext)){obj.append($("<div></div>").attr("id",identify+"-attachment"));kwargs["attachment"]=true;render_compress_viewer(getURL("compress",kwargs),identify+"-attachment",kwargs)}}function xmlHttpRequest(n,url,type,identify,kwargs,method,onlyRequest){if(n>EDOViewer.retryCount-1){if(!onlyRequest){document.getElementById(identify).innerHTML=tipsFunc(kwargs.server_url,"timeout",kwargs.timeout_info,kwargs.lang)}return}var xhr=null;if(window.XMLHttpRequest){xhr=new XMLHttpRequest}else{if(window.ActiveXObject){xhr=new ActiveXObject("MSXML2.XMLHTTP.3.0")}}if(!xhr){document.getElementById(identify).innerHTML="Error initializing XMLHttpRequest!";return}xhr.open(method,url,true);xhr.setRequestHeader("Cache-Control","no-cache");xhr.send(null);xhr.onreadystatechange=function(){callbackFunc(xhr,n,url,type,identify,kwargs,method,onlyRequest)}}function ajaxRequest(n,url,type,identify,kwargs,method,onlyRequest){if(n==0&&!onlyRequest){document.getElementById(identify).innerHTML=tipsFunc(kwargs.server_url,"loading",kwargs.loading_info,kwargs.lang)}var origin=window.location.protocol+"//"+window.location.host;if(navigator.appName=="Microsoft Internet Explorer"&&origin.indexOf(kwargs.server_url)==-1&&type!="html"){var version=navigator.appVersion.split(";")[1].replace(/ +MSIE +/,"");if(version>8||version==8){if(n>EDOViewer.retryCount-1){if(!onlyRequest){document.getElementById(identify).innerHTML=tipsFunc(kwargs.server_url,"timeout",kwargs.timeout_info,kwargs.lang)}return}var xdr=new XDomainRequest;xdr.open("GET",url);xdr.onload=function(){if(method=="GET"){responseSuccess(xdr,url,type,identify,kwargs)}};xdr.onerror=function(){window.setTimeout(function(){ajaxRequest(n+1,url,type,identify,kwargs,method,onlyRequest)},EDOViewer.intervalSecond*1e3);if(!onlyRequest){document.getElementById(identify).innerHTML=tipsFunc(kwargs.server_url,"converting",kwargs.converting_info,kwargs.lang)}};function progres(){if(method=="HEAD"){responseSuccess(xdr,url,type,identify,kwargs)}}xdr.onprogress=progres;try{xdr.send(null)}catch(ex){}}else{embedFrame(type,identify,kwargs,url)}}else{if(type=="html"&&!kwargs.embedded){embedFrame(type,identify,kwargs,url)}else{xmlHttpRequest(n,url,type,identify,kwargs,method,onlyRequest)}}}function callbackFunc(xmlHttp,n,url,type,identify,kwargs,method,onlyRequest){if(xmlHttp.readyState==4){try{if(document.getElementById(identify)===null){return}}catch(e){return}var status=xmlHttp.status;if(status==200){responseSuccess(xmlHttp,url,type,identify,kwargs)}else if(status==404||status==0){var delay=status==0?50:EDOViewer.intervalSecond*1e3;if(status==0&&EDOViewer.isMobile&&method=="HEAD"){method="GET"}window.setTimeout(function(){ajaxRequest(n+1,url,type,identify,kwargs,method,onlyRequest)},delay);if(!onlyRequest){document.getElementById(identify).innerHTML=tipsFunc(kwargs.server_url,"converting",kwargs.converting_info,kwargs.lang)}}else{if(!onlyRequest){document.getElementById(identify).innerHTML=statusFunc(xmlHttp,kwargs)}}}}function responseSuccess(xmlHttp,url,type,identify,kwargs){kwargs["callback"]=true;if(type=="html"){render_html_viewer(url,identify,kwargs)}else if(type=="compress"){try{kwargs["data"]=eval("("+xmlHttp.responseText+")")}catch(ex){kwargs["data"]=new Object}render_compress_viewer(url,identify,kwargs)}else if(type=="audio"){render_audio_viewer(url,identify,kwargs)}else if(type=="video"){render_video_viewer(url,identify,kwargs)}else if(type=="image"){render_image_viewer(url,identify,kwargs)}else if(type=="image-exif"){try{kwargs["data"]=eval("("+xmlHttp.responseText+")")}catch(ex){kwargs["data"]=new Object}render_exif_viewer(url,identify,kwargs)}else if(type=="box"){render_box_viewer(url,identify,kwargs)}}function removeLastSlash(url){if(url.charAt(url.length-1)=="/"){var url=url.substring(0,url.length-1)}return url}function getExt(url){var ext=/[.]/.exec(url)?/.[^.]+$/.exec(url)[0].replace(/\?.*/,"").toLowerCase():"";if(ext.indexOf("/")==-1){return ext}else{return""}}function getType(ext,pagedExcel){if(/^(.xls|.xlsx|.xlsm|.ods)$/.test(ext)&&pagedExcel!=false){return"flash"}for(var type in EDOViewer.previewPatterns){if(EDOViewer.previewPatterns[type].test(ext)){return type}}}function getURL(type,kwargs){var patterns={flash:"application/x-shockwave-flash-x",html:"text/html",compress:"application/json",audio:"audio/x-mpeg",image:"image/x-thumbnail-png","image-exif":"application/json"};if(kwargs.mode=="flv"){patterns["video"]="video/x-flv";var reExt=/(mp3|swf|mid|ogg|flv)$/i}else{patterns["video"]="video/mp4";var reExt=/(mp3|swf|mid|ogg|mp4)$/i}var pattern=patterns[type];if(pattern==undefined){return}else{var location=kwargs.location||"",filename=kwargs.filename||"",ip=kwargs.ip||"",timestamp=kwargs.timestamp||"",device=kwargs.device||"",app_id=kwargs.app_id||"",account=kwargs.account||"",source_mime=kwargs.source_mime||"",instance=kwargs.instance||"",username=kwargs.username||"",params=kwargs.params||"",signcode=reExt.test(kwargs.ext)&&!kwargs.source_mime?kwargs.download_signcode:kwargs.preview_signcode||"";var url=kwargs.server_url+"/download?";url+="location="+encodeURIComponent(location);var paramsObject={filename:filename,ip:ip,timestamp:timestamp,device:device,app_id:app_id,account:account,source_mime:source_mime,instance:instance,username:username,signcode:signcode};for(var key in paramsObject){if(!paramsObject[key]){continue}url+="&"+key+"="+encodeURIComponent(paramsObject[key])}if(!reExt.test(kwargs.ext)||kwargs.source_mime){url+="&mime="+pattern}if(type=="image"){url+="&subfile=image_"+(kwargs.image_size||"preview")}if(!$.isEmptyObject(params)){url+="&params="+Object.serializeStr(params)}return url}}function getParentValue(value){var pxValue="800px";if(value==undefined){value=pxValue}else if(/px$/i.test(value)){pxValue=value=parseInt(value.replace(/px/i,""))+"px"}else if(/em$/i.test(value)){var reValue=parseInt(value.replace(/em/i,""));pxValue=reValue+"px";value=reValue+"em"}else if(/\d$/.test(value)){pxValue=parseInt(value)+"px";value=parseInt(value)}else if(/%$/.test(value)){pxValue="100%";value="100%"}return[value,pxValue]}var EdoViewer={createViewer:function(identify,kwargs){if(typeof $==="undefined"){throw new Error("jQuery is required")}function renderViewer(){var serverURL=removeLastSlash(kwargs.server_url),location=kwargs.location,filename=kwargs.filename,scripts=new Array;if(!serverURL){return false}kwargs["layout"]=layout;var ext=getExt(filename)||getExt(location),mode=kwargs.mode,flashFirst=eval(kwargs.flash_first)==false||/^.tif|.tiff$/i.test(ext)?false:true,pagedExcel=eval(kwargs.paged_excel)==false?false:true,type=/^(flash|html|compress|audio|video|image)$/.test(mode)?mode:getType(ext,pagedExcel);kwargs.server_url=serverURL;if(type){kwargs["ext"]=ext;var url=getURL(type,kwargs)}if(!/^(zh|en)$/.test(kwargs.lang)){kwargs["lang"]="zh"}if(typeof $.fullscreen==="undefined"){scripts.push("jquery.fullscreen.js")}if(typeof kwargs.location==="undefined"){scripts.push("md5.js")}var deferreds=$.map(scripts,function(current){var ajaxOptions={url:serverURL+"/static/"+current,dataType:"script",cache:true};return $.ajax(ajaxOptions)});$.when.apply($,deferreds);if(type=="flash"){if(flashFirst==true&&EDOViewer.flashVersion>=9&&!EDOViewer.isMobile&&mode!="h5"||mode=="flash"){$("head").append('<link media="all" href="'+serverURL+'/static/flash.viewer.css?v=1" rel="stylesheet" type="text/css">');render_flash_viewer(encodeURIComponent(url),identify,kwargs)}else if(EDOViewer.isMobile||typeof document.addEventListener!="undefined"||mode=="h5"){if(typeof window.Crocodoc==="undefined"){$("head").append('<link media="all" href="'+serverURL+'/static/box/dist/my.crocodoc.viewer.css?v=4" rel="stylesheet" type="text/css">');$.getScript(serverURL+"/static/box/dist/my.crocodoc.viewer.min.js?v=4",function(){if(!$().mark){$.getScript(serverURL+"/static/jquery.mark.min.js")}if(!$().slimbox){$.getScript(serverURL+"/static/slimbox2.js")}render_box_viewer(url,identify,kwargs)})}else{render_box_viewer(url,identify,kwargs)}}else{render_flash_viewer(encodeURIComponent(url),identify,kwargs)}}else if(type=="html"){render_html_viewer(url,identify,kwargs)}else if(type=="compress"){render_compress_viewer(url,identify,kwargs)}else if(type=="audio"){if(typeof window.jwplayer==="undefined"){$.getScript(serverURL+"/static/jwplayer/jwplayer.js",function(){render_audio_viewer(url,identify,kwargs)})}else{render_audio_viewer(url,identify,kwargs)}}else if(type=="video"){if(typeof window.jwplayer==="undefined"){$.getScript(serverURL+"/static/jwplayer/jwplayer.js",function(){render_video_viewer(url,identify,kwargs)})}else{render_video_viewer(url,identify,kwargs)}}else if(type=="image"){if(typeof $.slimbox==="undefined"){$("head").append('<link media="all" href="'+serverURL+'/static/slimbox2.css" rel="stylesheet" type="text/css">');$.getScript(serverURL+"/static/slimbox2.js",function(){render_image_viewer(url,identify,kwargs)})}else{render_image_viewer(url,identify,kwargs)}}else{$("#"+identify).trigger("file-no-support");document.getElementById(identify).innerHTML=EDOViewer.langs[kwargs.lang]["no_support_preview"]}}var layout="vertical";var viewer={set_layout:function(value){layout=value},load:function(){return renderViewer()},load_from_wo:function(url,access_token){$.getJSON(url+"/@@get_viewer_args?access_token="+(access_token||""),function(data){kwargs=$.extend(data,kwargs);return viewer.load()})},on:function(type,func){return Viewer(identify).on(type,func)}};return viewer},load:function(){return viewer.load()}};