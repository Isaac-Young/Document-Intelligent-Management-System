function moveItems(from, to)
  {
  // shortcuts for selection fields
  var src = document.getElementById(from);
  var tgt = document.getElementById(to);

  if (src.selectedIndex == -1) selectionError();
  else
    {
    // iterate over all selected items
    // --> attribute "selectedIndex" doesn't support multiple selection.
    // Anyway, it works here, as a moved item isn't selected anymore,
    // thus "selectedIndex" indicating the "next" selected item :)
    while (src.selectedIndex > -1)
      if (src.options[src.selectedIndex].selected)
        {
        // create a new virtal object with values of item to copy
        temp = new Option(src.options[src.selectedIndex].text,
                      src.options[src.selectedIndex].value);
        // append virtual object to targe
        tgt.options[tgt.length] = temp;
        // want to select newly created item
        temp.selected = true;
        // delete moved item in source
        src.options[src.selectedIndex] = null;
      }
    }
  }

// move item from "from" selection to "to" selection
function from2to(name)
  {
  moveItems(name+"-from", name+"-to");
  copyDataForSubmit(name);
  }

// move item from "to" selection back to "from" selection
function to2from(name)
  {
  moveItems(name+"-to", name+"-from");
  copyDataForSubmit(name);
  }

function swapFields(a, b)
  {
  // swap text
  var temp = a.text;
  a.text = b.text;
  b.text = temp;
  // swap value
  temp = a.value;
  a.value = b.value;
  b.value = temp;
  // swap selection
  temp = a.selected;
  a.selected = b.selected;
  b.selected = temp;
  }

// move selected item in "to" selection one up
function moveUp(name)
  {
  // shortcuts for selection field
  var toSel = document.getElementById(name+"-to");

  if (toSel.selectedIndex == -1)
      selectionError();
  else if (toSel.options[0].selected)
      alert("Cannot move further up!");
  else for (var i = 0; i < toSel.length; i++)
    if (toSel.options[i].selected)
      {
      swapFields(toSel.options[i-1], toSel.options[i]);
      copyDataForSubmit(name);
      }
  }

// move selected item in "to" selection one down
function moveDown(name)
  {
    // shortcuts for selection field
    var toSel = document.getElementById(name+"-to");

    if (toSel.selectedIndex == -1) {
        selectionError();
    } else if (toSel.options[toSel.length-1].selected) {
        alert("Cannot move further down!");
    } else {
      for (var i = toSel.length-1; i >= 0; i--) {
        if (toSel.options[i].selected) {
          swapFields(toSel.options[i+1], toSel.options[i]);
        }
      }
      copyDataForSubmit(name);
    }
  }

// copy each item of "toSel" into one hidden input field
function copyDataForSubmit(name)
  {
  // shortcuts for selection field and hidden data field
  var toSel = $("#" + name + "-to");
  var toDataContainer = $("#" + name + "-toDataContainer");
  toDataContainer.empty();

  // create new hidden input fields - one for each selection item of
  // "to" selection
  for (var i = 0; i < toSel[0].options.length; i++)
    {
    // create virtual node with suitable attributes

    var newNode = document.createElement('input');
    newNode = $(newNode);
    newNode.attr('name', name.replace(/-/g, '.')+':list');

    newNode.attr('type', 'hidden');
    newNode.attr('value', toSel[0].options[i].value);
    
    // actually append virtual node to DOM tree
    toDataContainer.append(newNode);
    }
  }

// error message for missing selection
function selectionError()
  {alert("Must select something!")}



function disableEnterKey(t,e){var key,$ths=$(t);if(window.event)key=window.event.keyCode;else key=e.which;if(key==13){$ths.kss({url:$ths.data("kss"),params:$.extend($ths.data(),{text:t.value,curdir:$ths.closest(".content-select").next().val()}),mask:true});if(window.event)event.cancelBubble=true;else e.stopPropagation();return false}}function toggleChild(e,t){if(window.event){event.returnValue=false;try{e.preventDefault()}catch(er){}if(!$(t).hasClass("loadTree")){event.cancelBubble=true;try{e.stopPropagation()}catch(er){}}}else{e.preventDefault();if(!$(t).hasClass("loadTree")){e.stopPropagation()}}var parentNode=$(t).closest("li");parentNode.find("i.collapsed-icon:first, i.expanded-icon:first").toggleClass("hidden");parentNode.find("ul:first").toggleClass("hidden")}function uploadMode(ths){if(window.FileReader){$(ths).data("param1","h5Upload")}else if(swfobject.getFlashPlayerVersion()["major"]>9&&!EDO.isMobile){$(ths).data("param1","flashUploadFile")}else{$(ths).data("param1","uploadFile")}}function getSelectedVersions(selected){var boxes=new Array;var elements=document.getElementById("compare_form").elements;boxes.selectedIndex=-1;for(var i=0;i<elements.length;i++){if(elements[i].name!="submit"&&elements[i].checked){if(elements[i]==selected){boxes.selectedIndex=boxes.length}boxes.push(elements[i])}}return boxes}function checkVersion(checkbox){if(!checkbox.checked){document.getElementById("compare_button").disabled=true;return}var selections=getSelectedVersions(checkbox);if(selections.length>2){for(var i=0;i<selections.length;i++){if(selections[i]!=checkbox){selections[i].checked=false}}document.getElementById("compare_button").disabled=true}var boxes=getSelectedVersions(checkbox);if(boxes.length==2){document.getElementById("compare_button").disabled=false}}function delete_confirm(node,message,delBaseUrl,delSelector,other){if(!message){var message=EDO.lang=="en"?"Are you sure delete?":"您确定要删除吗？"}if(confirm(message)==false){return false}if(!delSelector){delSelector=".kssDeletionRegion"}if(!delBaseUrl){delBaseUrl=""}node.src="/++resource++img/waiting.gif";$(node).kss({url:delBaseUrl+"/@@kss_obj_delete",params:{selector:delSelector,other:other}});return false}function deleteVersion(node,delUrl,version_id){var message=EDO.lang=="en"?"Are you sure delete?":"您确定要删除吗？";if(confirm(message)==false){return false}node.src="/++resource++img/waiting.gif";kssServerAction(node,delUrl,{param1:version_id});return false}function revertVersion(node,revert_url,version_id){if(EDO.lang=="en"){var message="Are you sure roll back? Rollback is unrecoverable."}else{var message="您确定要将最新版本的内容回滚到这个版本吗？注意：回滚操作是不可恢复的。"}if(confirm(message)==false){return false}node.src="/++resource++img/waiting.gif";kssServerAction(node,revert_url,{param1:version_id});return false}function splitUrl(url){var spliter=url.split("?");var data={};data["url"]=spliter[0];data["param"]={};if(spliter[1]){var param=spliter[1].split("&");for(var i=0;i<param.length;i++){var tmp_data=param[i].split("=");data["param"][tmp_data[0]]=tmp_data[1]}}return data}function dateTimePickerInit(){$(".PopCalendar").each(function(index){var $ths=$(this);$ths.attr("autocomplete","off");if($ths.data("xdsoft_datetimepicker")){return}var $value=$ths.val();var $minutestep=parseInt($ths.attr("kssattr:minutestep"))||60;var $showtime=$ths.attr("kssattr:showtime");if($showtime=="true"){var format="Y-m-d H:i";var timepicker=true}else{var format="Y-m-d";var timepicker=false}$ths.datetimepicker({lang:EDO.lang=="en"?"en":"ch",format:format,timepicker:timepicker,step:$minutestep,value:$value,closeOnDateSelect:true,allowBlank:true})})}function exitDialog(){$(".PopMemberSelectTable").remove();$(".SelectedMembers").find(".PopSelector").removeClass("hidden");$(".popupDialog").remove()}function keyUp(e){if(e.keyCode==27){exitDialog();cancelLoad();$(".escape-key-close").remove();$(".PopCalendar").datetimepicker("hide")}}function ajaxLoad(){if($(".full-popup-container").length){var thisOb=$(".full-popup-container:last")}else{var thisOb=$("#columns").length?$("#columns"):$("#content")}var a=$(thisOb).height();var b=$(thisOb).width();var position=$(thisOb).position();var scrollTop=$(document).scrollTop();var winHeight=$(window).height();if(thisOb.length==0){return}function centerToBox(cur,box){var position=$(box).position();var posTopOffset=$(box).height()/2;var posLeftOffset=$(box).width()/2;position.left=position.left+posLeftOffset;position.top=position.top+posTopOffset;$(cur).css({position:"absolute",left:position.left-40,top:scrollTop+winHeight/2-40,"z-index":1e6});return this}var src=$('link[rel="cache-url"]').attr("href")+"img/spinner-overlay.gif";$("body").append('<div id="dvGlobalMask"></div><div id="loader"><img src="'+src+'"></div>');$("#dvGlobalMask").css({width:b,height:a,position:"absolute",left:position.left,top:position.top,display:"inline-block","z-index":999999}).fadeTo("fast",.7);centerToBox($("#loader"),$(thisOb));$("#loader, #dvGlobalMask").show().delay(1e3)}function cancelLoad(){$("#loader, #dvGlobalMask").remove();$("#kss-spinner").addClass("hidden")}var clipboardImages=new Array;function pasteHandler(e){if(e.clipboardData){clipboardImages=[];var items=e.clipboardData.items;if(items){for(var i=0;i<items.length;i++){if(items[i].type.indexOf("image")!==-1){var blob=items[i].getAsFile();var URLObj=window.URL||window.webkitURL;var source=URLObj.createObjectURL(blob);clipboardImages.push(source)}}}}}function updata(type){if(type=="title"){var title=$("input[name=title]").attr("value");$(this).kss({url:"./@@updata_title",params:{title:title}})}if(type=="email"){var email=$("input[name=email]").attr("value");$(this).kss({url:"./@@updata_email",params:{email:email}})}if(type=="phone"){var phone=$("input[name=phone]").attr("value");$(this).kss({url:"./@@updata_phone",params:{phone:phone}})}if(type=="mobile"){var mobile=$("input[name=mobile]").attr("value");$(this).kss({url:"./@@updata_mobile",params:{mobile:mobile}})}}function cancel(type){if(type=="title"){$(this).kss({url:"./@@updata_title"})}if(type=="email"){$(this).kss({url:"./@@updata_email"})}if(type=="phone"){$(this).kss({url:"./@@updata_phone"})}if(type=="mobile"){$(this).kss({url:"./@@updata_mobile"})}}function cacheURL(path){var basePath=$('link[rel="cache-url"]').attr("href");return basePath+path}function fullScreen(id){var el=document.getElementById(id);var requestMethod=el.requestFullScreen||el.webkitRequestFullScreen||el.mozRequestFullScreen||el.msRequestFullScreen;if(requestMethod){requestMethod.call(el)}else{window.open(el.src,"","fullscreen=1,scrollbars=1")}return false}function closeModal(all){if(all===true){$(".popup-container .close").trigger("click");if($(".popup-container").length){$(".b-modal, .popup-container").remove()}}else{if($(".popup-container:last .close").length){$(".popup-container:last .close").trigger("click")}else{$(".b-modal:last, .popup-container:last").remove()}}$(".live-search").hide()}function closeActions(){$(window).data("hasActions",null);$("#batchActions").remove()}function showMenu(ths,id,pos){var messageMenuContent=$("#notify-center .KSSActionMenuContent");if(!$(id).hasClass("hidden")){$(".KSSActionMenuContent").not(messageMenuContent).addClass("hidden");return}else{var menu=$(ths).closest(".actionMenu").find(id);$(".KSSActionMenuContent").not(messageMenuContent).addClass("hidden");menu.removeClass("hidden");var model=$(ths).closest(".popup-container");if(model.length>0){var thsPos=$(ths).offset();var scrollBox=$(ths).closest(".selectBox");if(scrollBox.length>0){var menuDim={top:$(ths).position().top,left:thsPos.left-model.offset().left};scrollBox.scroll(function(){menu.addClass("hidden")})}else{var menuDim={top:"auto",left:thsPos.left-model.offset().left}}}else{var thsPos=$(ths).position();var menuDim={top:thsPos.top+$(ths).outerHeight(),left:thsPos.left}}if(pos=="up"){menuDim.top=thsPos.top-menu.outerHeight()}if(pos=="right"||pos=="right-up"){menuDim.left=menuDim.left-menu.outerWidth()+$(ths).outerWidth()}if(pos=="right-up"){menuDim.top=$(ths).position().top-menu.outerHeight()}menu.css({position:"absolute",left:menuDim.left,top:menuDim.top,textAlign:"left"});menu.css("left",$(window).width()<menu.offset().left+menu.outerWidth()?$(window).width()-menu.outerWidth()-10:menu.css("left"));if(menu.find(">li.submenu").length){menu.find(".submenu-items").hide();$.each(menu.find(">li"),function(){$(this).off("hover").on("hover",function(event){if((event.type=="mouseover"||event.type=="mouseenter")&&$(this).hasClass("submenu")){$(".submenu-items").hide();var submenu=$(this).find(".submenu-items");submenu.css({position:"absolute",left:menu.outerWidth(),top:$(this).position().top,textAlign:"left"}).show();submenu.css("left",$(window).width()<submenu.offset().left+submenu.outerWidth()?0-menu.outerWidth():submenu.css("left"))}else{if(!$(this).hasClass("submenu")){menu.find(".submenu-items").hide()}}})})}}}function changeStart(ths){var val=$(ths).val();if(!/^([1-9][0-9]*)$/.test(val)){$(ths).val("");$(ths).focus();return}var total=$(ths).data("total");if(val>total){val=total;$(ths).val(total)}var pages=new Array;var number=0;var size=$(ths).data("size");for(var x=0;x<total;x++){pages.push(number);number+=size}var link=$(ths).parent().find("a");var classes=link.attr("class");var href=link.attr("href");var start=pages[val-1];href=href.replace(/(b_start:int)=(\d+)/,"$1="+start);classes=classes.replace(/(kssattr-batch)-(\d+)/,"$1-"+start);link.attr("data-b_start",start).attr("class",classes).attr("href",href)}function enterComment(ths,evt){var $form=$(ths.form);if(evt.ctrlKey&&evt.which==13||evt.which==10){$form.submit()}else if(evt.shiftKey&&evt.which==13||evt.which==10){$form.submit()}else if(evt.metaKey&&evt.which==13||evt.which==10){$form.submit()}}function timestampToShowDateString(timestamp,showDate,showTime){var showDate=typeof arguments[1]!=="undefined"?arguments[1]:false;var showTime=typeof arguments[2]!=="undefined"?arguments[2]:false;var date=new Date(timestamp*1e3);var pad=function(s){return s<10?"0"+s:""+s};date_string=[date.getFullYear(),pad(date.getMonth()+1)].join("-");if(showDate){date_string=[date_string,pad(date.getDate())].join("-")}if(showTime){date_string=date_string+" "+[pad(date.getHours()),pad(date.getMinutes()),pad(date.getSeconds())].join(":")}return date_string}function sound(typ){typ=typ||"info";var media=document.getElementById("sound");if(!media){media=document.createElement("audio");media.id="sound";document.body.appendChild(media)}media.src=cacheURL("/sound/"+typ+".mp3");media.addEventListener("canplay",function(){media.play()},false)}function cors_ajax(options){var data=options.data||{},onsuccess=options.success||function(){},onerror=options.error||function(){},oncomplete=options.complete||function(){},cache=options.cache||false,traditional=options.traditional||false,dataType=options.dataType||"json",forceFlash=options.force_flash||false,getLocation=function(uri){var a=document.createElement("a");a.href=uri;if(a.host===""){a.href=a.href}return a},flash_cors=function(){load(["flXHR/flXHR.js"],function(){var location=getLocation(options.url),policy_uri=location.protocol+"//"+location.host+"/crossdomain.xml";if(typeof flxhr_proxy==="undefined"){flxhr_proxy=new flensed.flXHR({xmlResponseText:dataType==="xml",loadPolicyURL:policy_uri,noCacheHeader:!cache,onerror:onerror,ontimeout:onerror})}else{try{flxhr_proxy.Configure({xmlResponseText:dataType==="xml",loadPolicyURL:policy_uri,onerror:onerror,ontimeout:onerror})}catch(e){}}try{flxhr_proxy.open(options.method,options.url);flxhr_proxy.onreadystatechange=function(proxy){if(proxy.readyState===4){try{if(dataType==="json"){var result=JSON.parse(proxy.responseText)}else{var result=proxy.responseXML}return onsuccess(result)}catch(e){return onerror(e)}}};if(!cache){data._nocache=Math.random()}flxhr_proxy.send($.param(data,traditional))}catch(e){return onerror(e)}})};if(forceFlash){return flash_cors()}try{$.ajax({cache:cache,crossDomain:true,data:data,dataType:dataType,method:options.method,type:options.method,success:onsuccess,error:flash_cors,complete:oncomplete,traditional:traditional,url:options.url})}catch(e){onerror(e)}}function notify(text,options){var chk=Notification.permission,_notify=function(text,options){var n=new Notification(text,options);setTimeout(function(){n.close()},6e3)};if(chk==="granted"){_notify(text,options)}else if(chk==="unknown"){return false}else{Notification.requestPermission(function(permission){if(permission==="granted"){_notify(text,options)}})}}function close_float(which){var which_node;if(!!which){which_node=$(which).closest("[name=jquery-notify]")}else{which_node=$("[name=jquery-notify]").eq(0)}if(!$.notify||!$.notify.defaults){$.notify={defaults:{opacity:1,fadeOutDuration:500,fadeInDuration:200,Timeout:5e3}}}which_node.animate({opacity:0},$.notify.defaults.fadeOutDuration,function(){which_node.hide();which_node.remove()})}function message_float(message,title,no_auto_close){var top=45,margin_space=15,message_count=$("[name=jquery-notify]").length,auto_close=typeof no_auto_close==="undefined"?true:!no_auto_close;if(message_count!=0){var last_top=$("[name=jquery-notify]").eq(-1).css("top");var last_height=$("[name=jquery-notify]").eq(-1).height();last_top=parseInt(last_top.slice(0,-2))+last_height;top=last_top+margin_space}$.notify={defaults:{opacity:1,fadeOutDuration:500,fadeInDuration:200,Timeout:5e3}};load(["float_message.hb"],function(){var template=EDO.templates["float_message.hb"];var helper=$(template({body:message,title:title,top:top})).appendTo(document.body);helper.show().animate({opacity:$.notify.defaults.opacity},$.notify.defaults.fadeInDuration);if(auto_close){setTimeout(function(){helper.animate({opacity:0},$.notify.defaults.fadeOutDuration,function(){$(this).hide();$(this).remove()})},$.notify.defaults.Timeout)}})}(function($){$(document).on("command",function(event,data){new Function(data.script)()});$.event.special.destroyed={remove:function(o){if(o.handler){o.handler()}}};$.fn.ksson=function(evt,data,conditions){var $s=$(this),$d=$(document);if(!$s.is($d)&&!$s.length){throw new Error("Invalid element")}if(evt=="keydown"){$s.addClass("kss-keydown").data("keydown",data.kss).data("key",conditions.key);return}var events=$d.data("events")[evt];if(data&&events){for(var x=0;x<events.length;x++){if(events[x]===undefined){continue}if(events[x].data&&events[x].data.kss==data.kss){return}}}var conditions=conditions;function conditionalkss(event,data){var executable=false;var isEmptyObject=function(obj){for(k in obj){return false}return true};if(data&&!isEmptyObject(conditions)){$.each(data,function(key,value){if(conditions[key]){if(conditions[key]===value){executable=true}else if($.type(conditions[key])==="array"&&$.type(value)==="array"){for(var x=0;x<value.length;x++){if($.inArray(value[x],conditions[key])!=-1){executable=true}}}}})}else{executable=isEmptyObject(conditions)}if(executable){var kss=event.data.kss;if(event.data.delay){window.setTimeout(function(){$s.kss(kss,data,"POST")},event.data.delay)}else{$s.kss(kss,data,"POST")}}}$d.on(evt,data,conditionalkss);if(!$s.is($d)){$s.on("destroyed",function(event){if(event===undefined){$d.off(evt,conditionalkss)}else{event.stopPropagation()}})}}})(jQuery);function off(evt,kss){if(kss){var events=$(document).data("events")[evt].concat();if(events){for(var x=0;x<events.length;x++){if(events[x]===undefined){continue}if(events[x].data.kss==kss){$(document).data("events")[evt].splice(x,1)}}}}else{$(document).off(evt)}}function initTinyMCE(document_base_url){load("tinymce/tinymce.min.js",function(){tinyMCE.init({selector:"textarea.mini-mceEditor",language:EDO.lang=="zh"?"zh-cn":EDO.lang,menubar:false,plugins:"advlist autolink lists link textcolor code fullscreen contextmenu paste siteimage",toolbar:"formatselect bold forecolor link siteimage alignleft aligncenter bullist numlist code",init_instance_callback:function(editor){editor.on("change",function(e){editor.getElement().value=editor.getContent()})},convert_urls:false,valid_children:"+body[style]",valid_elements:"*[*]",forced_root_block:"",force_p_newlines:true,fullpage_default_encoding:"utf-8",document_base_url:document_base_url,paste_data_images:true})})}function showRight(t){var $t=$(t),$container=$t.closest(".simplemodal-wrap"),$left=$container.find("#preview-left"),$right=$container.find("#preview-right");$left.css({float:"left",width:"68%"});$right.removeClass("hidden");$t.addClass("hidden")}function toggleSidebar(t){var $t=$(t),$container=$t.closest(".simplemodal-wrap"),$sidebar=$container.find(".preview-sidebar");$t.find("i").toggleClass("hidden");$sidebar.toggleClass("hidden")}function onIdle(kss){if(parseInt(EDO.idle)>0){store.set("isIdle",false);if(EDO.idleInterval==undefined){EDO.idleInterval=new Object}EDO.idleInterval[kss]=setInterval(function(){if(!store.has("isIdle"))return;if(store.get("isIdle")){window.setTimeout(function(){if(!store.get("jwplay")){$().kss(kss)}},EDO.idleTimeout*1e3)}else{if(!store.get("isIdle")){store.set("isIdle",true)}}},EDO.idle*1e3);$("html").on("click",function(){if(store.get("isIdle")){store.set("isIdle",false)}});$(window).bind("mousewheel DOMMouseScroll",function(){if(store.get("isIdle")){store.set("isIdle",false)}});$(document).on("jwplay",function(){store.set("jwplay",true)});$(document).on("jwdestroy",function(){store.set("jwplay",false)})}else{store.remove("isIdle")}}function offIdle(kss){if(EDO.idleInterval==undefined)return;if(kss){window.clearInterval(EDO.idleInterval[kss])}else{store.remove("isIdle");$(EDO.idleInterval).each(function(kss){window.clearInterval(EDO.idleInterval[kss])})}}function switchNavtree(ths){var $ths=$(ths),$url=$ths.data("url")+"/@@switch_navtree",$treeBox=$(".popup-container:last .TreeBox"),$searchBox=$(".popup-container:last .SearchBox"),$navtree=$treeBox.find(".navtree:first"),$selectType=$navtree.find("li:last").attr("kssattr:select_type"),template=eval($navtree.attr("kssattr:templ")),$searchBtn=$searchBox.find(".SearchBtn"),$subTreeEl=$treeBox.find(".sub-navtree"),$closeEl=$searchBox.find(".fa-close");if($closeEl.length<1){$closeEl=$('<i class="fa fa-close hand hidden"></i>');$subTreeEl=$('<div class="sub-navtree navtree"></div>');$searchBox.append($closeEl.click(function(){$searchBtn.removeClass("hidden");$navtree.removeClass("hidden");$subTreeEl.empty();$closeEl.addClass("hidden")}));$treeBox.append($subTreeEl);$subTreeEl.attr("kssattr:templ",$navtree.attr("kssattr:templ"))}$.getJSON($url,{select_type:$selectType},function(data){$navtree.addClass("hidden");$searchBtn.addClass("hidden");$subTreeEl.html(render_navtree(data,template));$closeEl.removeClass("hidden");$ths.closest(".live-search").hide()})}function onKss(element,url){var el=$(element);if(el.hasClass("select2")){var values=[];$(el.select2("data")).each(function(){values.push(this.id)});var data={"value:list":values}}else{var data={value:el.val()}}el.kss(url,$.param(data,true),"POST")}function navSelect(ths){var $ths=$(ths);var formid=$ths.data("formid"),type=$ths.data("type"),name=$ths.data("name");if(formid){var form=$("#"+formid)}else{var form=$ths.closest("form")}$ths.closest(".filter_type").find('input[type="hidden"][name="'+name+'"]').val(type);form.submit()}function colResizable(){if(EDO.isMobile||EDO.isIE8||EDO.isIE7||EDO.isIE6){return}var $leftContent=$("#left .visualPadding");$leftContent.css("width",$("#left").width()-10);$("#main, #right").css("width","");var sonColResizable=function(){var $table=$("#content table.colResizable");var $th=$("#content table.colResizable th");$th.each(function(index){$th.eq(index).css("width",$(this).width())});$("#content table.colResizable").colResizable({resizeMode:"overflow",liveDrag:true,draggingClass:"dragging",removePadding:false,destroy:true,partialRefresh:true,disabledColumns:[0],onResize:function(e){var values=new Array;$(e.currentTarget).find("tr:first>th").each(function(index){values.push($(this).width())});$(e.currentTarget).kss("@@set_columns_width",{values:values});$(".scroll-auto").getNiceScroll().resize()}});$th.on("hover",function(){if(event.type=="mouseover"||event.type=="mouseenter"){$("#content .JCLRgrip").not(":last").not(":first").css({"border-right":"1px solid #e5e5e5",height:$th.outerHeight()+5})}else{$("#content .JCLRgrip").not(":last").not(":first").css({"border-right":0,height:$("#content table.colResizable").outerHeight()+5})}})};sonColResizable();$("table#columns").colResizable({liveDrag:true,minWidth:50,removePadding:false,partialRefresh:true,destroy:true,disabledColumns:[$("#left").is(":visible")?1:0],onResize:function(e){sonColResizable()},onDrag:function(e){$leftContent.css("width",$("#left").width()-10);$(".scroll-auto").getNiceScroll().resize()}});$("#main, #right").css("width","");if($leftContent.width()>$("#left").width()){$leftContent.css("width",$("#left").width()-10)}}$(function(){colResizable();window.onscroll=function(){var $scrollTop=$(document).scrollTop(),$lefeColum=$("#left .visualPadding");if($scrollTop>=52){$lefeColum.css({top:52,"margin-top":0})}else{$lefeColum.css({top:"","margin-top":-10})}};window.setTimeout(function(){$(document).keyup(keyUp);$("#search-box .fa-close").click(function(){$('#search-box input[name="text"]').val("");$("#search-box #magnifier").removeClass("hidden");$("#search-box .fa-close").addClass("hidden")});$('#search-box input[name="text"]').blur(function(){$("#search-box").css({opacity:"0.7"})}).focus(function(){$("#search-box").css({opacity:"1.0"});$(this).keyup()}).keyup(function(){if($(this).val()){$("#search-box #magnifier").addClass("hidden");$("#search-box .fa-close").removeClass("hidden")}else{$("#search-box #magnifier").removeClass("hidden");$("#search-box .fa-close").addClass("hidden")}}).liveSearch({id:"site-live-search",url:$('link[rel="root-url"]').attr("href")+"/@zopen.views:view_site_search?text=",addWidth:282,addLeftPos:22,addTopPos:15,loadingClass:"loading"});$("body").on("click",".PopCalendar",function(){dateTimePickerInit();$(this).focus()})},100)});function initSelect2(cls,tags){load(["select2/select2.min.js","select2/i18n/"+EDO.lang+".js"],function(){if(typeof cls==="object"){var $select2=cls}else{var $select2=$("select."+cls)}$select2.select2({tags:tags});var ul=$select2.next(".select2-container").first("ul.select2-selection__rendered");ul.sortable({containment:"parent",items:"li:not(.select2-search__field)",stop:function(){$($(ul).find(".select2-selection__choice").get().reverse()).each(function(){var id=$(this).data("data").id;var option=$select2.find('option[value="'+id+'"]')[0];$select2.prepend(option)})}})})}function checkLink(ths,e){e.preventDefault();var el=$(ths),url=el.attr("href");el.hide();var exist=function(){$.ajax({url:url,type:"HEAD",timeout:5e3,error:function(){if(!el.data("checked")){el.data("checked",true).after('<i class="fa fa-circle-o-notch fa-spin"></i>')}window.setTimeout(exist,2500)},success:function(){if(el.data("checked")){el.next(".fa").remove()}el.show();window.location.href=url}})};exist()}
jQuery.fn.liveSearch=function(conf){var config=jQuery.extend({url:"/search-results.php?q=",id:"jquery-live-search",duration:400,typeDelay:200,addWidth:0,addTopPos:0,addLeftPos:0,loadingClass:"loading",onSlideUp:function(){},wordLength:0,up:false,fixed:false,uptadePosition:false},conf);var liveSearch=jQuery("#"+config.id);if(!liveSearch.length){liveSearch=jQuery('<div id="'+config.id+'" class="live-search"></div>').appendTo(document.body).hide().slideUp(0);jQuery(document.body).click(function(event){var clicked=jQuery(event.target);if(!(clicked.is("#"+config.id)||clicked.parents("#"+config.id).length||clicked.is("input"))){liveSearch.slideUp(config.duration,function(){config.onSlideUp()})}})}return this.each(function(){var input=jQuery(this).attr("autocomplete","off");var liveSearchPaddingBorderHoriz=parseInt(liveSearch.css("paddingLeft"),10)+parseInt(liveSearch.css("paddingRight"),10)+parseInt(liveSearch.css("borderLeftWidth"),10)+parseInt(liveSearch.css("borderRightWidth"),10);var repositionLiveSearch=function(){var tmpOffset=input.offset();var inputDim={left:tmpOffset.left,top:tmpOffset.top,width:input.outerWidth(),height:input.outerHeight()};var lastPopup=$(".popup-container:last");inputDim.topPos=inputDim.top+inputDim.height;inputDim.totalWidth=inputDim.width-liveSearchPaddingBorderHoriz;liveSearch.css({position:"absolute",left:inputDim.left-config.addWidth+config.addLeftPos+"px",top:inputDim.topPos+config.addTopPos+"px",width:inputDim.totalWidth+config.addWidth+"px"});if(lastPopup.length>0){liveSearch.css("z-index",lastPopup.zIndex()+1)}};var showLiveSearch=function(){repositionLiveSearch();if(config.up){liveSearch.show().css("top",input.offset().top-liveSearch.outerHeight());if(config.fixed){liveSearch.css({position:"fixed",top:input.offset().top-liveSearch.outerHeight()-$(document).scrollTop()})}}else{liveSearch.slideDown(config.duration)}};var hideLiveSearch=function(){liveSearch.slideUp(config.duration,function(){config.onSlideUp()})};input.focus(function(){if(this.value.length>=config.wordLength){if(liveSearch.html()==""){this.lastValue="";input.keyup()}else{setTimeout(showLiveSearch,1)}}}).keyup(function(e){if(this.value.length<config.wordLength||e.keyCode==27){hideLiveSearch();return}input.addClass(config.loadingClass);if(this.timer){clearTimeout(this.timer)}var q=encodeURIComponent(this.value);this.timer=setTimeout(function(){jQuery.get(config.url+q,function(data){input.removeClass(config.loadingClass);if(data.length){liveSearch.html(data);showLiveSearch()}else{hideLiveSearch()}})},config.typeDelay);this.lastValue=this.value})})};
/*
 * jQuery message plug-in 1.0
 *
 */

(function($) {
    var helper,
        visible,
        totalTimeout,
        timeout1,
        timeout2;

    $.fn.message = function(message, msgtype, delay) {
        message = $.trim(message || this.text());
        if (!message) {
            return;
        }
        clearTimeout(timeout1);
        clearTimeout(timeout2);

        if (msgtype == 'state') {
            totalTimeout = delay || 1000;
        } else {
            totalTimeout = delay || $.message.defaults.totalTimeout;
        }

        initHelper();
        helper.find("p").html(message);
        helper.removeClass('info mserror warning').addClass(msgtype);
        helper.show().animate({ opacity: $.message.defaults.opacity}, $.message.defaults.fadeInDuration);
        visible = true;
        timeout1 = setTimeout(function() {
            visible = false;
        }, $.message.defaults.minDuration + $.message.defaults.displayDurationPerCharacter * Math.sqrt(message.length));
        timeout2 = setTimeout(fadeOutHelper, totalTimeout);
    };

    function initHelper() {
        if (!helper) {
            helper = $($.message.defaults.template).appendTo(document.body);
            //$(document).bind("mousemove click keypress", fadeOutHelper);
            helper.find("a.close").bind('click', function(event) {
              helper.animate({ opacity: 0 }, $.message.defaults.fadeOutDuration, function() { $(this).hide() })
              event.preventDefault();
            });
        }
        if (totalTimeout <= 1000) {
            helper.find("a.close").hide();
        } else {
            helper.find("a.close").show();
        }
    }

    function fadeOutHelper() {
        //if (helper.is(":visible") && !helper.is(":animated") && !visible) {
            helper.animate({ opacity: 0 }, $.message.defaults.fadeOutDuration, function() { $(this).hide() })
        //}
    }

    $.message = {};
    $.message.defaults = {
        opacity: 0.8,
        fadeOutDuration: 500,
        fadeInDuration: 200,
        displayDurationPerCharacter: 125,
        minDuration: 500,
        totalTimeout: 5000,
        template: '<div id="jqueryMessage" class="jquery-message cancelBubble"><div class="jquery-message-content"><a href="#" class="close">×</a><p></p></div></div>'
    }
})(jQuery);

// jquery.jsonp 2.4.0 (c)2012 Julian Aubourg | MIT License
// https://github.com/jaubourg/jquery-jsonp
(function(e){function t(){}function n(e){C=[e]}function r(e,t,n){return e&&e.apply&&e.apply(t.context||t,n)}function i(e){return/\?/.test(e)?"&":"?"}function O(c){function Y(e){z++||(W(),j&&(T[I]={s:[e]}),D&&(e=D.apply(c,[e])),r(O,c,[e,b,c]),r(_,c,[c,b]))}function Z(e){z++||(W(),j&&e!=w&&(T[I]=e),r(M,c,[c,e]),r(_,c,[c,e]))}c=e.extend({},k,c);var O=c.success,M=c.error,_=c.complete,D=c.dataFilter,P=c.callbackParameter,H=c.callback,B=c.cache,j=c.pageCache,F=c.charset,I=c.url,q=c.data,R=c.timeout,U,z=0,W=t,X,V,J,K,Q,G;return S&&S(function(e){e.done(O).fail(M),O=e.resolve,M=e.reject}).promise(c),c.abort=function(){!(z++)&&W()},r(c.beforeSend,c,[c])===!1||z?c:(I=I||u,q=q?typeof q=="string"?q:e.param(q,c.traditional):u,I+=q?i(I)+q:u,P&&(I+=i(I)+encodeURIComponent(P)+"=?"),!B&&!j&&(I+=i(I)+"_"+(new Date).getTime()+"="),I=I.replace(/=\?(&|$)/,"="+H+"$1"),j&&(U=T[I])?U.s?Y(U.s[0]):Z(U):(E[H]=n,K=e(y)[0],K.id=l+N++,F&&(K[o]=F),L&&L.version()<11.6?(Q=e(y)[0]).text="document.getElementById('"+K.id+"')."+p+"()":K[s]=s,A&&(K.htmlFor=K.id,K.event=h),K[d]=K[p]=K[v]=function(e){if(!K[m]||!/i/.test(K[m])){try{K[h]&&K[h]()}catch(t){}e=C,C=0,e?Y(e[0]):Z(a)}},K.src=I,W=function(e){G&&clearTimeout(G),K[v]=K[d]=K[p]=null,x[g](K),Q&&x[g](Q)},x[f](K,J=x.firstChild),Q&&x[f](Q,J),G=R>0&&setTimeout(function(){Z(w)},R)),c)}var s="async",o="charset",u="",a="error",f="insertBefore",l="_jqjsp",c="on",h=c+"click",p=c+a,d=c+"load",v=c+"readystatechange",m="readyState",g="removeChild",y="<script>",b="success",w="timeout",E=window,S=e.Deferred,x=e("head")[0]||document.documentElement,T={},N=0,C,k={callback:l,url:location.href},L=E.opera,A=!!e("<div>").html("<!--[if IE]><i><![endif]-->").find("i").length;O.setup=function(t){e.extend(k,t)},e.jsonp=O})(jQuery)
!function(e){"use strict";var t={i18n:{ar:{months:["كانون الثاني","شباط","آذار","نيسان","مايو","حزيران","تموز","آب","أيلول","تشرين الأول","تشرين الثاني","كانون الأول"],dayOfWeek:["ن","ث","ع","خ","ج","س","ح"]},ro:{months:["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"],dayOfWeek:["l","ma","mi","j","v","s","d"]},id:{months:["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],dayOfWeek:["Sen","Sel","Rab","Kam","Jum","Sab","Min"]},bg:{months:["Януари","Февруари","Март","Април","Май","Юни","Юли","Август","Септември","Октомври","Ноември","Декември"],dayOfWeek:["Нд","Пн","Вт","Ср","Чт","Пт","Сб"]},fa:{months:["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"],dayOfWeek:["یکشنبه","دوشنبه","سه شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"]},ru:{months:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],dayOfWeek:["Вск","Пн","Вт","Ср","Чт","Пт","Сб"]},uk:{months:["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"],dayOfWeek:["Ндл","Пнд","Втр","Срд","Чтв","Птн","Сбт"]},en:{months:["January","February","March","April","May","June","July","August","September","October","November","December"],dayOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},el:{months:["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος"],dayOfWeek:["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"]},de:{months:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],dayOfWeek:["So","Mo","Di","Mi","Do","Fr","Sa"]},nl:{months:["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],dayOfWeek:["zo","ma","di","wo","do","vr","za"]},tr:{months:["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],dayOfWeek:["Paz","Pts","Sal","Çar","Per","Cum","Cts"]},fr:{months:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],dayOfWeek:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"]},es:{months:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],dayOfWeek:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]},th:{months:["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],dayOfWeek:["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."]},pl:{months:["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"],dayOfWeek:["nd","pn","wt","śr","cz","pt","sb"]},pt:{months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],dayOfWeek:["Dom","Seg","Ter","Qua","Qui","Sex","Sab"]},ch:{months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],dayOfWeek:["日","一","二","三","四","五","六"]},se:{months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],dayOfWeek:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"]},kr:{months:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],dayOfWeek:["일","월","화","수","목","금","토"]},it:{months:["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],dayOfWeek:["Dom","Lun","Mar","Mer","Gio","Ven","Sab"]},da:{months:["January","Februar","Marts","April","Maj","Juni","July","August","September","Oktober","November","December"],dayOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"]},no:{months:["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"],dayOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"]},ja:{months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],dayOfWeek:["日","月","火","水","木","金","土"]},vi:{months:["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"],dayOfWeek:["CN","T2","T3","T4","T5","T6","T7"]},sl:{months:["Januar","Februar","Marec","April","Maj","Junij","Julij","Avgust","September","Oktober","November","December"],dayOfWeek:["Ned","Pon","Tor","Sre","Čet","Pet","Sob"]},cs:{months:["Leden","Únor","Březen","Duben","Květen","Červen","Červenec","Srpen","Září","Říjen","Listopad","Prosinec"],dayOfWeek:["Ne","Po","Út","St","Čt","Pá","So"]},hu:{months:["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"],dayOfWeek:["Va","Hé","Ke","Sze","Cs","Pé","Szo"]},az:{months:["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avqust","Sentyabr","Oktyabr","Noyabr","Dekabr"],dayOfWeek:["B","Be","Ça","Ç","Ca","C","Ş"]},bs:{months:["Januar","Februar","Mart","April","Maj","Jun","Jul","Avgust","Septembar","Oktobar","Novembar","Decembar"],dayOfWeek:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"]},ca:{months:["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"],dayOfWeek:["Dg","Dl","Dt","Dc","Dj","Dv","Ds"]},"en-GB":{months:["January","February","March","April","May","June","July","August","September","October","November","December"],dayOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},et:{months:["Jaanuar","Veebruar","Märts","Aprill","Mai","Juuni","Juuli","August","September","Oktoober","November","Detsember"],dayOfWeek:["P","E","T","K","N","R","L"]},eu:{months:["Urtarrila","Otsaila","Martxoa","Apirila","Maiatza","Ekaina","Uztaila","Abuztua","Iraila","Urria","Azaroa","Abendua"],dayOfWeek:["Ig.","Al.","Ar.","Az.","Og.","Or.","La."]},fi:{months:["Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"],dayOfWeek:["Su","Ma","Ti","Ke","To","Pe","La"]},gl:{months:["Xan","Feb","Maz","Abr","Mai","Xun","Xul","Ago","Set","Out","Nov","Dec"],dayOfWeek:["Dom","Lun","Mar","Mer","Xov","Ven","Sab"]},hr:{months:["Siječanj","Veljača","Ožujak","Travanj","Svibanj","Lipanj","Srpanj","Kolovoz","Rujan","Listopad","Studeni","Prosinac"],dayOfWeek:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"]},ko:{months:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],dayOfWeek:["일","월","화","수","목","금","토"]},lt:{months:["Sausio","Vasario","Kovo","Balandžio","Gegužės","Birželio","Liepos","Rugpjūčio","Rugsėjo","Spalio","Lapkričio","Gruodžio"],dayOfWeek:["Sek","Pir","Ant","Tre","Ket","Pen","Šeš"]},lv:{months:["Janvāris","Februāris","Marts","Aprīlis ","Maijs","Jūnijs","Jūlijs","Augusts","Septembris","Oktobris","Novembris","Decembris"],dayOfWeek:["Sv","Pr","Ot","Tr","Ct","Pk","St"]},mk:{months:["јануари","февруари","март","април","мај","јуни","јули","август","септември","октомври","ноември","декември"],dayOfWeek:["нед","пон","вто","сре","чет","пет","саб"]},mn:{months:["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"],dayOfWeek:["Дав","Мяг","Лха","Пүр","Бсн","Бям","Ням"]},"pt-BR":{months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],dayOfWeek:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]},sk:{months:["Január","Február","Marec","Apríl","Máj","Jún","Júl","August","September","Október","November","December"],dayOfWeek:["Ne","Po","Ut","St","Št","Pi","So"]},sq:{months:["January","February","March","April","May","June","July","August","September","October","November","December"],dayOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},"sr-YU":{months:["Januar","Februar","Mart","April","Maj","Jun","Jul","Avgust","Septembar","Oktobar","Novembar","Decembar"],dayOfWeek:["Ned","Pon","Uto","Sre","čet","Pet","Sub"]},sr:{months:["јануар","фебруар","март","април","мај","јун","јул","август","септембар","октобар","новембар","децембар"],dayOfWeek:["нед","пон","уто","сре","чет","пет","суб"]},sv:{months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],dayOfWeek:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"]},"zh-TW":{months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],dayOfWeek:["日","一","二","三","四","五","六"]},zh:{months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],dayOfWeek:["日","一","二","三","四","五","六"]},he:{months:["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],dayOfWeek:["א'","ב'","ג'","ד'","ה'","ו'","שבת"]},hy:{months:["Հունվար","Փետրվար","Մարտ","Ապրիլ","Մայիս","Հունիս","Հուլիս","Օգոստոս","Սեպտեմբեր","Հոկտեմբեր","Նոյեմբեր","Դեկտեմբեր"],dayOfWeek:["Կի","Երկ","Երք","Չոր","Հնգ","Ուրբ","Շբթ"]},kg:{months:["Үчтүн айы","Бирдин айы","Жалган Куран","Чын Куран","Бугу","Кулжа","Теке","Баш Оона","Аяк Оона","Тогуздун айы","Жетинин айы","Бештин айы"],dayOfWeek:["Жек","Дүй","Шей","Шар","Бей","Жум","Ише"]}},value:"",lang:"en",format:"Y/m/d H:i",formatTime:"H:i",formatDate:"Y/m/d",startDate:false,step:60,monthChangeSpinner:true,closeOnDateSelect:false,closeOnTimeSelect:false,closeOnWithoutClick:true,closeOnInputClick:true,timepicker:true,datepicker:true,weeks:false,defaultTime:false,defaultDate:false,minDate:false,maxDate:false,minTime:false,maxTime:false,allowTimes:[],opened:false,initTime:true,inline:false,theme:"",onSelectDate:function(){},onSelectTime:function(){},onChangeMonth:function(){},onChangeYear:function(){},onChangeDateTime:function(){},onShow:function(){},onClose:function(){},onGenerate:function(){},withoutCopyright:true,inverseButton:false,hours12:false,next:"xdsoft_next",prev:"xdsoft_prev",dayOfWeekStart:0,parentID:"body",timeHeightInTimePicker:25,timepickerScrollbar:true,todayButton:true,prevButton:true,nextButton:true,defaultSelect:true,scrollMonth:true,scrollTime:true,scrollInput:true,lazyInit:false,mask:false,validateOnBlur:true,allowBlank:true,yearStart:1950,yearEnd:2050,monthStart:0,monthEnd:11,style:"",id:"",fixed:false,roundTime:"round",className:"",weekends:[],disabledDates:[],yearOffset:0,beforeShowDay:null,enterLikeTab:true,showApplyButton:false};if(!Array.prototype.indexOf){Array.prototype.indexOf=function(e,t){var a,r;for(a=t||0,r=this.length;a<r;a+=1){if(this[a]===e){return a}}return-1}}Date.prototype.countDaysInMonth=function(){return new Date(this.getFullYear(),this.getMonth()+1,0).getDate()};e.fn.xdsoftScroller=function(t){return this.each(function(){var a=e(this),r=function(e){var t={x:0,y:0},a;if(e.type==="touchstart"||e.type==="touchmove"||e.type==="touchend"||e.type==="touchcancel"){a=e.originalEvent.touches[0]||e.originalEvent.changedTouches[0];t.x=a.clientX;t.y=a.clientY}else if(e.type==="mousedown"||e.type==="mouseup"||e.type==="mousemove"||e.type==="mouseover"||e.type==="mouseout"||e.type==="mouseenter"||e.type==="mouseleave"){t.x=e.clientX;t.y=e.clientY}return t},n=0,i,s,o,u,l,f=100,d=false,c=0,m=0,h=0,g=false,p=0,x=function(){};if(t==="hide"){a.find(".xdsoft_scrollbar").hide();return}if(!e(this).hasClass("xdsoft_scroller_box")){i=a.children().eq(0);s=a[0].clientHeight;o=i[0].offsetHeight;u=e('<div class="xdsoft_scrollbar"></div>');l=e('<div class="xdsoft_scroller"></div>');u.append(l);a.addClass("xdsoft_scroller_box").append(u);x=function v(e){var t=r(e).y-c+p;if(t<0){t=0}if(t+l[0].offsetHeight>h){t=h-l[0].offsetHeight}a.trigger("scroll_element.xdsoft_scroller",[f?t/f:0])};l.on("touchstart.xdsoft_scroller mousedown.xdsoft_scroller",function(n){if(!s){a.trigger("resize_scroll.xdsoft_scroller",[t])}c=r(n).y;p=parseInt(l.css("margin-top"),10);h=u[0].offsetHeight;if(n.type==="mousedown"){if(document){e(document.body).addClass("xdsoft_noselect")}e([document.body,window]).on("mouseup.xdsoft_scroller",function i(){e([document.body,window]).off("mouseup.xdsoft_scroller",i).off("mousemove.xdsoft_scroller",x).removeClass("xdsoft_noselect")});e(document.body).on("mousemove.xdsoft_scroller",x)}else{g=true;n.stopPropagation();n.preventDefault()}}).on("touchmove",function(e){if(g){e.preventDefault();x(e)}}).on("touchend touchcancel",function(e){g=false;p=0});a.on("scroll_element.xdsoft_scroller",function(e,t){if(!s){a.trigger("resize_scroll.xdsoft_scroller",[t,true])}t=t>1?1:t<0||isNaN(t)?0:t;l.css("margin-top",f*t);setTimeout(function(){i.css("marginTop",-parseInt((i[0].offsetHeight-s)*t,10))},10)}).on("resize_scroll.xdsoft_scroller",function(e,t,r){var n,d;s=a[0].clientHeight;o=i[0].offsetHeight;n=s/o;d=n*u[0].offsetHeight;if(n>1){l.hide()}else{l.show();l.css("height",parseInt(d>10?d:10,10));f=u[0].offsetHeight-l[0].offsetHeight;if(r!==true){a.trigger("scroll_element.xdsoft_scroller",[t||Math.abs(parseInt(i.css("marginTop"),10))/(o-s)])}}});a.on("mousewheel",function(e){var t=Math.abs(parseInt(i.css("marginTop"),10));t=t-e.deltaY*20;if(t<0){t=0}a.trigger("scroll_element.xdsoft_scroller",[t/(o-s)]);e.stopPropagation();return false});a.on("touchstart",function(e){d=r(e);m=Math.abs(parseInt(i.css("marginTop"),10))});a.on("touchmove",function(e){if(d){e.preventDefault();var t=r(e);a.trigger("scroll_element.xdsoft_scroller",[(m-(t.y-d.y))/(o-s)])}});a.on("touchend touchcancel",function(e){d=false;m=0})}a.trigger("resize_scroll.xdsoft_scroller",[t])})};e.fn.datetimepicker=function(a){var r=48,n=57,i=96,s=105,o=17,u=46,l=13,f=27,d=8,c=37,m=38,h=39,g=40,p=9,x=116,v=65,y=67,D=86,b=90,T=89,k=false,w=e.isPlainObject(a)||!a?e.extend(true,{},t,a):e.extend(true,{},t),M=0,S,O,_=function(e){e.on("open.xdsoft focusin.xdsoft mousedown.xdsoft",function t(a){if(e.is(":disabled")||e.data("xdsoft_datetimepicker")){return}clearTimeout(M);M=setTimeout(function(){if(!e.data("xdsoft_datetimepicker")){S(e)}e.off("open.xdsoft focusin.xdsoft mousedown.xdsoft",t).trigger("open.xdsoft")},100)})};S=function(t){var M=e("<div "+(w.id?'id="'+w.id+'"':"")+" "+(w.style?'style="'+w.style+'"':"")+' class="xdsoft_datetimepicker xdsoft_'+w.theme+" xdsoft_noselect "+(w.weeks?" xdsoft_showweeks":"")+w.className+'"></div>'),S=e('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),O=e('<div class="xdsoft_datepicker active"></div>'),_=e('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button>'+'<div class="xdsoft_label xdsoft_month"><span></span><i></i></div>'+'<div class="xdsoft_label xdsoft_year"><span></span><i></i></div>'+'<button type="button" class="xdsoft_next"></button></div>'),F=e('<div class="xdsoft_calendar"></div>'),A=e('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),W=A.find(".xdsoft_time_box").eq(0),Y=e('<div class="xdsoft_time_variant"></div>'),C=e('<button class="xdsoft_save_selected blue-gradient-button">Save Selected</button>'),P=e('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),J=e('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),I=false,H,N,z,j,L,B=0,R=0,E;_.find(".xdsoft_month span").after(P);_.find(".xdsoft_year span").after(J);_.find(".xdsoft_month,.xdsoft_year").on("mousedown.xdsoft",function(t){var a=e(this).find(".xdsoft_select").eq(0),r=0,n=0,i=a.is(":visible"),s,o;_.find(".xdsoft_select").hide();if(E.currentTime){r=E.currentTime[e(this).hasClass("xdsoft_month")?"getMonth":"getFullYear"]()}a[i?"hide":"show"]();for(s=a.find("div.xdsoft_option"),o=0;o<s.length;o+=1){if(s.eq(o).data("value")===r){break}else{n+=s[0].offsetHeight}}a.xdsoftScroller(n/(a.children()[0].offsetHeight-a[0].clientHeight));t.stopPropagation();return false});_.find(".xdsoft_select").xdsoftScroller().on("mousedown.xdsoft",function(e){e.stopPropagation();e.preventDefault()}).on("mousedown.xdsoft",".xdsoft_option",function(t){if(E.currentTime===undefined||E.currentTime===null){E.currentTime=E.now()}var a=E.currentTime.getFullYear();if(E&&E.currentTime){E.currentTime[e(this).parent().parent().hasClass("xdsoft_monthselect")?"setMonth":"setFullYear"](e(this).data("value"))}e(this).parent().parent().hide();M.trigger("xchange.xdsoft");if(w.onChangeMonth&&e.isFunction(w.onChangeMonth)){w.onChangeMonth.call(M,E.currentTime,M.data("input"))}if(a!==E.currentTime.getFullYear()&&e.isFunction(w.onChangeYear)){w.onChangeYear.call(M,E.currentTime,M.data("input"))}});M.setOptions=function(a){w=e.extend(true,{},w,a);if(a.allowTimes&&e.isArray(a.allowTimes)&&a.allowTimes.length){w.allowTimes=e.extend(true,[],a.allowTimes)}if(a.weekends&&e.isArray(a.weekends)&&a.weekends.length){w.weekends=e.extend(true,[],a.weekends)}if(a.disabledDates&&e.isArray(a.disabledDates)&&a.disabledDates.length){w.disabledDates=e.extend(true,[],a.disabledDates)}if((w.open||w.opened)&&!w.inline){t.trigger("open.xdsoft")}if(w.inline){I=true;M.addClass("xdsoft_inline");t.after(M).hide()}if(w.inverseButton){w.next="xdsoft_prev";w.prev="xdsoft_next"}if(w.datepicker){O.addClass("active")}else{O.removeClass("active")}if(w.timepicker){A.addClass("active")}else{A.removeClass("active")}if(w.value){if(t&&t.val){t.val(w.value)}E.setCurrentTime(w.value)}if(isNaN(w.dayOfWeekStart)){w.dayOfWeekStart=0}else{w.dayOfWeekStart=parseInt(w.dayOfWeekStart,10)%7}if(!w.timepickerScrollbar){W.xdsoftScroller("hide")}if(w.minDate&&/^-(.*)$/.test(w.minDate)){w.minDate=E.strToDateTime(w.minDate).dateFormat(w.formatDate)}if(w.maxDate&&/^\+(.*)$/.test(w.maxDate)){w.maxDate=E.strToDateTime(w.maxDate).dateFormat(w.formatDate)}C.toggle(w.showApplyButton);_.find(".xdsoft_today_button").css("visibility",!w.todayButton?"hidden":"visible");_.find("."+w.prev).css("visibility",!w.prevButton?"hidden":"visible");_.find("."+w.next).css("visibility",!w.nextButton?"hidden":"visible");if(w.mask){var S,F=function(e){try{if(document.selection&&document.selection.createRange){var t=document.selection.createRange();return t.getBookmark().charCodeAt(2)-2}if(e.setSelectionRange){return e.selectionStart}}catch(a){return 0}},Y=function(e,t){e=typeof e==="string"||e instanceof String?document.getElementById(e):e;if(!e){return false}if(e.createTextRange){var a=e.createTextRange();a.collapse(true);a.moveEnd("character",t);a.moveStart("character",t);a.select();return true}if(e.setSelectionRange){e.setSelectionRange(t,t);return true}return false},P=function(e,t){var a=e.replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g,"\\$1").replace(/_/g,"{digit+}").replace(/([0-9]{1})/g,"{digit$1}").replace(/\{digit([0-9]{1})\}/g,"[0-$1_]{1}").replace(/\{digit[\+]\}/g,"[0-9_]{1}");return new RegExp(a).test(t)};t.off("keydown.xdsoft");if(w.mask===true){w.mask=w.format.replace(/Y/g,"9999").replace(/F/g,"9999").replace(/m/g,"19").replace(/d/g,"39").replace(/H/g,"29").replace(/i/g,"59").replace(/s/g,"59")}if(e.type(w.mask)==="string"){if(!P(w.mask,t.val())){t.val(w.mask.replace(/[0-9]/g,"_"))}t.on("keydown.xdsoft",function(a){var M=this.value,S=a.which,O,_;if(S>=r&&S<=n||S>=i&&S<=s||S===d||S===u){O=F(this);_=S!==d&&S!==u?String.fromCharCode(i<=S&&S<=s?S-r:S):"_";if((S===d||S===u)&&O){O-=1;_="_"}while(/[^0-9_]/.test(w.mask.substr(O,1))&&O<w.mask.length&&O>0){O+=S===d||S===u?-1:1}M=M.substr(0,O)+_+M.substr(O+1);if(e.trim(M)===""){M=w.mask.replace(/[0-9]/g,"_")}else{if(O===w.mask.length){a.preventDefault();return false}}O+=S===d||S===u?0:1;while(/[^0-9_]/.test(w.mask.substr(O,1))&&O<w.mask.length&&O>0){O+=S===d||S===u?-1:1}if(P(w.mask,M)){this.value=M;Y(this,O)}else if(e.trim(M)===""){this.value=w.mask.replace(/[0-9]/g,"_")}else{t.trigger("error_input.xdsoft")}}else{if([v,y,D,b,T].indexOf(S)!==-1&&k||[f,m,g,c,h,x,o,p,l].indexOf(S)!==-1){return true}}a.preventDefault();return false})}}if(w.validateOnBlur){t.off("blur.xdsoft").on("blur.xdsoft",function(){if(w.allowBlank&&!e.trim(e(this).val()).length){e(this).val(null);M.data("xdsoft_datetime").empty()}else if(!Date.parseDate(e(this).val(),w.format)){var t=+[e(this).val()[0],e(this).val()[1]].join(""),a=+[e(this).val()[2],e(this).val()[3]].join("");if(!w.datepicker&&w.timepicker&&t>=0&&t<24&&a>=0&&a<60){e(this).val([t,a].map(function(e){return e>9?e:"0"+e}).join(":"))}else{e(this).val(E.now().dateFormat(w.format))}M.data("xdsoft_datetime").setCurrentTime(e(this).val())}else{M.data("xdsoft_datetime").setCurrentTime(e(this).val())}M.trigger("changedatetime.xdsoft")})}w.dayOfWeekStartPrev=w.dayOfWeekStart===0?6:w.dayOfWeekStart-1;M.trigger("xchange.xdsoft").trigger("afterOpen.xdsoft")};M.data("options",w).on("mousedown.xdsoft",function(e){e.stopPropagation();e.preventDefault();J.hide();P.hide();return false});W.append(Y);W.xdsoftScroller();M.on("afterOpen.xdsoft",function(){W.xdsoftScroller()});M.append(O).append(A);if(w.withoutCopyright!==true){M.append(S)}O.append(_).append(F).append(C);e(w.parentID).append(M);H=function(){var t=this;t.now=function(e){var a=new Date,r,n;if(!e&&w.defaultDate){r=t.strToDate(w.defaultDate);a.setFullYear(r.getFullYear());a.setMonth(r.getMonth());a.setDate(r.getDate())}if(w.yearOffset){a.setFullYear(a.getFullYear()+w.yearOffset)}if(!e&&w.defaultTime){n=t.strtotime(w.defaultTime);a.setHours(n.getHours());a.setMinutes(n.getMinutes())}return a};t.isValidDate=function(e){if(Object.prototype.toString.call(e)!=="[object Date]"){return false}return!isNaN(e.getTime())};t.setCurrentTime=function(e){t.currentTime=typeof e==="string"?t.strToDateTime(e):t.isValidDate(e)?e:t.now();M.trigger("xchange.xdsoft")};t.empty=function(){t.currentTime=null};t.getCurrentTime=function(e){return t.currentTime};t.nextMonth=function(){if(t.currentTime===undefined||t.currentTime===null){t.currentTime=t.now()}var a=t.currentTime.getMonth()+1,r;if(a===12){t.currentTime.setFullYear(t.currentTime.getFullYear()+1);a=0}r=t.currentTime.getFullYear();t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(),a+1,0).getDate(),t.currentTime.getDate()));t.currentTime.setMonth(a);if(w.onChangeMonth&&e.isFunction(w.onChangeMonth)){w.onChangeMonth.call(M,E.currentTime,M.data("input"))}if(r!==t.currentTime.getFullYear()&&e.isFunction(w.onChangeYear)){w.onChangeYear.call(M,E.currentTime,M.data("input"))}M.trigger("xchange.xdsoft");return a};t.prevMonth=function(){if(t.currentTime===undefined||t.currentTime===null){t.currentTime=t.now()}var a=t.currentTime.getMonth()-1;if(a===-1){t.currentTime.setFullYear(t.currentTime.getFullYear()-1);a=11}t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(),a+1,0).getDate(),t.currentTime.getDate()));t.currentTime.setMonth(a);if(w.onChangeMonth&&e.isFunction(w.onChangeMonth)){w.onChangeMonth.call(M,E.currentTime,M.data("input"))}M.trigger("xchange.xdsoft");return a};t.getWeekOfYear=function(e){var t=new Date(e.getFullYear(),0,1);return Math.ceil(((e-t)/864e5+t.getDay()+1)/7)};t.strToDateTime=function(e){var a=[],r,n;if(e&&e instanceof Date&&t.isValidDate(e)){return e}a=/^(\+|\-)(.*)$/.exec(e);if(a){a[2]=Date.parseDate(a[2],w.formatDate)}if(a&&a[2]){r=a[2].getTime()-a[2].getTimezoneOffset()*6e4;n=new Date(E.now().getTime()+parseInt(a[1]+"1",10)*r)}else{n=e?Date.parseDate(e,w.format):t.now()}if(!t.isValidDate(n)){n=t.now()}return n};t.strToDate=function(e){if(e&&e instanceof Date&&t.isValidDate(e)){return e}var a=e?Date.parseDate(e,w.formatDate):t.now(true);if(!t.isValidDate(a)){a=t.now(true)}return a};t.strtotime=function(e){if(e&&e instanceof Date&&t.isValidDate(e)){return e}var a=e?Date.parseDate(e,w.formatTime):t.now(true);if(!t.isValidDate(a)){a=t.now(true)}return a};t.str=function(){return t.currentTime.dateFormat(w.format)};t.currentTime=this.now()};E=new H;C.on("click",function(e){e.preventDefault();M.data("changed",true);E.setCurrentTime(V());t.val(E.str());M.trigger("close.xdsoft")});_.find(".xdsoft_today_button").on("mousedown.xdsoft",function(){M.data("changed",true);E.setCurrentTime(0);M.trigger("afterOpen.xdsoft")}).on("dblclick.xdsoft",function(){t.val(E.str());M.trigger("close.xdsoft")});_.find(".xdsoft_prev,.xdsoft_next").on("mousedown.xdsoft",function(){var t=e(this),a=0,r=false;!function n(e){if(t.hasClass(w.next)){E.nextMonth()}else if(t.hasClass(w.prev)){E.prevMonth()}if(w.monthChangeSpinner){if(!r){a=setTimeout(n,e||100)}}}(500);e([document.body,window]).on("mouseup.xdsoft",function i(){clearTimeout(a);r=true;e([document.body,window]).off("mouseup.xdsoft",i)})});A.find(".xdsoft_prev,.xdsoft_next").on("mousedown.xdsoft",function(){var t=e(this),a=0,r=false,n=110;!function i(e){var s=W[0].clientHeight,o=Y[0].offsetHeight,u=Math.abs(parseInt(Y.css("marginTop"),10));if(t.hasClass(w.next)&&o-s-w.timeHeightInTimePicker>=u){Y.css("marginTop","-"+(u+w.timeHeightInTimePicker)+"px")}else if(t.hasClass(w.prev)&&u-w.timeHeightInTimePicker>=0){Y.css("marginTop","-"+(u-w.timeHeightInTimePicker)+"px")}W.trigger("scroll_element.xdsoft_scroller",[Math.abs(parseInt(Y.css("marginTop"),10)/(o-s))]);n=n>10?10:n-10;if(!r){a=setTimeout(i,e||n)}}(500);e([document.body,window]).on("mouseup.xdsoft",function s(){clearTimeout(a);r=true;e([document.body,window]).off("mouseup.xdsoft",s)})});N=0;M.on("xchange.xdsoft",function(t){clearTimeout(N);N=setTimeout(function(){if(E.currentTime===undefined||E.currentTime===null){E.currentTime=E.now()}var t="",r=new Date(E.currentTime.getFullYear(),E.currentTime.getMonth(),1,12,0,0),n=0,i,s=E.now(),o=false,u=false,l,f,d,c,m=[],h,g=true,p="",x="",v;while(r.getDay()!==w.dayOfWeekStart){r.setDate(r.getDate()-1)}t+="<table><thead><tr>";if(w.weeks){t+="<th></th>"}for(i=0;i<7;i+=1){t+="<th>"+w.i18n[w.lang].dayOfWeek[(i+w.dayOfWeekStart)%7]+"</th>"}t+="</tr></thead>";t+="<tbody>";if(w.maxDate!==false){o=E.strToDate(w.maxDate);o=new Date(o.getFullYear(),o.getMonth(),o.getDate(),23,59,59,999)}if(w.minDate!==false){u=E.strToDate(w.minDate);u=new Date(u.getFullYear(),u.getMonth(),u.getDate())}while(n<E.currentTime.countDaysInMonth()||r.getDay()!==w.dayOfWeekStart||E.currentTime.getMonth()===r.getMonth()){m=[];n+=1;l=r.getDate();f=r.getFullYear();d=r.getMonth();c=E.getWeekOfYear(r);m.push("xdsoft_date");if(w.beforeShowDay&&e.isFunction(w.beforeShowDay.call)){h=w.beforeShowDay.call(M,r)}else{h=null}if(o!==false&&r>o||u!==false&&r<u||h&&h[0]===false){m.push("xdsoft_disabled")}else if(w.disabledDates.indexOf(r.dateFormat(w.formatDate))!==-1){m.push("xdsoft_disabled")}if(h&&h[1]!==""){m.push(h[1])}if(E.currentTime.getMonth()!==d){m.push("xdsoft_other_month")}if((w.defaultSelect||M.data("changed"))&&E.currentTime.dateFormat(w.formatDate)===r.dateFormat(w.formatDate)){m.push("xdsoft_current")}if(s.dateFormat(w.formatDate)===r.dateFormat(w.formatDate)){m.push("xdsoft_today")}if(r.getDay()===0||r.getDay()===6||~w.weekends.indexOf(r.dateFormat(w.formatDate))){m.push("xdsoft_weekend")}if(w.beforeShowDay&&e.isFunction(w.beforeShowDay)){m.push(w.beforeShowDay(r))}if(g){t+="<tr>";g=false;if(w.weeks){t+="<th>"+c+"</th>"}}t+='<td data-date="'+l+'" data-month="'+d+'" data-year="'+f+'"'+' class="xdsoft_date xdsoft_day_of_week'+r.getDay()+" "+m.join(" ")+'">'+"<div>"+l+"</div>"+"</td>";if(r.getDay()===w.dayOfWeekStartPrev){t+="</tr>";g=true}r.setDate(l+1)}t+="</tbody></table>";F.html(t);_.find(".xdsoft_label span").eq(0).text(w.i18n[w.lang].months[E.currentTime.getMonth()]);_.find(".xdsoft_label span").eq(1).text(E.currentTime.getFullYear());p="";x="";d="";v=function y(e,t){var a=E.now();a.setHours(e);e=parseInt(a.getHours(),10);a.setMinutes(t);t=parseInt(a.getMinutes(),10);var r=new Date(E.currentTime);r.setHours(e);r.setMinutes(t);m=[];if(w.minDateTime!==false&&w.minDateTime>r||w.maxTime!==false&&E.strtotime(w.maxTime).getTime()<a.getTime()||w.minTime!==false&&E.strtotime(w.minTime).getTime()>a.getTime()){m.push("xdsoft_disabled")}var n=new Date(E.currentTime);n.setHours(parseInt(E.currentTime.getHours(),10));n.setMinutes(Math[w.roundTime](E.currentTime.getMinutes()/w.step)*w.step);if((w.initTime||w.defaultSelect||M.data("changed"))&&n.getHours()===parseInt(e,10)&&(w.step>59||n.getMinutes()===parseInt(t,10))){if(w.defaultSelect||M.data("changed")){m.push("xdsoft_current")}else if(w.initTime){m.push("xdsoft_init_time")}}if(parseInt(s.getHours(),10)===parseInt(e,10)&&parseInt(s.getMinutes(),10)===parseInt(t,10)){m.push("xdsoft_today")}p+='<div class="xdsoft_time '+m.join(" ")+'" data-hour="'+e+'" data-minute="'+t+'">'+a.dateFormat(w.formatTime)+"</div>"};if(!w.allowTimes||!e.isArray(w.allowTimes)||!w.allowTimes.length){for(n=0,i=0;n<(w.hours12?12:24);n+=1){for(i=0;i<60;i+=w.step){x=(n<10?"0":"")+n;d=(i<10?"0":"")+i;v(x,d)}}}else{for(n=0;n<w.allowTimes.length;n+=1){x=E.strtotime(w.allowTimes[n]).getHours();d=E.strtotime(w.allowTimes[n]).getMinutes();v(x,d)}}Y.html(p);a="";n=0;for(n=parseInt(w.yearStart,10)+w.yearOffset;n<=parseInt(w.yearEnd,10)+w.yearOffset;n+=1){a+='<div class="xdsoft_option '+(E.currentTime.getFullYear()===n?"xdsoft_current":"")+'" data-value="'+n+'">'+n+"</div>"}J.children().eq(0).html(a);for(n=parseInt(w.monthStart),a="";n<=parseInt(w.monthEnd);n+=1){a+='<div class="xdsoft_option '+(E.currentTime.getMonth()===n?"xdsoft_current":"")+'" data-value="'+n+'">'+w.i18n[w.lang].months[n]+"</div>"}P.children().eq(0).html(a);e(M).trigger("generate.xdsoft")},10);t.stopPropagation()}).on("afterOpen.xdsoft",function(){if(w.timepicker){var e,t,a,r;if(Y.find(".xdsoft_current").length){e=".xdsoft_current"}else if(Y.find(".xdsoft_init_time").length){e=".xdsoft_init_time"}if(e){t=W[0].clientHeight;a=Y[0].offsetHeight;r=Y.find(e).index()*w.timeHeightInTimePicker+1;if(a-t<r){r=a-t}W.trigger("scroll_element.xdsoft_scroller",[parseInt(r,10)/(a-t)])}else{W.trigger("scroll_element.xdsoft_scroller",[0])}}});z=0;F.on("click.xdsoft","td",function(a){a.stopPropagation();z+=1;var r=e(this),n=E.currentTime;if(n===undefined||n===null){E.currentTime=E.now();n=E.currentTime}if(r.hasClass("xdsoft_disabled")){return false}n.setDate(1);n.setFullYear(r.data("year"));n.setMonth(r.data("month"));n.setDate(r.data("date"));M.trigger("select.xdsoft",[n]);t.val(E.str());if((z>1||w.closeOnDateSelect===true||w.closeOnDateSelect===0&&!w.timepicker)&&!w.inline){M.trigger("close.xdsoft")}if(w.onSelectDate&&e.isFunction(w.onSelectDate)){w.onSelectDate.call(M,E.currentTime,M.data("input"),a)}M.data("changed",true);M.trigger("xchange.xdsoft");M.trigger("changedatetime.xdsoft");setTimeout(function(){z=0},200)});Y.on("click.xdsoft","div",function(t){t.stopPropagation();var a=e(this),r=E.currentTime;if(r===undefined||r===null){E.currentTime=E.now();r=E.currentTime}if(a.hasClass("xdsoft_disabled")){return false}r.setHours(a.data("hour"));r.setMinutes(a.data("minute"));M.trigger("select.xdsoft",[r]);M.data("input").val(E.str());if(w.inline!==true&&w.closeOnTimeSelect===true){M.trigger("close.xdsoft")}if(w.onSelectTime&&e.isFunction(w.onSelectTime)){w.onSelectTime.call(M,E.currentTime,M.data("input"),t)}M.data("changed",true);M.trigger("xchange.xdsoft");M.trigger("changedatetime.xdsoft")});O.on("mousewheel.xdsoft",function(e){if(!w.scrollMonth){return true}if(e.deltaY<0){E.nextMonth()}else{E.prevMonth()}return false});t.on("mousewheel.xdsoft",function(e){if(!w.scrollInput){return true}if(!w.datepicker&&w.timepicker){j=Y.find(".xdsoft_current").length?Y.find(".xdsoft_current").eq(0).index():0;if(j+e.deltaY>=0&&j+e.deltaY<Y.children().length){j+=e.deltaY}if(Y.children().eq(j).length){Y.children().eq(j).trigger("mousedown")}return false}if(w.datepicker&&!w.timepicker){O.trigger(e,[e.deltaY,e.deltaX,e.deltaY]);if(t.val){t.val(E.str())}M.trigger("changedatetime.xdsoft");return false}});M.on("changedatetime.xdsoft",function(t){if(w.onChangeDateTime&&e.isFunction(w.onChangeDateTime)){var a=M.data("input");w.onChangeDateTime.call(M,E.currentTime,a,t);delete w.value;a.trigger("change")}}).on("generate.xdsoft",function(){if(w.onGenerate&&e.isFunction(w.onGenerate)){w.onGenerate.call(M,E.currentTime,M.data("input"))}if(I){M.trigger("afterOpen.xdsoft");I=false}}).on("click.xdsoft",function(e){e.stopPropagation()});j=0;L=function(){var t=M.data("input").offset(),a=t.top+M.data("input")[0].offsetHeight-1,r=t.left,n="absolute";if(w.fixed){a-=e(window).scrollTop();
r-=e(window).scrollLeft();n="fixed"}else{if(a+M[0].offsetHeight>e(window).height()+e(window).scrollTop()){a=t.top-M[0].offsetHeight+1}if(a<0){a=0}if(r+M[0].offsetWidth>e(window).width()){r=e(window).width()-M[0].offsetWidth}}M.css({left:r,top:a,position:n})};M.on("open.xdsoft",function(t){var a=true;if(w.onShow&&e.isFunction(w.onShow)){a=w.onShow.call(M,E.currentTime,M.data("input"),t)}if(a!==false){M.show();L();e(window).off("resize.xdsoft",L).on("resize.xdsoft",L);if(w.closeOnWithoutClick){e([document.body,window]).on("mousedown.xdsoft",function r(){M.trigger("close.xdsoft");e([document.body,window]).off("mousedown.xdsoft",r)})}}}).on("close.xdsoft",function(t){var a=true;_.find(".xdsoft_month,.xdsoft_year").find(".xdsoft_select").hide();if(w.onClose&&e.isFunction(w.onClose)){a=w.onClose.call(M,E.currentTime,M.data("input"),t)}if(a!==false&&!w.opened&&!w.inline){M.hide()}t.stopPropagation()}).on("toggle.xdsoft",function(e){if(M.is(":visible")){M.trigger("close.xdsoft")}else{M.trigger("open.xdsoft")}}).data("input",t);B=0;R=0;M.data("xdsoft_datetime",E);M.setOptions(w);function V(){var e=false,a;if(w.startDate){e=E.strToDate(w.startDate)}else{e=w.value||(t&&t.val&&t.val()?t.val():"");if(e){e=E.strToDateTime(e)}else if(w.defaultDate){e=E.strToDate(w.defaultDate);if(w.defaultTime){a=E.strtotime(w.defaultTime);e.setHours(a.getHours());e.setMinutes(a.getMinutes())}}}if(e&&E.isValidDate(e)){M.data("changed",true)}else{e=""}return e||0}E.setCurrentTime(V());t.data("xdsoft_datetimepicker",M).on("open.xdsoft focusin.xdsoft mousedown.xdsoft",function(e){if(t.is(":disabled")||t.data("xdsoft_datetimepicker").is(":visible")&&w.closeOnInputClick){return}clearTimeout(B);B=setTimeout(function(){if(t.is(":disabled")){return}I=true;E.setCurrentTime(V());M.trigger("open.xdsoft")},100)}).on("keydown.xdsoft",function(t){var a=this.value,r,n=t.which;if([l].indexOf(n)!==-1&&w.enterLikeTab){r=e("input:visible,textarea:visible");M.trigger("close.xdsoft");r.eq(r.index(this)+1).focus();return false}if([p].indexOf(n)!==-1){M.trigger("close.xdsoft");return true}})};O=function(t){var a=t.data("xdsoft_datetimepicker");if(a){a.data("xdsoft_datetime",null);a.remove();t.data("xdsoft_datetimepicker",null).off(".xdsoft");e(window).off("resize.xdsoft");e([window,document.body]).off("mousedown.xdsoft");if(t.unmousewheel){t.unmousewheel()}}};e(document).off("keydown.xdsoftctrl keyup.xdsoftctrl").on("keydown.xdsoftctrl",function(e){if(e.keyCode===o){k=true}}).on("keyup.xdsoftctrl",function(e){if(e.keyCode===o){k=false}});return this.each(function(){var t=e(this).data("xdsoft_datetimepicker");if(t){if(e.type(a)==="string"){switch(a){case"show":e(this).select().focus();t.trigger("open.xdsoft");break;case"hide":t.trigger("close.xdsoft");break;case"toggle":t.trigger("toggle.xdsoft");break;case"destroy":O(e(this));break;case"reset":this.value=this.defaultValue;if(!this.value||!t.data("xdsoft_datetime").isValidDate(Date.parseDate(this.value,w.format))){t.data("changed",false)}t.data("xdsoft_datetime").setCurrentTime(this.value);break;case"validate":var r=t.data("input");r.trigger("blur.xdsoft");break}}else{t.setOptions(a)}return 0}if(e.type(a)!=="string"){if(!w.lazyInit||w.open||w.inline){S(e(this))}else{_(e(this))}}})};e.fn.datetimepicker.defaults=t}(jQuery);!function(){!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?module.exports=e:e(jQuery)}(function(e){function t(t){var s=t||window.event,o=u.call(arguments,1),l=0,d=0,c=0,m=0,h=0,g=0;if(t=e.event.fix(s),t.type="mousewheel","detail"in s&&(c=-1*s.detail),"wheelDelta"in s&&(c=s.wheelDelta),"wheelDeltaY"in s&&(c=s.wheelDeltaY),"wheelDeltaX"in s&&(d=-1*s.wheelDeltaX),"axis"in s&&s.axis===s.HORIZONTAL_AXIS&&(d=-1*c,c=0),l=0===c?d:c,"deltaY"in s&&(c=-1*s.deltaY,l=c),"deltaX"in s&&(d=s.deltaX,0===c&&(l=-1*d)),0!==c||0!==d){if(1===s.deltaMode){var p=e.data(this,"mousewheel-line-height");l*=p,c*=p,d*=p}else if(2===s.deltaMode){var x=e.data(this,"mousewheel-page-height");l*=x,c*=x,d*=x}if(m=Math.max(Math.abs(c),Math.abs(d)),(!i||i>m)&&(i=m,r(s,m)&&(i/=40)),r(s,m)&&(l/=40,d/=40,c/=40),l=Math[l>=1?"floor":"ceil"](l/i),d=Math[d>=1?"floor":"ceil"](d/i),c=Math[c>=1?"floor":"ceil"](c/i),f.settings.normalizeOffset&&this.getBoundingClientRect){var v=this.getBoundingClientRect();h=t.clientX-v.left,g=t.clientY-v.top}return t.deltaX=d,t.deltaY=c,t.deltaFactor=i,t.offsetX=h,t.offsetY=g,t.deltaMode=0,o.unshift(t,l,d,c),n&&clearTimeout(n),n=setTimeout(a,200),(e.event.dispatch||e.event.handle).apply(this,o)}}function a(){i=null}function r(e,t){return f.settings.adjustOldDeltas&&"mousewheel"===e.type&&t%120===0}var n,i,s=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],o="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],u=Array.prototype.slice;if(e.event.fixHooks)for(var l=s.length;l;)e.event.fixHooks[s[--l]]=e.event.mouseHooks;var f=e.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var a=o.length;a;)this.addEventListener(o[--a],t,!1);else this.onmousewheel=t;e.data(this,"mousewheel-line-height",f.getLineHeight(this)),e.data(this,"mousewheel-page-height",f.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var a=o.length;a;)this.removeEventListener(o[--a],t,!1);else this.onmousewheel=null;e.removeData(this,"mousewheel-line-height"),e.removeData(this,"mousewheel-page-height")},getLineHeight:function(t){var a=e(t),r=a["offsetParent"in e.fn?"offsetParent":"parent"]();return r.length||(r=e("body")),parseInt(r.css("fontSize"),10)||parseInt(a.css("fontSize"),10)||16},getPageHeight:function(t){return e(t).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};e.fn.extend({mousewheel:function(e){return e?this.bind("mousewheel",e):this.trigger("mousewheel")},unmousewheel:function(e){return this.unbind("mousewheel",e)}})});Date.parseFunctions={count:0};Date.parseRegexes=[];Date.formatFunctions={count:0};Date.prototype.dateFormat=function(e){if(e=="unixtime"){return parseInt(this.getTime()/1e3)}if(Date.formatFunctions[e]==null){Date.createNewFormat(e)}var t=Date.formatFunctions[e];return this[t]()};Date.createNewFormat=function(format){var funcName="format"+Date.formatFunctions.count++;Date.formatFunctions[format]=funcName;var codePrefix="Date.prototype."+funcName+" = function() {return ";var code="";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true}else{if(special){special=false;code+="'"+String.escape(ch)+"' + "}else{code+=Date.getFormatCode(ch)}}}if(code.length==0){code='""'}else{code=code.substring(0,code.length-3)}eval(codePrefix+code+";}")};Date.getFormatCode=function(e){switch(e){case"d":return"String.leftPad(this.getDate(), 2, '0') + ";case"D":return"Date.dayNames[this.getDay()].substring(0, 3) + ";case"j":return"this.getDate() + ";case"l":return"Date.dayNames[this.getDay()] + ";case"S":return"this.getSuffix() + ";case"w":return"this.getDay() + ";case"z":return"this.getDayOfYear() + ";case"W":return"this.getWeekOfYear() + ";case"F":return"Date.monthNames[this.getMonth()] + ";case"m":return"String.leftPad(this.getMonth() + 1, 2, '0') + ";case"M":return"Date.monthNames[this.getMonth()].substring(0, 3) + ";case"n":return"(this.getMonth() + 1) + ";case"t":return"this.getDaysInMonth() + ";case"L":return"(this.isLeapYear() ? 1 : 0) + ";case"Y":return"this.getFullYear() + ";case"y":return"('' + this.getFullYear()).substring(2, 4) + ";case"a":return"(this.getHours() < 12 ? 'am' : 'pm') + ";case"A":return"(this.getHours() < 12 ? 'AM' : 'PM') + ";case"g":return"((this.getHours() %12) ? this.getHours() % 12 : 12) + ";case"G":return"this.getHours() + ";case"h":return"String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";case"H":return"String.leftPad(this.getHours(), 2, '0') + ";case"i":return"String.leftPad(this.getMinutes(), 2, '0') + ";case"s":return"String.leftPad(this.getSeconds(), 2, '0') + ";case"O":return"this.getGMTOffset() + ";case"T":return"this.getTimezone() + ";case"Z":return"(this.getTimezoneOffset() * -60) + ";default:return"'"+String.escape(e)+"' + "}};Date.parseDate=function(e,t){if(t=="unixtime"){return new Date(!isNaN(parseInt(e))?parseInt(e)*1e3:0)}if(Date.parseFunctions[t]==null){Date.createParser(t)}var a=Date.parseFunctions[t];return Date[a](e)};Date.createParser=function(format){var funcName="parse"+Date.parseFunctions.count++;var regexNum=Date.parseRegexes.length;var currentGroup=1;Date.parseFunctions[format]=funcName;var code="Date."+funcName+" = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes["+regexNum+"]);\nif (results && results.length > 0) {";var regex="";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true}else{if(special){special=false;regex+=String.escape(ch)}else{obj=Date.formatCodeToRegex(ch,currentGroup);currentGroup+=obj.g;regex+=obj.s;if(obj.g&&obj.c){code+=obj.c}}}}code+="if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";code+="if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";Date.parseRegexes[regexNum]=new RegExp("^"+regex+"$");eval(code)};Date.formatCodeToRegex=function(e,t){switch(e){case"D":return{g:0,c:null,s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};case"j":case"d":return{g:1,c:"d = parseInt(results["+t+"], 10);\n",s:"(\\d{1,2})"};case"l":return{g:0,c:null,s:"(?:"+Date.dayNames.join("|")+")"};case"S":return{g:0,c:null,s:"(?:st|nd|rd|th)"};case"w":return{g:0,c:null,s:"\\d"};case"z":return{g:1,c:"z = parseInt(results["+t+"], 10);\n",s:"(\\d{1,3})"};case"W":return{g:0,c:null,s:"(?:\\d{2})"};case"F":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+t+"].substring(0, 3)], 10);\n",s:"("+Date.monthNames.join("|")+")"};case"M":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+t+"]], 10);\n",s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"};case"n":case"m":return{g:1,c:"m = parseInt(results["+t+"], 10) - 1;\n",s:"(\\d{1,2})"};case"t":return{g:0,c:null,s:"\\d{1,2}"};case"L":return{g:0,c:null,s:"(?:1|0)"};case"Y":return{g:1,c:"y = parseInt(results["+t+"], 10);\n",s:"(\\d{4})"};case"y":return{g:1,c:"var ty = parseInt(results["+t+"], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",s:"(\\d{1,2})"};case"a":return{g:1,c:"if (results["+t+"] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(am|pm)"};case"A":return{g:1,c:"if (results["+t+"] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(AM|PM)"};case"g":case"G":case"h":case"H":return{g:1,c:"h = parseInt(results["+t+"], 10);\n",s:"(\\d{1,2})"};case"i":return{g:1,c:"i = parseInt(results["+t+"], 10);\n",s:"(\\d{2})"};case"s":return{g:1,c:"s = parseInt(results["+t+"], 10);\n",s:"(\\d{2})"};case"O":return{g:0,c:null,s:"[+-]\\d{4}"};case"T":return{g:0,c:null,s:"[A-Z]{3}"};case"Z":return{g:0,c:null,s:"[+-]\\d{1,5}"};default:return{g:0,c:null,s:String.escape(e)}}};Date.prototype.getTimezone=function(){return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/,"$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/,"$1$2$3")};Date.prototype.getGMTOffset=function(){return(this.getTimezoneOffset()>0?"-":"+")+String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset())/60),2,"0")+String.leftPad(Math.abs(this.getTimezoneOffset())%60,2,"0")};Date.prototype.getDayOfYear=function(){var e=0;Date.daysInMonth[1]=this.isLeapYear()?29:28;for(var t=0;t<this.getMonth();++t){e+=Date.daysInMonth[t]}return e+this.getDate()};Date.prototype.getWeekOfYear=function(){var e=this.getDayOfYear()+(4-this.getDay());var t=new Date(this.getFullYear(),0,1);var a=7-t.getDay()+4;return String.leftPad(Math.ceil((e-a)/7)+1,2,"0")};Date.prototype.isLeapYear=function(){var e=this.getFullYear();return(e&3)==0&&(e%100||e%400==0&&e)};Date.prototype.getFirstDayOfMonth=function(){var e=(this.getDay()-(this.getDate()-1))%7;return e<0?e+7:e};Date.prototype.getLastDayOfMonth=function(){var e=(this.getDay()+(Date.daysInMonth[this.getMonth()]-this.getDate()))%7;return e<0?e+7:e};Date.prototype.getDaysInMonth=function(){Date.daysInMonth[1]=this.isLeapYear()?29:28;return Date.daysInMonth[this.getMonth()]};Date.prototype.getSuffix=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th"}};String.escape=function(e){return e.replace(/('|\\)/g,"\\$1")};String.leftPad=function(e,t,a){var r=new String(e);if(a==null){a=" "}while(r.length<t){r=a+r}return r};Date.daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];Date.monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];Date.dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];Date.y2kYear=50;Date.monthNumbers={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};Date.patterns={ISO8601LongPattern:"Y-m-d H:i:s",ISO8601ShortPattern:"Y-m-d",ShortDatePattern:"n/j/Y",LongDatePattern:"l, F d, Y",FullDateTimePattern:"l, F d, Y g:i:s A",MonthDayPattern:"F d",ShortTimePattern:"g:i A",LongTimePattern:"g:i:s A",SortableDateTimePattern:"Y-m-d\\TH:i:s",UniversalSortableDateTimePattern:"Y-m-d H:i:sO",YearMonthPattern:"F, Y"}}();
/* Copyright (c) 2010-2013 Marcus Westin */
"use strict";(function(e,t){typeof define=="function"&&define.amd?define([],t):typeof exports=="object"?module.exports=t():e.store=t()})(this,function(){function o(){try{return r in t&&t[r]}catch(e){return!1}}var e={},t=window,n=t.document,r="localStorage",i="script",s;e.disabled=!1,e.version="1.3.17",e.set=function(e,t){},e.get=function(e,t){},e.has=function(t){return e.get(t)!==undefined},e.remove=function(e){},e.clear=function(){},e.transact=function(t,n,r){r==null&&(r=n,n=null),n==null&&(n={});var i=e.get(t,n);r(i),e.set(t,i)},e.getAll=function(){},e.forEach=function(){},e.serialize=function(e){return JSON.stringify(e)},e.deserialize=function(e){if(typeof e!="string")return undefined;try{return JSON.parse(e)}catch(t){return e||undefined}};if(o())s=t[r],e.set=function(t,n){return n===undefined?e.remove(t):(s.setItem(t,e.serialize(n)),n)},e.get=function(t,n){var r=e.deserialize(s.getItem(t));return r===undefined?n:r},e.remove=function(e){s.removeItem(e)},e.clear=function(){s.clear()},e.getAll=function(){var t={};return e.forEach(function(e,n){t[e]=n}),t},e.forEach=function(t){for(var n=0;n<s.length;n++){var r=s.key(n);t(r,e.get(r))}};else if(n.documentElement.addBehavior){var u,a;try{a=new ActiveXObject("htmlfile"),a.open(),a.write("<"+i+">document.w=window</"+i+'><iframe src="/favicon.ico"></iframe>'),a.close(),u=a.w.frames[0].document,s=u.createElement("div")}catch(f){s=n.createElement("div"),u=n.body}var l=function(t){return function(){var n=Array.prototype.slice.call(arguments,0);n.unshift(s),u.appendChild(s),s.addBehavior("#default#userData"),s.load(r);var i=t.apply(e,n);return u.removeChild(s),i}},c=new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g"),h=function(e){return e.replace(/^d/,"___$&").replace(c,"___")};e.set=l(function(t,n,i){return n=h(n),i===undefined?e.remove(n):(t.setAttribute(n,e.serialize(i)),t.save(r),i)}),e.get=l(function(t,n,r){n=h(n);var i=e.deserialize(t.getAttribute(n));return i===undefined?r:i}),e.remove=l(function(e,t){t=h(t),e.removeAttribute(t),e.save(r)}),e.clear=l(function(e){var t=e.XMLDocument.documentElement.attributes;e.load(r);while(t.length)e.removeAttribute(t[0].name);e.save(r)}),e.getAll=function(t){var n={};return e.forEach(function(e,t){n[e]=t}),n},e.forEach=l(function(t,n){var r=t.XMLDocument.documentElement.attributes;for(var i=0,s;s=r[i];++i)n(s.name,e.deserialize(t.getAttribute(s.name)))})}try{var p="__storejs__";e.set(p,p),e.get(p)!=p&&(e.disabled=!0),e.remove(p)}catch(f){e.disabled=!0}return e.enabled=!e.disabled,e})
/**
 * Cascading
 **/
var twd_cascade_req, twd_cascade_node, twd_cascade_cache = {};
function twd_cascading_onchange(ctrl, ajaxurl, extra, idextra)
{
    if(twd_cascade_cache[ctrl.id][ctrl.value])
        return twd_cascade_apply(ctrl, twd_cascade_cache[ctrl.id][ctrl.value]);
    if(twd_cascade_req)
    {
        alert('A cascade is already in progress; please let it complete before making another.');
        return;
    }
    twd_cascade_node = ctrl;
    if(window.ActiveXObject)
        twd_cascade_req = new ActiveXObject("Microsoft.XMLHTTP");
    else
        twd_cascade_req = new XMLHttpRequest();
    twd_cascade_req.onreadystatechange = twd_cascade_response;
    twd_cascade_req.open("POST", ajaxurl, true);
    twd_cascade_req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    var msg = "value=" + escape(ctrl.value);
    for(i in extra)
        msg = msg + '&' + extra[i] + '=' + escape(twd_find_node(ctrl, extra[i]).value);
    for(i in idextra)
        msg = msg + '&' + idextra[i] + '=' + escape(document.getElementById(idextra[i]).value);
    twd_cascade_req.send(msg);
}

function twd_cascade_response()
{
    if(twd_cascade_req.readyState != 4) return;
    if(twd_cascade_req.status != 200)
    {
        twd_cascade_req = null;
        alert('Server error processing request');
        return;
    }
    var data = eval('x=' + twd_cascade_req.responseText);
    twd_cascade_req = null;
    twd_cascade_apply(twd_cascade_node, data);
}

function twd_cascade_apply(node, data)
{
    for(var n in data)
    {
        var x = twd_find_node(node, n);
        if(x)
        {
            if(x.className == "ajaxlookup_hidden")
            {
                var entry = document.getElementById(x.id + '_entry');
                entry.value = data[n]['value'];
                twd_set_id(entry, data[n]['id']);
                twd_set_style(entry, 1);
                if(x.onchange) x.onchange();
            }
            else if((x.tagName == "SELECT") && (data[n].constructor.toString().indexOf("Array") != -1))
            {
                x.options.length = 0;
                for(var i = 0; i < data[n].length; i++)
                {
                    if (data[n][i].constructor.toString().indexOf("Array") != -1)
                        x.options[i] = new Option(data[n][i][1], data[n][i][0]);
                    else
                        x.options[i] = new Option(data[n][i], data[n][i]);
                }
            }
            else if(x.tagName == "SPAN")
                x.innerHTML = data[n];
            else
                x.value = data[n] ? data[n] : '';
        }
    }
}


/**
 * Hiding
 **/
var twd_mapping_store = {};
function twd_hiding_onchange(ctrl)
{
    var cont = document.getElementById(ctrl.id+'.container');
    var is_vis = cont ? cont.style.display != 'none' : 1;
    var mapping = twd_mapping_store[ctrl.id];
    var stem = twd_find_stem(ctrl.id) + '_';

    // Determine the selected value(s)
    var values = [];
    if(ctrl.tagName == 'INPUT' || ctrl.tagName == 'SELECT' || ctrl.tagName == 'TEXTAREA')
        values = [ctrl.type == 'checkbox' ? ctrl.checked : ctrl.value];
    else
        for(var i=0;; i++)
        {
            var cb = document.getElementById(ctrl.id+"_"+i);
            if(!cb) break;
            if(cb.checked)
                values[values.length] = cb.value;
        }

    // Determine all the dependent controls that are visible
    var a, b;
    var visible = {};
    if(is_vis)
        for(a in mapping)
        {
            var match = 0;
            for(b in values)
                if(a == values[b])
                    match = 1;
            if(match)
                for(b in mapping[a])
                    visible[mapping[a][b]] = 1;
        }

    // Set the visibility for all dependent controls, where this has changed
    for(a in mapping)
        for(b in mapping[a])
        {
            var display = visible[mapping[a][b]] ? '' : 'none';
            var x = document.getElementById(stem+mapping[a][b]+'.container');
            if(x.style.display != display)
            {
                x.style.display = display;
                var x = document.getElementById(stem+mapping[a][b]);
                if(x && x.id && twd_mapping_store[x.id])
                    twd_hiding_onchange(x);
            }
        }
}

function twd_hiding_listitem_onchange(ctrl)
{
    twd_hiding_onchange(document.getElementById(
            ctrl.id.substr(0, ctrl.id.lastIndexOf('_'))));
}

function twd_showhide(ctrl, ajaxurl, value_sibling, url_base)
{
    var show = ctrl.src.indexOf('/show') > -1;
    var over = ctrl.src.indexOf('-hover.png') > -1;
    for(var i = 1; 1; i++)
    {
        var node = document.getElementById(ctrl.id + '_' + i);
        if(!node) break;
        node.style.display = show ? '' : 'none';
    }
    if(i == 1 && show && ajaxurl)
    {
        twd_url_base = url_base;
        twd_showhide_ajaxreq(ctrl, ajaxurl, value_sibling);
    }
    ctrl.src = url_base + (show ? '/hide' : '/show') + (over ? '-hover.png' : '.png');
}

function twd_showhide_over(ctrl, url_base)
{
    ctrl.src = url_base + (ctrl.src.indexOf('/show') > -1? '/show-hover.png' : '/hide-hover.png');
}
function twd_showhide_out(ctrl, url_base)
{
    ctrl.src = url_base + (ctrl.src.indexOf('/show') > -1? '/show.png' : '/hide.png');
}

var twd_proc_req = null;
function twd_showhide_ajaxreq(ctrl, ajaxurl, value_sibling)
{
    if(twd_proc_req)
    {
        alert('A server request is already in progress; please let it complete before making another.');
        return;
    }
    twd_popup_node = ctrl;
    if(window.ActiveXObject)
        twd_proc_req = new ActiveXObject("Microsoft.XMLHTTP");
    else
        twd_proc_req = new XMLHttpRequest();
    twd_proc_req.onreadystatechange = twd_showhide_ajaxcb;
    twd_proc_req.open("POST", ajaxurl, true);
    twd_proc_req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    value = value_sibling ? twd_find_node(ctrl, value_sibling).value : '';
    twd_proc_req.send("value="+value);
}

function twd_showhide_ajaxcb()
{
    if(twd_proc_req.readyState != 4) return;
    if(twd_proc_req.status != 200)
    {
        twd_proc_req = null;
        alert('Server error processing request');
        return;
    }
    twd_popup_elem = document.createElement('TR');
    twd_popup_elem.id = twd_popup_node.id + '_1';
    twd_popup_elem.appendChild(document.createElement('TD'));
    twd_popup_elem.firstChild.colSpan = 10; // This should be wide enough to cover all tables in practice
    twd_popup_elem.firstChild.innerHTML = twd_proc_req.responseText;

    var tr_node = twd_popup_node;
    while(tr_node.tagName != 'TR')
        tr_node = tr_node.parentNode;
    tr_node.parentNode.insertBefore(twd_popup_elem, tr_node.nextSibling);

    var namer = document.getElementById(twd_popup_node.id + '_namer');
    var name_prefix = namer.name.substr(0, namer.name.lastIndexOf(".") + 1);
    var id_prefix = namer.id.substr(0, namer.id.lastIndexOf("_") + 1);
    var x = twd_get_all_nodes(twd_popup_elem);
    for(var i = 1; i < x.length; i++) // start at 1 to avoid rewriting the root node
    {
        if(x[i].id) x[i].id = id_prefix + x[i].id;
        if(x[i].name) x[i].name = name_prefix + x[i].name;
    }

    twd_popup_node.src = twd_url_base + '/hide.png';
    twd_proc_req = null;
}

/***
 * Growing
 **/
function twd_grow_add(ctrl, manual)
{
    var $ctrl = $(ctrl);
    var $growingTable = $ctrl.closest('table');
    // Find the id/name prefixes, and the next number in sequence
    if(manual)
    {
        var autogrow = 0;
        var id = $ctrl.closest('tr').prev().attr('id');
        if (id) {
            var idprefix = id.substring(0, id.lastIndexOf('_grow-'));
        } else {
            var idprefix = $growingTable.attr('name');
        }
    }
    else if(ctrl.id.indexOf('_grow-') > -1)
    {
        // autogrow
        var autogrow = 1;
        var idprefix = ctrl.id.substring(0, ctrl.id.lastIndexOf('_grow-'));
    }
    else
    {
        // button grow
        var autogrow = 0;
        var idprefix = ctrl.id.substring(0, ctrl.id.lastIndexOf('_add'));
    }

    var node = $growingTable.find('#' + idprefix + '_repeater')[0].firstChild;
    var lastnode = null;
    while(node)
    {
        if(node.id && node.id.indexOf(idprefix + '_grow-') == 0)
            lastnode = node;
        node = node.nextSibling;
    }
    var number = lastnode ? parseInt(lastnode.id.substr(idprefix.length + 6)) + 1 : 0;

    // Only autogrow if we are the last row
    if(autogrow && parseInt(ctrl.id.substr(idprefix.length + 6)) != number-1 && !manual)
        return;

    // Clone the spare element; update id and name attributes; include in page
    var old_elem = $growingTable.next().find('#' + idprefix + '_spare')[0];
    var elem = old_elem.cloneNode(true);
    var id_stemlen = idprefix.length + 6;
    var new_id_prefix = idprefix + '_grow-' + number;
    var x = twd_get_all_nodes(elem);
    var calendars = [];
    for(var i = 0; i < x.length; i++)
    {
        if(x[i].id)
        {
            x[i].id = new_id_prefix + x[i].id.substr(id_stemlen);
            if(x[i].id.substr(x[i].id.length - 8) == '_trigger')
                calendars[calendars.length] = x[i].id.substr(0, x[i].id.length - 8);
        }
        if(x[i].tagName == 'LEGEND') x[i].innerHTML = x[i].innerHTML.replace('$$', number+1);
    }
    $growingTable.find('#' + idprefix + '_repeater tr:last').prev().after(elem);

    // Make the delete button visible, and any HidingButton widgets
    if(autogrow || manual)
    {
        var del = $growingTable.find('#' + idprefix + '_grow-' + number + '_del')[0];
        if(del) del.style.display = '';
        var x = twd_get_all_nodes($growingTable.find('#' + idprefix + '_grow-' + number)[0]);
        for(var i = 0; i < x.length; i++)
            if(x[i].tagName == 'IMG' && x[i].src.indexOf('/show.png')) x[i].style.display = '';
    }

    // Clone any stored mappings for hiding fields
    for(id in twd_mapping_store)
        if(id.indexOf(idprefix + '_spare') == 0)
            twd_mapping_store[new_id_prefix + id.substr(id_stemlen)] = twd_mapping_store[id];

    var empty_input = $growingTable.find('#' + idprefix + '_grow-' + number + '_empty')[0];
    empty_input.value = 'full';

    load(['jquery.tablednd.js'], function(){
       $('.growingTable').each(function(index, ths) {
          var last_tr = $(ths).find('tr:last').prev();
          // init tableDnD
          last_tr.find('td:last').addClass('dragHandle').css('cursor', 'move');
          $(ths).tableDnD({dragHandle:'.dragHandle'});
          // init select2
          last_tr.find('span.select2-container').addClass('hidden');
          var select = last_tr.find('select[class^="select2"]');
          var allow_input = $(select).attr('data-allow-input');
          if (allow_input === undefined) {
              allow_input = false;
          } else {
              allow_input = eval(allow_input.toLowerCase());
          }
          initSelect2($(select), allow_input);
          // change node
          last_tr.find('[data-node^="node-"]').each(function(index, ths) {
              var node = 'node-' + Math.random();
              $(ths).data('node', node).attr('data-node', node);
          });
          last_tr.find('[input.swfUpload').each(function(index, ths) {
              $(ths).val(this.id);
          });
          $.getScript(cacheURL('flash-upload.js'));
       });
    });
    // init calendars
    dateTimePickerInit();
}

var twd_grow_undo_data = {};
function twd_grow_del(ctrl)
{
    var $growingTable = $(ctrl).closest('table');

    var idprefix = ctrl.id.substring(0, ctrl.id.lastIndexOf('_grow-'));
    var rowid = ctrl.id.substring(0, ctrl.id.indexOf('_', idprefix.length+6));

    /* 低版本浏览器不支持删除后恢复 */
    if (typeof(Worker) == 'undefined') {
        $('#' + rowid).remove();
        return;
    }

    if(!twd_grow_undo_data[idprefix]) twd_grow_undo_data[idprefix] = [];
    twd_grow_undo_data[idprefix].push(rowid);

    var tr = $growingTable.find('#' + rowid)[0];
    nodes = twd_get_all_nodes(tr);
    for(var i = 0; i < nodes.length; i++) {
        if(nodes[i].tagName == 'IMG' && nodes[i].src.indexOf('/hide.png') > -1)
            nodes[i].onclick();
    }
    tr.style.display = 'none';
    $growingTable.find('#' + idprefix + '_undo')[0].style.display = '';

    var empty_input = $growingTable.find('#' + rowid + '_empty')[0];
    empty_input.value = 'empty';
}

function twd_grow_undo(ctrl)
{
    var idprefix = ctrl.id.substring(0, ctrl.id.length-5);
    pop_idprefix = twd_grow_undo_data[idprefix].pop();

    document.getElementById(pop_idprefix).style.display = '';
    if(!twd_grow_undo_data[idprefix].length) ctrl.style.display = 'none';

    var empty_input = document.getElementById(pop_idprefix + '_empty');
    empty_input.value = 'full';
}

/**
 * Link container
 **/
function twd_link_onchange(ctrl)
{
    var visible = ctrl.style.display != 'none';
    var view = document.getElementById(ctrl.id + '_view')
    view.style.display = visible && ctrl.value ? '' : 'none';
}

function twd_link_view(ctrl, link, popup_options)
{
    var value = document.getElementById(ctrl.id.substr(0, ctrl.id.length-5)).value;
    window.open(link.replace(/\$/, value), '_blank', popup_options);
    return false;
}

/**
 * Utility functions
 **/
function twd_blank_deleted()
{
    for(var g in twd_grow_undo_data)
        for(var c in twd_grow_undo_data[g])
        {
            var x = twd_get_all_nodes(document.getElementById(twd_grow_undo_data[g][c]));
            for(var i = 0; i < x.length; i++)
                if(x[i].tagName == 'INPUT' || x[i].tagName == 'SELECT' || x[i].tagName == 'TEXTAREA')
                    x[i].value = '';
        }
}

function twd_get_all_nodes(elem)
{
    var ret = [elem];
    for(var node = elem.firstChild; node; node = node.nextSibling)
        ret = ret.concat(twd_get_all_nodes(node))
    return ret;
}

function twd_suppress_enter(evt) {
    var evt = (evt) ? evt : ((event) ? event : null);
    var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
    if (evt.keyCode == 13)  {return node.type == 'textarea';}
}

function twd_find_node(node, suffix)
{
    var prefix = node.id.substr(0, node.id.lastIndexOf("_") + (suffix ? 1 : 0));
    return document.getElementById(prefix + suffix);
}

function twd_no_multi_submit(ctrl)
{
    ctrl.disabled = 1;
    var form = twd_find_node(ctrl, '');
    if(form.onsubmit) form.onsubmit();
    form.submit();
    return false;
}

function twd_find_stem(ctrlid)
{
    var pos = ctrlid.lastIndexOf('_');
    if(pos == -1) return '';
    var stem = ctrlid.substr(0, pos);
    if(document.getElementById(stem))
        return stem;
    else
        return twd_find_stem(stem);
}

/**
 * Edo Assistant JavaScript SDK
 * @requires: jQuery
 * @requires: flensed.flXHR for cross-domain request
 * @date: 2014.08.12
 * @update: 2014.11.14
 */

(function(obj){
    function Assistant(options){
        var that = this;
        // Public attributes
        that.server = options.server;
        that.oc_server = options.oc_server;
        that.account = options.account || 'zopen';
        that.instance = options.instance || 'default';
        that.token = options.token;
        that.user = options.user;
        that.site = options.site;
        that.upload_server = options.upload_server;
        if(obj.location.protocol === 'https:'){
            that.assistant_server = 'https://localhost.easydo.cn:4997';
        }else{
            that.assistant_server = 'http://127.0.0.1:4999';
        }
        that.backup_server = 'http://127.0.0.1:4999';

        // 是否支持断点上传
        that.resumable = options.resumable || false;
        // 是否支持局域网加速下载
        that.lan_p2p = options.lan_p2p || false;

        // 需要的最低版本
        that.platform_mapping = {
            'windows': 'windows',
            'win32': 'windows',
            'win64': 'win64',
            'darwin': 'mac',
            'linux': 'linux',
            'linux2': 'linux',
            'unknown': 'windows'
        };
        // 这些 build 的自动升级功能有问题, 需要手动升级
        that.manual_upgrade_builds = [375, 430];
        var default_build = 5, default_version = 3;
        that.min_builds = options.min_builds || {};
        that.min_builds.windows = that.min_builds.windows || options.min_build || default_build;
        that.min_builds.rpm = that.min_builds.rpm || options.min_build || default_build;
        that.min_builds.deb = that.min_builds.deb || options.min_build || default_build;
        that.min_builds.mac = that.min_builds.mac || options.min_build || default_build;
        that.min_builds.sync_win_x64 = that.min_builds.sync_win_x64;
        that.version = that.version || options.version || default_version;
        var platform = navigator.platform.toLowerCase();
        if(platform.search('linux') !== -1){
            that.platform = 'linux';
        }else if(platform.search('mac') !== -1){
            that.platform = 'darwin';
        }else if(platform.search('win') !== -1){
            var _ua = navigator.userAgent.toLowerCase();
            if((_ua.search('win64') !== -1) || (_ua.search('x64') !== -1) || (_ua.search('wow64') !== -1)){
                that.platform = 'win64';
            }else{
                that.platform = 'win32';
            }
        }else{
            that.platform = 'unknown';
        }
        that.platform = that.platform_mapping[that.platform];

        that.min_build = that.min_builds[that.platform] || default_build;

        that.downloads = options.download;
        that.message_server = options.message_server || null;

        // 对低于特定版本的桌面助手，使用 Flash 跨域 + GET 方法，避免重复请求
        that.request_method = 'POST';
        that.use_native_cors = false;
        that.native_cors_devide = 70;
        // 提示启动的回调，在每次请求失败都会被触发
        if(typeof options.launch_prompt_callback === 'function'){
            that._fail_callback = options.launch_prompt_callback;
        }else{
            that._fail_callback = function(proxy){
                /**
                 * 当桌面助手服务器没有正确响应（可能是没有安装/启动）时调用。
                 * 显示一个遮罩提示。
                 */
                 $('\
                    <div id="bPopup-assistant-error" class="popup-container bPopup-assistant-error" width="600" height="400">\
                        <a class="modalCloseImg b-close" title="Close"></a>\
                        <div class="simplemodal-wrap">\
                            <h3>Please start Assistant to complete this operation</h3>\
                            <p>Assistant can assist you with uploading, downloading, editing and previewing files, as well as merging PDF documents and desktop notification.</p>\
                            <div class="clearfix" style="width: 90%;height:100%;margin-bottom:2em;padding:2em 2em  0 2em;">\
                                <div class="pull-left" style="width:44%;padding: 1em 1em 0 1em;">\
                                    <p>Already installed Assistant?</p>\
                                    <p><a href="edo-ast://start" class="button mini">Launch</a></p>\
                                    <p>You can find a shortcut to start Assistant in the Windows "Start" menu.</p>\
                                </div>\
                                <div class="pull-left" style="width:44%;padding:1em 0 2em 2em;border-left:solid 1px #aaa;">\
                                    <p><a class="button mini" href="'+ that.downloads[that.platform] +'" target="_blank">Download</a></p>\
                                    <div class="KSSShowHideArea">\
                                        <a class="KSSShowHideAction" href="javascript:void(0);">Other versions</a>\
                                        <div class="KSSShowHideTarget hidden">\
                                            <ul class="disc_ul">\
                                                <li><a href="'+ that.downloads.win64 +'" target="_blank">For Windows (64bit)</a></li>\
                                                <li><a href="'+ that.downloads.windows +'" target="_blank">For Windows (32bit)</a></li>\
                                                <li><a href="'+ that.downloads.mac +'" target="_blank">For Mac</a></li>\
                                            </ul>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                  ').bPopup({
                     modalClose:false,
                     follow:[false,false],
                     opacity:0.5,
                     closeClass:"b-close",
                     position:['auto','auto']
                 }, function(){
                     $('#bPopup-assistant-error').find('a:not(.b-close, .KSSShowHideAction)').click(function(e){
                         closeModal();
                         return true;
                     });
                 });
            };
        }
        // 路径选择的回调，在路径选择请求失败，并且有提供 fallback URL 的情况下触发
        if(typeof options.select_fail_callback === 'function'){
            that._modal_download = options.select_fail_callback;
        }else{
            that._modal_download = function(options){
                if(!options.url){ return false; }
                var url = options.url || null,
                    link_text = options.link_text || '直接下载',
                    button = '<a class="button active" href="'+url+'">'+link_text+'</a>';
                $('<div id="bPopup-assistant-modal" class="popup-container bPopup-assistant-modal" width="450" height="300"><a class="modalCloseImg b-close" title="Close"></a><div class="simplemodal-wrap"><h2>下载文件</h2><p>发现您没有<a href="javascript:void(0);" onclick="closeModal(); assistant._fail_callback(); return false;">启动桌面助手</a>，不能高速下载。您可以通过浏览器直接下载：</p><p>'+button+'</p></div></div>').bPopup({
                     modalClose:false,
                     follow:[false,false],
                     opacity:0.5,
                     closeClass:"b-close",
                     position:['auto','auto']
                 }, function(){
                     $('#bPopup-assistant-modal').find('a:not(.b-close)').click(function(e){
                         closeModal();
                         return true;
                     });
                 });
            };
        }
        // 消息提醒回调，在 ping 后发现桌面端没有此站点的消息提醒任务后触发
        if(typeof options.messaging_enabled_callback === 'function'){
            that._messaging_enabled = options.messaging_enabled_callback;
        }else{
            that._messaging_enabled = function(){
                message_float('桌面消息提醒已开启');
            };
        }

        // 手动升级的提示
        if(typeof options.manual_upgrade_callback === 'function'){
            that._manual_upgrade = options.manual_upgrade_callback;
        }else{
            that._manual_upgrade = function(o){
                var that = this;
                $('<div id="bPopup-assistant-mupgrade-modal" class="popup-container bPopup-assistant-modal" width="450" height="300"><a class="modalCloseImg b-close" title="Close"></a><div class="simplemodal-wrap"><h2>您的桌面助手需要升级</h2><div>发现一个新版本的桌面助手，需要升级</div><p><a class="button active" href="'+o.download_url+'">下载</a></p></div></div>').bPopup({
                    modalClose: false,
                    follow: [false, false],
                    opacity: 0.5,
                    closeClass: 'b-close',
                    position: ['auto', 'auto']
                }, function(){
                    $('#bPopup-assistant-mupgrade-modal').find('a:not(.b-close)').click(function(e){
                        closeModal();
                        return true;
                    });
                });
            };
        }

        // Private attributes
        that._scheme = 'edo-assistent://';
        that._callback_key = 'callback';
        that._url_mapping = {
            about: '/about',
            upgrade: '/worker/new/upgrade',
            threedpreview: '/worker/new/threedpreview',
            edit: '/worker/new/edit',
            view: '/worker/new/view',
            download: '/worker/new/download',
            upload: '/worker/new/upload',
            upload_v2: '/worker/new/upload_v2',
            sync: '/worker/new/sync',
            select_paths: '/ui/select_paths',
            select_paths_v2: '/v2/ui/select_paths',
            select_sync_folder: '/filestore/sync_paths',
            create_sync_folder: '/sync/ui_create',
            list_syncfolders: '/sync/list',
            edit_sync_folder: '/sync/ui_edit',
            sync_item_state: '/sync/ui_item_state',
            downloadpdf: '/worker/new/downloadpdf',
            mergepdfs: '/worker/new/mergepdfs',
            watermarkpdf: '/worker/new/watermarkpdf',
            messaging: '/worker/new/messaging',
            p2pdownload: '/worker/new/p2pdownload',
            new_webfolder: '/worker/new/new_webfolder',
            online_script: '/worker/new/online_script',
            call_script_sync: '/call_script_sync',
            install_sync_ast: '/worker/new/install_sync_ast',
            upgrade_sync_ast: '/worker/new/upgrade_sync_ast'
        };
        that.max_select_fail = 5;
        that.select_fail_count = 0;
        that.allow_script = false;
        that.support_site_connection = false;
    };

    Assistant.prototype._cors_ajax = function(options){
        options.error = options.error || this._fail_callback;
        var that = this,
            data = options.data || {},
            onsuccess = options.success || function(){},
            _onerror = options.error || function(){},
            oncomplete = options.complete || function(){},
            cache = options.cache || false,
            traditional = options.traditional || false,
            dataType = options.dataType || 'json',
            forceFlash = options.force_flash || false,
            timeout = options.timeout || 60 * 1000,
            getLocation = function(uri){ // http://stackoverflow.com/a/13405933
                var a = document.createElement('a');
                a.href = uri;
                if(a.host === ''){
                    a.href = a.href;
                }
                return a;
            },
            flash_cors, onerror;
            if(options.url.indexOf(that._url_mapping.select_paths_v2) > -1){
                onerror = function(){
                    if(assistant.select_fail_count > assistant.max_select_fail){
                        _onerror();
                        assistant.select_fail_count = 0;
                        if(typeof assistant.select_id !== 'undefined'){
                            clearInterval(assistant.select_id);
                            assistant.select_id = undefined;
                        }
                        return false;
                    }
                    // 第一次都失败，直接调用错误回调，不必重试
                    if(typeof assistant.select_id === 'undefined'){
                        _onerror();
                        assistant.select_fail_count = 0;
                        return false;
                    }
                    assistant.select_fail_count = assistant.select_fail_count + 1;
                }
            }else{
                onerror = _onerror;
            }
            flash_cors = function(){
                load(['flXHR/flXHR.js'], function(){
                    var backup_url = options.url.replace(assistant.assistant_server, assistant.backup_server),
                        location = getLocation(backup_url),
                        policy_uri = location.protocol + '//' + location.host + '/crossdomain.xml';
                    if(typeof flxhr_proxy === 'undefined'){
                        try{
                            flxhr_proxy = new flensed.flXHR({
                                xmlResponseText: dataType === 'xml',
                                loadPolicyURL: policy_uri,
                                noCacheHeader: !cache,
                                onerror: onerror,
                                ontimeout: onerror
                            });
                        }catch(e){
                            return onerror(e);
                        }
                    }else{
                        try{
                            flxhr_proxy.Reset();
                            flxhr_proxy.Configure({
                                xmlResponseText: dataType === 'xml',
                                loadPolicyURL: policy_uri,
                                // noCacheHeader: !cache, somehow this raises an error
                                onerror: onerror,
                                ontimeout: onerror
                            });
                        }catch(e){
                            return onerror(e);
                        }
                    }
                    try{
                        flxhr_proxy.open(options.method, backup_url);
                        flxhr_proxy.onreadystatechange = function(proxy){
                            if(proxy.readyState === 4){
                                try{
                                    if(dataType === 'json'){
                                        var result = JSON.parse(proxy.responseText);
                                    }else{
                                        var result = proxy.responseXML;
                                    }
                                    return onsuccess(result);
                                }catch(e){
                                    return onerror(e);
                                }
                            }
                        };
                        if(!cache){
                            data._nocache = Math.random();
                        }
                        flxhr_proxy.send($.param(data, traditional));
                    }catch(e){
                         return onerror(e);
                    }
                });
            };
        if(forceFlash){ return flash_cors(); }
        try{
            if(typeof XDomainRequest === 'undefined'){
                $.ajax({
                    cache: cache,
                    crossDomain: true,
                    data: data,
                    dataType: dataType,
                    method: options.method,
                    type: options.method,
                    success: onsuccess,
                    // ajax 跨域请求出错，转为 Flash 兼容模式
                    error: (window.location.protocol === 'https:')?(flash_cors):(onerror),
                    complete: oncomplete,
                    traditional: traditional,
                    url: options.url
                });
            }else{
                var xdr = new XDomainRequest();
                xdr.open(options.method, options.url);
                xdr.ontimeout = onerror;
                xdr.timeout = timeout;
                xdr.onerror = (window.location.protocol === 'https:')?(flash_cors):(onerror);
                xdr.onload = function(){
                    onsuccess(JSON.parse(xdr.responseText));
                }
                setTimeout(function(){
                    xdr.send($.param(data, traditional));
                }, 0);
            }
        }catch(e){
            onerror(e);
        }
    };

    Assistant.prototype._cors_supported = function(){
        var that = this;
        try{
            if('withCredentials' in new XMLHttpRequest()){
                return true;
            }else if(window.XDomainRequest){
                return true;
            }else{
                return false;
            }
        }catch(e){
            return false;
        }
    };

    Assistant.prototype.__downgrade_warning = function(info){
        var that = this;
        if(info.app_version <= that.version){
            window.console && console.info('Installed version: ', info.app_version, ', requested version: ', that.version);
            return
        }
        // `float_message()` is only in x-master & newer version, so we do
        // nothing here
        var this_ver = ''+that.version+'.'+that.min_build,
            installed_ver = ''+info.app_version+'.'+info.app_build;
        $().message(
            '此站点需要桌面助手'+
            this_ver+'，您安装了桌面助手'+
            installed_ver+
            '，您需要<a href="#" onclick="get_assistant()._fail_callback(); return false;">重新下载安装</a>，才能正常使用。',
            'warning'
        );
        window.console && console.info('Installed version: ', info.app_version, ', requested version: ', that.version);
    };

    Assistant.prototype.ping = function(options){
        var that = this;
        that.about({
            callback: function(info){
                if(!info.app_build){
                    // 很旧的版本（不太可能？）
                }else{
                    info.os_platform = that.platform_mapping[info.os_platform];
                    if(info.app_version){
                        try{
                            var app_version = parseInt(info.app_version);
                        }catch(e){
                            var app_version = 3;
                        }
                        info.app_version = app_version;
                        if(app_version > that.version){
                            // alert about downgrading
                            that.__downgrade_warning(info);
                        }
                    }
                    if(info.app_build >= that.native_cors_devide){
                        // 新版本使用 POST 方法
                        // 新版本无需显式触发升级

                        // HTTP 页面上与桌面助手通信可以使用原生跨域方式，HTTPS 页面上必须使用 Flash 中转
                        if(window.location.protocol === 'http:'){
                            that.use_native_cors = true;
                        }
                        // 是否是支持站点连接功能的版本？
                        if((typeof info.connection != 'undefined') || (typeof info.init_connection != 'undefined')){
                            that.support_site_connection = true;
                        }
                        if(that.support_site_connection){
                            // 首次创建站点连接并且开启了消息提醒，调用回调
                            if(info.connection && info.messaging && info.init_connection){
                                that._messaging_enabled();
                            }
                        }else{
                            // 对旧版本的桌面助手不要开启消息提醒
                            if(info.messaging === null){}
                        }
                    }else{
                        that.request_method = 'GET';
                        // 旧版本使用 Flash 跨域，使用 GET 方法
                    }
                    // 新版本需要显式触发升级
                    if(that.min_builds[info.os_platform] > info.app_build){
                        // 某些版本存在 bug，需要手动升级
                        if(that.manual_upgrade_builds.indexOf(info.app_build) != -1){
                            that._manual_upgrade({
                                download_url: that.downloads[that.platform]
                            });
                        }else{
                            // 可以自动升级
                            if(!info.disable_upgrade)
                            {
                                if(that.min_builds.win64){
                                    // 新版本使用在线软件包脚本来升级
                                    that.arch_upgrade({silent: true});
                                }else{
                                    that.upgrade({silent: true});
                                }
                            }
                        }
                    }
                }
                // 对于同步助手的判断
                // 如果sync_build_number为*, 用户不同意安装同步助手，则不需要进行判断
                // ping 时只处理同步助手的升级，安装的入口在用户点击"桌面同步"并实际使用该功能时时
                if (info.sync_build_number != "*")
                {
                    // 如果站点的同步助手包大于本地的同步助手build版本
                    // 站点上的同步助手版本的build号最低为1，本地同步助手的build号最低为0(未安装)
                    if(that.min_builds[info.sync_system_info] > info.sync_build_number)
                    {
                        if(info.sync_build_number != 0)
                        {
                            // 升级
                            that.upgrade_sync_ast();
                        }
                    }
                }
            }
        });
    };

    Assistant.prototype.about = function(options){
        var that = this,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            error_callback = (typeof options.error === 'function')?(options.error):(function(){});
        if(typeof callback !== 'function'){
            callback = function(info){
                try{
                    console.info(info);
                }catch(e){};
            };
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.about,
            data: {
                server: that.server,
                oc_server: that.oc_server,
                message_server: that.message_server || '',
                account: that.account,
                instance: that.instance,
                instance_name: that.site.name,
                instance_url: that.site.url,
                username: that.user.name,
                pid: that.user.id,
                token: that.token,
                silent: '1',
                notification: '1'  // 新版本默认打开消息提醒
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            // Disable default error popup
            error: error_callback
        });
    };

    Assistant.prototype.upgrade = function(options){
        var that = this,
            silent = options.silent || false;
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.upgrade,
            data: {
                server: that.server,
                oc_server: that.oc_server,
                account: that.account,
                instance: that.instance,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                token: that.token,
                silent: (silent)?('1'):('')
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: null,
            // Disable default error popup
            error: function(e){ return false; }
        });
    };
    Assistant.prototype.arch_upgrade = function(options){
        var that = this,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            silent = !!options.silent,
            data;
        data = {
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance,
            token: that.token,
            script_name: 'zopen.site_config:ast_arch_upgrade',
            args: JSON.stringify([that.server, that.account, that.instance, that.token]),
            kw: options.kw || '{}',
            version: '*',
            build_number: '*',
            onduplicate: 'ignore',
            _force_trust: true
        };
        if(silent){
            data.silent = '1';
        }

        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.online_script,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){ callback(r); },
            error: that._fail_callback
        });
    };
    Assistant.prototype.messaging = function(options){
        var that = this,
            enable = options.enable || false,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            data;
        data = {
            server: that.server,
            message_server: that.message_server || '',
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance,
            build_number: that.min_build,
            version: that.version,
            min_builds: JSON.stringify(that.min_builds),
            pid: that.user.id,
            username: that.user.name,
            instance_url: that.site.url,
            instance_name: that.site.name
        };
        // 如果支持站点连接，那么关闭消息提醒不再需要创建任务
        if(!enable){
            if(that.support_site_connection){
                return false;
            }
        }else{
            data.token = that.token;
        }
        if(that.allow_script){
            data.allow_script = 1;
        }
        if(options.enable_notification){
            data.enable_notification = 1;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.messaging,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){ callback(r); },
            error: that._fail_callback
        });
    };
    Assistant.prototype.online_script = function(options){
        var that = this,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            onduplicate = options.onduplicate,
            args, kw, data;
        if (options.args){
            args = (typeof options.args !== 'string') ? (JSON.stringify(options.args)) : (options.args);
        } else {
            args = '[]';
        }
        if (options.kw){
            kw = (typeof options.kw !== 'string') ? (JSON.stringify(options.kw)) : (options.kw);
        } else {
            kw = '{}';
        }
        data = {
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance,
            build_number: that.min_build,
            version: that.version,
            min_builds: JSON.stringify(that.min_builds),
            token: that.token,
            script_name: options.script_name,
            args: args,
            kw: kw
        };
        if (typeof onduplicate !== 'undefined'){
            data.onduplicate = onduplicate;
        }
        // Warning
        if(!!options._force_trust){
            data._force_trust = true;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.online_script,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){ callback(r); },
            error: that._fail_callback
        });
    };
    Assistant.prototype.call_script_sync = function(options){
        var that = this,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            args, kw, data;
        if (options.args){
            args = (typeof options.args !== 'string') ? (JSON.stringify(options.args)) : (options.args);
        } else {
            args = '[]';
        }
        if (options.kw){
            kw = (typeof options.kw !== 'string') ? (JSON.stringify(options.kw)) : (options.kw);
        } else {
            kw = '{}';
        }
        data = {
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance,
            build_number: that.min_build,
            version: that.version,
            min_builds: JSON.stringify(that.min_builds),
            token: that.token,
            script_name: options.script_name,
            args: args,
            kw: kw
        };
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.call_script_sync,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){ callback(r); },
            error: that._fail_callback
        });
    };
    Assistant.prototype.__url_failback = function(options){
        var that = this,
            fallback_url = options.url,
            fallback_text = options.text || '点击按钮下载这个文件',
            fallback_title = options.title || '点击下载',
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        if(!fallback_url){ return function(){}; }
        return function(){
            assistant._modal_download({
                title: fallback_title,
                url: fallback_url,
                text: options.fallback_text
            });
        };
    };
    Assistant.prototype.select_paths = function(options){
        var that = this,
            mode = options.mode,
            fallback_url = options.fallback_url || null,
            check_syncfolder = options.check_syncfolder || false,
            failback = that._fail_callback,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            data;
        // For IE, use .select_paths_v2()
        if(that._is_ie()){ return that.select_paths_v2(options); }
        if(fallback_url && (mode === 'folder')){
            failback = that.__url_failback({
                url: fallback_url
            });
        }
        data = {
            mode: mode,
            server: that.server,
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance
        };
        if(typeof options.system_folder !== 'undefined'){
            data.system_folder = options.system_folder;
        }
        if(check_syncfolder){
            data.check_syncfolder = check_syncfolder;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.select_paths,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){ callback(r.paths); },
            error: failback
        });
    };
    Assistant.prototype._is_ie = function(){
        // Detect wether we're running inside IE (<=11)
        var nav = navigator.userAgent.toLowerCase();
        return (nav.indexOf('msie') != -1) ? parseInt(nav.split('msie')[1]) : false;
    };
    Assistant.prototype.select_paths_v2 = function(options){
        /**
         * See http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-ajax-call
         * for detailed explanation on `callback`.
         */
        var that = this,
            mode = options.mode,
            fallback_url = options.fallback_url || null,
            failback = that._fail_callback,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            data;
        // For non-IE, use .select_paths()
        if(!that._is_ie()){ return that.select_paths(options); }
        if(fallback_url && (mode === 'folder')){
            failback = that.__url_failback({
                url: fallback_url
            });
        }
        if(assistant.select_fail_count > assistant.max_select_fail){
            if(typeof assistant.select_id !== 'undefined'){
                clearInterval(assistant.select_id);
                assistant.select_id = undefined;
            }
            assistant.select_fail_count = 0;
            return failback();
        }
        data = {
            mode: mode,
            server: that.server,
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance
        };
        if(typeof options.system_folder !== 'undefined'){
            data.system_folder = options.system_folder;
        }
        if(typeof options.check_syncfolder !=='undefined'){
            data.check_syncfolder = !!options.check_syncfolder;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.select_paths_v2,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){
                assistant.select_fail_count = 0;
                if(typeof r.paths === 'undefined'){
                    if(typeof assistant.select_id === 'undefined'){
                        assistant.select_id = setInterval(function(){
                            assistant.select_paths_v2(options);
                        }, 1000);
                    }
                    return false;
                }
                if(typeof assistant.select_id !== 'undefined'){
                    clearInterval(assistant.select_id);
                    assistant.select_id = undefined;
                }
                callback(r.paths);
            },
            error: failback
        });
    };
    Assistant.prototype.download = function(options){
        /**
         * uids: <Array> list of uids
         */
        var that = this,
            uids = options.uids,
            revisions = options.revisions || null,
            local_path = options.local_path,
            fallback_url = options.fallback_url || null,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            data, failback;
        if(fallback_url){
            failback = that.__url_failback({url: fallback_url});
        }else{
            failback = that._fail_callback;
        }
        data = {
            uid: uids,
            server: that.server,
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance,
            path: local_path,
            build_number: that.min_build,
            version: that.version,
            min_builds: JSON.stringify(that.min_builds),
            token: that.token,
            pid: that.user.id
        };
        if(!!revisions && revisions.length === uids.length){
            data.revisions = revisions;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.download,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: failback
        });
    };
    Assistant.prototype.p2pdownload = function(options){
        /**
         * uids: <Array> list of uids
         */
        var that = this,
            uids = options.uids,
            revisions = options.revisions || null,
            local_path = options.local_path,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            fallback_url = options.fallback_url || null,
            failback = null,
            data;
        if(!that.lan_p2p){ // 不支持局域网加速下载
            return false;
        }
        if(fallback_url){
            failback = that.__url_failback({
                url: fallback_url
            });
        }
        data = {
            uid: uids,
            server: that.server,
            oc_server: that.oc_server,
            account: that.account,
            instance: that.instance,
            path: local_path,
            build_number: that.min_build,
            version: that.version,
            min_builds: JSON.stringify(that.min_builds),
            token: that.token,
            pid: that.user.id
        };
        if(!!revisions && revisions.length === uids.length){
            data.revisions = revisions;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.p2pdownload,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: failback || that._fail_callback
        });
    };
    Assistant.prototype.upload_files_v2 = function(options){
        var that = this,
            folder_uid = options.folder_uid,
            local_files = options.local_files,
            setprivate = !!options.setprivate,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.upload_v2,
            data: {
                uid: folder_uid,
                server: that.server,
                oc_server: that.oc_server,
                account: that.account,
                instance: that.instance,
                path: local_files,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                token: that.token,
                pid: that.user.id,
                setprivate: setprivate,
                message_server: that.message_server || '',
                upload_server: options.upload_server || that.upload_server || ''
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };
    Assistant.prototype.upload_files = function(options){
        var that = this,
            folder_uid = options.folder_uid,
            local_files = options.local_files,
            resumable = that.resumable,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.upload,
            data: {
                uid: folder_uid,
                server: that.server,
                oc_server: that.oc_server,
                account: that.account,
                instance: that.instance,
                path: local_files,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                token: that.token,
                pid: that.user.id,
                resumable: (resumable)?(resumable):(''),
                message_server: that.message_server || '',
                upload_server: that.upload_server || null
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };
    Assistant.prototype.new_webfolder = function(options){
        var that = this,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.new_webfolder,
            data: {
                uid: options.folder_uid,
                folder_name: options.folder_name,
                oc_server: that.oc_server,
                account: that.account,
                instance: that.instance,
                build_number: that.min_build,
                min_builds: JSON.stringify(that.min_builds),
                version: that.version,
                token: that.token,
                pid: that.user.id
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };

    Assistant.prototype.select_sync_folder = function(options){
        var that = this,
            folder_uid = options.folder_uid,
            folder_path = options.folder_path,
            parents = options.parents,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.select_sync_folder,
            data: {
                server: that.server,
                oc_server: that.oc_server,
                instance: that.instance,
                account: that.account,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                uid: folder_uid,
                parents: JSON.stringify(parents || []),
                path: folder_path || ''
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){ callback(r.paths); },
            error: that._fail_callback
        });
    };

    Assistant.prototype.list_syncfolders = function(options){
        var that = this,
            current_site = !!options.current_site || true,
            data = {},
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        if (current_site) {
            data.oc_server = that.oc_server;
            data.account = that.account;
            data.instance = that.instance;
        } else {
            if (options.oc_server) {
                data.oc_server = options.oc_server;
            }
            if (options.account) {
                data.account = options.account;
            }
            if (options.instance) {
                data.instance = options.instance;
            }
        }
        if (typeof options.uid !== 'undefined') {
            data.uid = options.uid;
        }
        if (typeof options.server_path !== 'undefined') {
            data.server_path = options.server_path;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.list_syncfolders,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: function(r){ callback(r.sync_folders); },
            error: that._fail_callback
        });
    };

    Assistant.prototype.edit_sync_folder = function(options){
        var that = this,
            path = options.path,
			uid = options.uid,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.edit_sync_folder,
            data: {
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                server: that.server,
                oc_server: that.oc_server,
                instance: that.instance,
                account: that.account,
                path: path,
                token: that.token,
                uid: uid
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };

    Assistant.prototype.sync_item_state= function(options){
        var that = this,
            server_path = options.server_path,
            uid = options.uid,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.sync_item_state,
            data: {
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                server: that.server,
                oc_server: that.oc_server,
                instance: that.instance,
                account: that.account,
                server_path: server_path,
                uid: uid,
                token: that.token
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };
    Assistant.prototype.create_sync_folder = function(options){
        var that = this,
            folder_uid = options.folder_uid,
            folder_path = options.folder_path,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.create_sync_folder,
            data: {
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                server: that.server,
                oc_server: that.oc_server,
                instance: that.instance,
                account: that.account,
                uid: folder_uid,
                token: that.token,
                instance_url: that.site.url,
                instance_name: that.site.name,
                folder_path: folder_path,
                folder_name: options.folder_name || ''
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };

    Assistant.prototype.sync = function(options){
        var that = this,
            folder_uid = options.folder_uid,
            root_uid = options.root_uid,
            local_path = options.local_path,
            type = options.type,
            auto = (!!options.auto)?(options.auto):(''),
            interval = Number(options.interval) || (5 * 60),
            resumable = that.resumable,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){}),
            data = {
                uid: folder_uid,
                root_uid: root_uid || '',
                type: type || 'sync', // 默认双向同步
                server: that.server,
                oc_server: that.oc_server,
                account: that.account,
                instance: that.instance,
                path: local_path,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                token: that.token,
                pid: that.user.id,
                auto: auto,
                interval: interval,
                resumable: (resumable)?(resumable):('')
            };
        if(that.upload_server){
            data.upload_server = that.upload_server;
        }
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.sync,
            data: data,
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };
    Assistant.prototype.edit = function(options){
        var that = this,
            file_uid = options.file_uid,
            allow_cache = (typeof options.allow_cache !== 'undefined')?(!!options.allow_cache):(true),
            resumable = that.resumable,
            allow_muedit = options.allow_muedit || false,
            read_only = (typeof options.read_only !== 'undefined')?(!!options.read_only):(false),
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.edit,
            data: {
                uid: file_uid,
                server: that.server,
                oc_server: that.oc_server,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                account: that.account,
                instance: that.instance,
                token: that.token,
                pid: that.user.id,
                message_server: that.message_server || '',
                allow_cache: (allow_cache)?(allow_cache):(''),
                allow_muedit: (allow_muedit)?(allow_muedit):(''),
                resumable: (resumable)?(resumable):(''),
                read_only: (read_only)?(read_only):('')
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };
    Assistant.prototype.view = function(options){
        var that = this,
            file_uid = options.file_uid,
            resumable = that.resumable,
            allow_cache = (typeof options.allow_cache !== 'undefined')?(!!options.allow_cache):(true),
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.view,
            data: {
                uid: file_uid,
                server: that.server,
                oc_server: that.oc_server,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                account: that.account,
                instance: that.instance,
                token: that.token,
                pid: that.user.id,
                allow_cache: (allow_cache)?(allow_cache):(''),
                resumable: (resumable)?(resumable):(''),
                read_only: true
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };
    Assistant.prototype.threedpreview = function(options){
        var that = this,
            file_uid = options.file_uid,
            viewer = options.viewer,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.threedpreview,
            data: {
                uid: file_uid,
                server: that.server,
                oc_server: that.oc_server,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                account: that.account,
                instance: that.instance,
                token: that.token,
                pid: that.user.id,
                viewer: viewer
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };
    Assistant.prototype.downloadpdf = function(options){
        var that = this;
        return that.online_script({
            callback: options.callback,
            onduplicate: options.onduplicate,
            script_name: 'zopen.assistant_script:downloadpdf',
            kw: {
                server: that.server,
                uid: options.file_uids,
                pid: that.user.id,
                local_path: options.local_path || ''
            }
        });
    };

    Assistant.prototype.mergepdfs = function(options){
        var that = this,
            file_uids = options.uids,
            watermark = options.watermark,
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.mergepdfs,
            data: {
                uids: file_uids,
                server: that.server,
                oc_server: that.oc_server,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                account: that.account,
                instance: that.instance,
                token: that.token,
                pid: that.user.id,
                watermark: watermark
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };

    Assistant.prototype.watermarkpdf = function(options){
        var that = this,
            pdf_url = options.pdf_url,
            watermark = options.watermark,
            filename = options.filename || '',
            callback = (typeof options.callback === 'function')?(options.callback):(function(){});
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.watermarkpdf,
            data: {
                url: pdf_url,
                watermark: watermark,
                server: that.server,
                oc_server: that.oc_server,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                account: that.account,
                instance: that.instance,
                token: that.token,
                pid: that.user.id,
                filename: filename
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: callback,
            error: that._fail_callback
        });
    };

    Assistant.prototype.install_sync_ast = function(options){
        var that = this;
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.install_sync_ast,
            data: {
                server: that.server,
                oc_server: that.oc_server,
                account: that.account,
                instance: that.instance,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                token: that.token,
                silent: true
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: null,
            // Disable default error popup
            error: function(e){ return false; }
        });
    };

    Assistant.prototype.upgrade_sync_ast = function(options){
        var that = this;
        that._cors_ajax({
            method: that.request_method,
            url: that.assistant_server + that._url_mapping.upgrade_sync_ast,
            data: {
                server: that.server,
                oc_server: that.oc_server,
                account: that.account,
                instance: that.instance,
                build_number: that.min_build,
                version: that.version,
                min_builds: JSON.stringify(that.min_builds),
                token: that.token
            },
            cache: false,
            force_flash: !that.use_native_cors,
            success: null,
            // Disable default error popup
            error: function(e){ return false; }
        });
    };

    Assistant.prototype.disabled_alert = function(){
        $('<div id="bPopup-assistant-error" class="popup-container bPopup-assistant-error" width="600" height="200"><a class="modalCloseImg b-close" title="Close"></a><div class="simplemodal-wrap"><h2>桌面助手被禁用</h2><p>管理员禁用了桌面助手，因此您不能使用这项功能。</p></div></div>').bPopup({
            modalClose:false,
            follow:[false,false],
            opacity:0.5,
            closeClass:"b-close",
            position:['auto','auto']
        });
    };
    /**
     * 绑定全局对象
     */
    obj.Assistant = Assistant;
    /**
     * 非 SDK 内容
     */
    obj.get_assistant = function(){
        if(typeof assistant === 'undefined'){
            if(typeof assistant_options === 'undefined'){
                // 站点禁用了桌面助手
                Assistant.prototype.disabled_alert();
            }else{
                assistant = new Assistant(assistant_options);
            }
        }else{
            return assistant;
        }
    };
    try{
        if(typeof assistant_options !== 'undefined'){
            obj.get_assistant();
            assistant.use_native_cors = assistant._cors_supported();
            setTimeout(function(){
                try{
                    assistant.ping();
                }catch(e){}
            }, 5000);
        }
    }catch(e){};
})(window);

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

!function(){"use strict";var t,i,s,n=function(t,i){return function(){return t.apply(i,arguments)}};t=jQuery;i=function(){function t(){}t.transitions={webkitTransition:"webkitTransitionEnd",mozTransition:"mozTransitionEnd",oTransition:"oTransitionEnd",transition:"transitionend"};t.transition=function(t){var i,s,n,e;i=t[0];e=this.transitions;for(n in e){s=e[n];if(i.style[n]!=null){return s}}};return t}();s=function(){s.settings={namespace:"growl",duration:5200,close:"&#215;",location:"default",style:"default",size:"medium"};s.growl=function(t){if(t==null){t={}}this.initialize();return new s(t)};s.initialize=function(){return t("body:not(:has(#growls))").append('<div id="growls" />')};function s(i){if(i==null){i={}}this.html=n(this.html,this);this.$growl=n(this.$growl,this);this.$growls=n(this.$growls,this);this.animate=n(this.animate,this);this.remove=n(this.remove,this);this.dismiss=n(this.dismiss,this);this.present=n(this.present,this);this.cycle=n(this.cycle,this);this.close=n(this.close,this);this.unbind=n(this.unbind,this);this.bind=n(this.bind,this);this.render=n(this.render,this);this.settings=t.extend({},s.settings,i);this.$growls().attr("class",this.settings.location);this.render()}s.prototype.render=function(){var t;t=this.$growl();this.$growls().append(t);if(this.settings["static"]!=null){this.present()}else{this.cycle()}};s.prototype.bind=function(t){if(t==null){t=this.$growl()}return t.on("contextmenu",this.close).find("."+this.settings.namespace+"-close").on("click",this.close)};s.prototype.unbind=function(t){if(t==null){t=this.$growl()}return t.off("contextmenu",this.close).find("."+this.settings.namespace+"-close").off("click",this.close)};s.prototype.close=function(t){var i;t.preventDefault();t.stopPropagation();i=this.$growl();return i.stop().queue(this.dismiss).queue(this.remove)};s.prototype.cycle=function(){var t;t=this.$growl();return t.queue(this.present).delay(this.settings.duration).queue(this.dismiss).queue(this.remove)};s.prototype.present=function(t){var i;i=this.$growl();this.bind(i);return this.animate(i,""+this.settings.namespace+"-incoming","out",t)};s.prototype.dismiss=function(t){var i;i=this.$growl();this.unbind(i);return this.animate(i,""+this.settings.namespace+"-outgoing","in",t)};s.prototype.remove=function(t){this.$growl().remove();return t()};s.prototype.animate=function(t,s,n,e){var o;if(n==null){n="in"}o=i.transition(t);t[n==="in"?"removeClass":"addClass"](s);t.offset().position;t[n==="in"?"addClass":"removeClass"](s);if(e==null){return}if(o!=null){t.one(o,e)}else{e()}};s.prototype.$growls=function(){return this.$_growls!=null?this.$_growls:this.$_growls=t("#growls")};s.prototype.$growl=function(){return this.$_growl!=null?this.$_growl:this.$_growl=t(this.html())};s.prototype.html=function(){return"<div class='"+this.settings.namespace+" "+this.settings.namespace+"-"+this.settings.style+" "+this.settings.namespace+"-"+this.settings.size+"'>\n  <div class='"+this.settings.namespace+"-close'>"+this.settings.close+"</div>\n  <div class='"+this.settings.namespace+"-title'>"+this.settings.title+"</div>\n  <div class='"+this.settings.namespace+"-message'>"+this.settings.message+"</div>\n</div>"};return s}();t.growl=function(t){if(t==null){t={}}return s.growl(t)};t.growl.error=function(i){var s;if(i==null){i={}}s={title:"",style:"error"};return t.growl(t.extend(s,i))};t.growl.notice=function(i){var s;if(i==null){i={}}s={title:"",style:"notice"};return t.growl(t.extend(s,i))};t.growl.warning=function(i){var s;if(i==null){i={}}s={title:"",style:"warning"};return t.growl(t.extend(s,i))}}.call(this);
/*
	Queue Plug-in
	
	Features:
		*Adds a cancelQueue() method for cancelling the entire queue.
		*All queued files are uploaded when startUpload() is called.
		*If false is returned from uploadComplete then the queue upload is stopped.
		 If false is not returned (strict comparison) then the queue upload is continued.
		*Adds a QueueComplete event that is fired when all the queued files have finished uploading.
		 Set the event handler with the queue_complete_handler setting.
		
	*/

var SWFUpload;
if (typeof(SWFUpload) === "function") {
	SWFUpload.queue = {};
	
	SWFUpload.prototype.initSettings = (function (oldInitSettings) {
		return function (userSettings) {
			if (typeof(oldInitSettings) === "function") {
				oldInitSettings.call(this, userSettings);
			}
			
			this.queueSettings = {};
			
			this.queueSettings.queue_cancelled_flag = false;
			this.queueSettings.queue_upload_count = 0;
			
			this.queueSettings.user_upload_complete_handler = this.settings.upload_complete_handler;
			this.queueSettings.user_upload_start_handler = this.settings.upload_start_handler;
			this.settings.upload_complete_handler = SWFUpload.queue.uploadCompleteHandler;
			this.settings.upload_start_handler = SWFUpload.queue.uploadStartHandler;
			
			this.settings.queue_complete_handler = userSettings.queue_complete_handler || null;
		};
	})(SWFUpload.prototype.initSettings);

	SWFUpload.prototype.startUpload = function (fileID) {
		this.queueSettings.queue_cancelled_flag = false;
		this.callFlash("StartUpload", [fileID]);
	};

	SWFUpload.prototype.cancelQueue = function () {
		this.queueSettings.queue_cancelled_flag = true;
		this.stopUpload();
		
		var stats = this.getStats();
		while (stats.files_queued > 0) {
			this.cancelUpload();
			stats = this.getStats();
		}
	};
	
	SWFUpload.queue.uploadStartHandler = function (file) {
		var returnValue;
		if (typeof(this.queueSettings.user_upload_start_handler) === "function") {
			returnValue = this.queueSettings.user_upload_start_handler.call(this, file);
		}
		
		// To prevent upload a real "FALSE" value must be returned, otherwise default to a real "TRUE" value.
		returnValue = (returnValue === false) ? false : true;
		
		this.queueSettings.queue_cancelled_flag = !returnValue;

		return returnValue;
	};
	
	SWFUpload.queue.uploadCompleteHandler = function (file) {
		var user_upload_complete_handler = this.queueSettings.user_upload_complete_handler;
		var continueUpload;
		
		if (file.filestatus === SWFUpload.FILE_STATUS.COMPLETE) {
			this.queueSettings.queue_upload_count++;
		}

		if (typeof(user_upload_complete_handler) === "function") {
			continueUpload = (user_upload_complete_handler.call(this, file) === false) ? false : true;
		} else if (file.filestatus === SWFUpload.FILE_STATUS.QUEUED) {
			// If the file was stopped and re-queued don't restart the upload
			continueUpload = false;
		} else {
			continueUpload = true;
		}
		
		if (continueUpload) {
			var stats = this.getStats();
			if (stats.files_queued > 0 && this.queueSettings.queue_cancelled_flag === false) {
				this.startUpload();
			} else if (this.queueSettings.queue_cancelled_flag === false) {
				this.queueEvent("queue_complete_handler", [this.queueSettings.queue_upload_count]);
				this.queueSettings.queue_upload_count = 0;
			} else {
				this.queueSettings.queue_cancelled_flag = false;
				this.queueSettings.queue_upload_count = 0;
			}
		}
	};
}
/*
	A simple class for displaying file information and progress
	Note: This is a demonstration only and not part of SWFUpload.
	Note: Some have had problems adapting this class in IE7. It may not be suitable for your application.
*/

// Constructor
// file is a SWFUpload file object
// targetID is the HTML element id attribute that the FileProgress HTML structure will be added to.
// Instantiating a new FileProgress object with an existing file will reuse/update the existing DOM elements
function FileProgress(file, targetID) {
	this.fileProgressID = file.id;

	this.opacity = 100;
	this.height = 0;


	this.fileProgressWrapper = document.getElementById(this.fileProgressID);
	if (!this.fileProgressWrapper) {
		this.fileProgressWrapper = document.createElement("div");
		this.fileProgressWrapper.className = "progressWrapper";
		this.fileProgressWrapper.id = this.fileProgressID;

		this.fileProgressElement = document.createElement("div");
		this.fileProgressElement.className = "progressContainer";

		var progressCancel = document.createElement("a");
		progressCancel.className = "progressCancel";
		progressCancel.href = "#";
		progressCancel.style.visibility = "hidden";
		progressCancel.appendChild(document.createTextNode(" "));

		var progressText = document.createElement("div");
		progressText.className = "progressName";
		progressText.appendChild(document.createTextNode(file.name));

		var progressBar = document.createElement("div");
		progressBar.className = "progressBarInProgress";

		var progressStatus = document.createElement("div");
		progressStatus.className = "progressBarStatus";
		progressStatus.innerHTML = "";

		this.fileProgressElement.appendChild(progressCancel);
		this.fileProgressElement.appendChild(progressText);
		this.fileProgressElement.appendChild(progressStatus);
		this.fileProgressElement.appendChild(progressBar);

		this.fileProgressWrapper.appendChild(this.fileProgressElement);

		document.getElementById(targetID).appendChild(this.fileProgressWrapper);
	} else {
		this.fileProgressElement = this.fileProgressWrapper.firstChild;
		this.reset();
	}

	this.height = this.fileProgressWrapper.offsetHeight;
	this.setTimer(null);


}

FileProgress.prototype.setTimer = function (timer) {
	this.fileProgressElement["FP_TIMER"] = timer;
};
FileProgress.prototype.getTimer = function (timer) {
	return this.fileProgressElement["FP_TIMER"] || null;
};

FileProgress.prototype.reset = function () {
	this.fileProgressElement.className = "progressContainer";

	this.fileProgressElement.childNodes[2].innerHTML = "&nbsp;";
	this.fileProgressElement.childNodes[2].className = "progressBarStatus";

	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = "0%";

	this.appear();
};

FileProgress.prototype.setProgress = function (percentage) {
	this.fileProgressElement.className = "progressContainer green";
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = percentage + "%";

	this.appear();
};
FileProgress.prototype.setComplete = function () {
	this.fileProgressElement.className = "progressContainer blue";
	this.fileProgressElement.childNodes[3].className = "progressBarComplete";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 10000));
};
FileProgress.prototype.setError = function (disappear) {
	this.fileProgressElement.className = "progressContainer red";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

    if (disappear === undefined) {
        var oSelf = this;
        this.setTimer(setTimeout(function () {
            oSelf.disappear();
        }, 5000));
    }
};
FileProgress.prototype.setCancelled = function () {
	this.fileProgressElement.className = "progressContainer";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 2000));
};
FileProgress.prototype.setStatus = function (status) {
	this.fileProgressElement.childNodes[2].innerHTML = status;
};

// Show/Hide the cancel button
FileProgress.prototype.toggleCancel = function (show, swfUploadInstance) {
	this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
	if (swfUploadInstance) {
		var fileID = this.fileProgressID;
		this.fileProgressElement.childNodes[0].onclick = function () {
			swfUploadInstance.cancelUpload(fileID);
			return false;
		};
	}
};

FileProgress.prototype.appear = function () {
	if (this.getTimer() !== null) {
		clearTimeout(this.getTimer());
		this.setTimer(null);
	}

	if (this.fileProgressWrapper.filters) {
		try {
			this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
		} catch (e) {
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=100)";
		}
	} else {
		this.fileProgressWrapper.style.opacity = 1;
	}

	this.fileProgressWrapper.style.height = "";

	this.height = this.fileProgressWrapper.offsetHeight;
	this.opacity = 100;
	this.fileProgressWrapper.style.display = "";

};

// Fades out and clips away the FileProgress box.
FileProgress.prototype.disappear = function () {

	var reduceOpacityBy = 15;
	var reduceHeightBy = 4;
	var rate = 30;	// 15 fps

	if (this.opacity > 0) {
		this.opacity -= reduceOpacityBy;
		if (this.opacity < 0) {
			this.opacity = 0;
		}

		if (this.fileProgressWrapper.filters) {
			try {
				this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = this.opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + this.opacity + ")";
			}
		} else {
			this.fileProgressWrapper.style.opacity = this.opacity / 100;
		}
	}

	if (this.height > 0) {
		this.height -= reduceHeightBy;
		if (this.height < 0) {
			this.height = 0;
		}

		this.fileProgressWrapper.style.height = this.height + "px";
	}

	if (this.height > 0 || this.opacity > 0) {
		var oSelf = this;
		this.setTimer(setTimeout(function () {
			oSelf.disappear();
		}, rate));
	} else {
		this.fileProgressWrapper.style.display = "none";
		this.setTimer(null);
	}
};
FileProgress.prototype.getElement = function () {
    return this.fileProgressElement;
}


/**
* jQuery Image Reloader
*
* @author Dumitru Glavan
* @link http://dumitruglavan.com/
* @version 1.0 (3-FEB-2012)
* @requires jQuery v1.4 or later
*
* @example $('.slow-images').imageReloader()
*
* Find source on GitHub: https://github.com/doomhz/jQuery-Image-Reloader
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/
;(function ($) {
  $.fn.imageReloader = function (options) {

    options = $.extend({}, options, {
      reloadTime: 1500,
      maxTries: 15
    });

    var $self = $(this);

    if ($self.length > 1) {
      $self.each(function (i, el) {
        $(el).imageReloader(options);
        $(el).attr("src", $(el).attr("src"));
      });
      return $self;
    }
    $self.attr("src", $self.attr("src"));
    $self.data("reload-times", 0);

    var $imageReplacer = $('<i class="fa fa-spinner fa-spin fa-lg" style="font-size: 20px;"></i>');
    var $retryReplacer = $('<i class="fa-refresh" style="font-size: 14px;"></i>');
    $imageReplacer.hide();
    $retryReplacer.hide();
    if (!$self.next().length) {
        $imageReplacer.insertAfter($self);
    }

    var showImage = function () {
      $self.show();
      $imageReplacer.hide();
    };

    $self.bind("error", function () {
      $self.hide();
      $imageReplacer.show().css('display', '');
      var reloadTimes = $self.data("reload-times");
      if (reloadTimes < options.maxTries) {
        setTimeout(function () {
          $self.attr("src", $self.attr("src"));
          var reloadTimes = $self.data("reload-times");
          reloadTimes++;
          $self.data("reload-times", reloadTimes);
        }, options.reloadTime);
      } else if (!$self.is(":visible")) {
        showImage();
        $retryReplacer.insertAfter($self);
        $retryReplacer.show().css('display', '');
      }
    });

    $self.bind("load", function () {
      showImage();
    });
    $retryReplacer.bind('click', function () {
      $retryReplacer.hide();
      $self.data("reload-times", 0);
      $self.trigger('error');
    });

    return this;
  };

})(jQuery);

(function($){$.elems_rotation_history=[];$.elems_position_history=[];$.fn.extend({_aprox:function(num){return Math.round(num*100)/100},clearRotation:function(){return this.each(function(){var id=this.id;$.elems_rotation_history[id]=null})},getCurrentDegrees:function(){var id=this.attr("id");if(!$.elems_rotation_history[id]){return 0}var degs=$.elems_rotation_history[id].rotation;return degs},rotate:function(options){var defaults={angle:0,scale:false,direction:true,speed:0,deg2radians:Math.PI*2/360};var options=$.extend(defaults,options);return this.each(function(){var id=this.id;if($.elems_rotation_history&&!$.elems_rotation_history[id]){$.elems_rotation_history[id]={rotation:0,angle:0,laps:0}}if(!options.direction){options.angle=options.angle*-1}$.elems_rotation_history[id].rotation=(parseInt($.elems_rotation_history[id].rotation)+options.angle)%360;$.elems_rotation_history[id].angle=parseInt($.elems_rotation_history[id].angle)+options.angle;$.elems_rotation_history[id].laps=parseInt($.elems_rotation_history[id].angle/360,10);var degs=$.elems_rotation_history[id].rotation;if(!!window.ActiveXObject||"ActiveXObject"in window){if(parseInt($.browser.version)>=9&&document.documentMode>=9){$(this).css("-ms-transform","rotate("+degs+"deg)")}else{if($(this).get(0).filters){var rad=$.elems_rotation_history[id].rotation*options.deg2radians;var costheta=Math.cos(rad);var sintheta=Math.sin(rad);var prev_height=$(this).outerHeight();var prev_width=$(this).outerWidth();var prev_coords={w:prev_width,h:prev_height};try{var x=$(this).get(0).filters.item("DXImageTransform.Microsoft.Matrix").enabled}catch(e){$(this).get(0).style.filter+='progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand")'}var matrix=$(this).get(0).filters.item("DXImageTransform.Microsoft.Matrix");matrix.M11=costheta;matrix.M21=sintheta;matrix.M12=-sintheta;matrix.M22=costheta;matrix.enabled=true;var height=$(this).outerHeight();var width=$(this).outerWidth();var padding={x:(width-prev_coords.w)/2,y:(height-prev_coords.h)/2};var left=$.fn._aprox($(this).position().left-padding.x);var top=$.fn._aprox($(this).position().top-padding.y);$(this).css("top",top+"px");$(this).css("left",left+"px")}}}else{if(options.speed>0){$(this).css("-moz-transition","all "+options.speed+"s ease-in-out");$(this).css("-webkit-transition","all "+options.speed+"s ease-in-out");$(this).css("-o-transition","all "+options.speed+"s ease-in-out")}if(degs==90||degs==270){if($(this).width()>$(this).height()){var scaleValue=$(this).height()/$(this).width()}else{var scaleValue=$(this).width()/$(this).height()}}else{var scaleValue=1}$(this).css("-moz-transform","rotate("+degs+"deg) scale("+scaleValue+")");$(this).css("-webkit-transform","rotate("+degs+"deg) scale("+scaleValue+")");$(this).css("-o-transform","rotate("+degs+"deg) scale("+scaleValue+")")}})}})})(jQuery);(function($){var win=$(window),options,images,activeImage=-1,activeURL,prevImage,nextImage,compatibleOverlay,middle,centerWidth,centerHeight,ie6=!window.XMLHttpRequest,hiddenElements=[],documentElement=document.documentElement,preload={},preloadPrev=new Image,preloadNext=new Image,overlay,center,image,sizer,prevLink,nextLink,bottomContainer,bottom,caption,number;$(function(){$("body").append($([overlay=$('<div id="lbOverlay" />').click(close)[0],center=$('<div id="lbCenter" />')[0],bottomContainer=$('<div id="lbBottomContainer" />')[0]]).css("display","none"));image=$('<div id="lbImage" />').appendTo(center).append(sizer=$('<div style="" />').append([prevLink=$('<a id="lbPrevLink" href="#" />').click(previous)[0],nextLink=$('<a id="lbNextLink" href="#" />').click(next)[0]])[0])[0];bottom=$('<div id="lbBottom" />').appendTo(bottomContainer).append([$('<a id="lbCloseLink" href="#" />').click(close)[0],$('<a id="lbDownLoadLink" />').click("download",action)[0],$('<a id="lbLookLink" />').click("look",action)[0],$('<a id="lbPrintLink" />').click("print",action)[0],$('<a id="lbRotationLink" href="#" />').click(rotate)[0],caption=$('<div id="lbCaption" />')[0],number=$('<div id="lbNumber" />')[0],$('<div style="clear: both;" />')[0]])[0]});$.slimbox=function(_images,startImage,_options){options=$.extend({loop:false,overlayOpacity:.8,overlayFadeDuration:0,resizeDuration:0,resizeEasing:"swing",initialWidth:250,initialHeight:250,imageFadeDuration:0,captionAnimationDuration:0,counterText:"Image {x} of {y}",closeKeys:[27],previousKeys:[37],nextKeys:[39]},_options);if(typeof _images=="string"){_images=[[_images,startImage]];startImage=0}middle=win.scrollTop()+win.height()/2;centerWidth=options.initialWidth;centerHeight=options.initialHeight;$(center).css({top:Math.max(0,middle-centerHeight/2),width:centerWidth,height:centerHeight,marginLeft:-centerWidth/2}).show();compatibleOverlay=ie6||overlay.currentStyle&&overlay.currentStyle.position!="fixed";if(compatibleOverlay)overlay.style.position="absolute";$(overlay).css("opacity",options.overlayOpacity).fadeIn(options.overlayFadeDuration);position();setup(1);images=_images;options.loop=options.loop&&images.length>1;return changeImage(startImage)};$.fn.slimbox=function(_options,linkMapper,linksFilter){linkMapper=linkMapper||function(el){return[$(el).attr("href"),el.title]};linksFilter=linksFilter||function(){return true};var links=this;return links.unbind("click").click(function(){var link=this,startIndex=0,filteredLinks,i=0,length;filteredLinks=$.grep(links,function(el,i){return linksFilter.call(link,el,i)});for(length=filteredLinks.length;i<length;++i){if(filteredLinks[i]==link)startIndex=i;filteredLinks[i]=linkMapper(filteredLinks[i],i)}return $.slimbox(filteredLinks,startIndex,_options)})};function position(){var l=win.scrollLeft(),w=win.width();$([center,bottomContainer]).css("left",l+w/2);if(compatibleOverlay)$(overlay).css({left:l,top:win.scrollTop(),width:w,height:win.height()})}function setup(open){if(open){$("object").add(ie6?"select":"embed").each(function(index,el){hiddenElements[index]=[el,el.style.visibility];el.style.visibility="hidden"})}else{$.each(hiddenElements,function(index,el){el[0].style.visibility=el[1]});hiddenElements=[]}var fn=open?"bind":"unbind";win[fn]("resize",position);$(document)[fn]("keydown",keyDown)}function keyDown(event){var code=event.which,fn=$.inArray;return fn(code,options.closeKeys)>=0?close():fn(code,options.nextKeys)>=0?next():fn(code,options.previousKeys)>=0?previous():null}function previous(){$(image).clearRotation().rotate({angle:0,direction:true,speed:.5});return changeImage(prevImage)}function action(obj){var a=$('a[href="'+activeURL+'"]');var lbviewurl=a.data("url");var lbdownurl=a.data("down");var type=obj.data;if(type=="look"){window.open(lbviewurl+"/fullscreenview.html?src="+encodeURIComponent(lbdownurl))}else if(type=="download"){window.location.href=lbdownurl}else if(type=="print"){var win=window.open();var title=a.attr("title");var $image=$("<img />").attr("src",a.attr("href"));win.document.write("<html><head><title>"+title+"</title><style>body{text-align:center;}</style></head><body>");$(win.document.body).html($image);setTimeout(function(){win.print()},1e3)}}function next(){$(image).clearRotation().rotate({angle:0,direction:true,speed:.5});return changeImage(nextImage)}function changeImage(imageIndex){if(imageIndex>=0){activeImage=imageIndex;activeURL=images[activeImage][0];prevImage=(activeImage||(options.loop?images.length:0))-1;nextImage=(activeImage+1)%images.length||(options.loop?0:-1);stop();center.className="lbLoading";preload=new Image;preload.onload=animateBox;preload.src=activeURL}return false}function animateBox(){center.className="";var deg=$(image).getCurrentDegrees();if(deg==90||deg==270){$(image).css({backgroundColor:"#FFF",visibility:"hidden",display:"",backgroundImage:""});var img=new Image;img.src=activeURL;$(sizer).html($([img,prevLink=$('<a id="lbPrevLink" href="#" />').click(previous)[0],nextLink=$('<a id="lbNextLink" href="#" />').click(next)[0]]));$(sizer).width(preload.height);$([sizer,prevLink,nextLink]).height(preload.width);$([prevLink,nextLink]).hide()}else{if($(image).find("img").length){$(sizer).html($([prevLink=$('<a id="lbPrevLink" href="#" />').click(previous)[0],nextLink=$('<a id="lbNextLink" href="#" />').click(next)[0]]))}$(image).css({backgroundImage:"url('"+activeURL+"')",visibility:"hidden",display:""});$(sizer).width(preload.width);$([sizer,prevLink,nextLink]).height(preload.height)}$(caption).html(images[activeImage][1]||"");$(number).html((images.length>1&&options.counterText||"").replace(/{x}/,activeImage+1).replace(/{y}/,images.length));if(prevImage>=0)preloadPrev.src=images[prevImage][0];if(nextImage>=0)preloadNext.src=images[nextImage][0];centerWidth=image.offsetWidth;centerHeight=image.offsetHeight;if(deg==90){$(sizer).height("")}else if(deg==270){$(sizer).width("")}if(centerWidth>win.width()){var css={marginLeft:0,left:1}}else{var css={marginLeft:-centerWidth/2}}var top=Math.max(0,middle-centerHeight/2);if(center.offsetHeight!=centerHeight){$(center).animate({height:centerHeight,top:top},options.resizeDuration,options.resizeEasing)}if(center.offsetWidth!=centerWidth){$(center).animate($.extend({width:centerWidth},css),options.resizeDuration,options.resizeEasing)}$(center).queue(function(){$(bottomContainer).css($.extend({width:centerWidth,top:top+centerHeight,visibility:"hidden",display:""},css));$(image).css({display:"none",visibility:"",opacity:""}).fadeIn(options.imageFadeDuration,animateCaption)});var a=$('a[href="'+activeURL+'"]');if(a.data("down")){$("#lbDownLoadLink").show();if(/^.(jpg|jpeg|png|gif|bmp)$/i.test(a.data("ext"))){$("#lbLookLink").show()}else{$("#lbLookLink").hide()}}else{$("#lbDownLoadLink").hide();$("#lbLookLink").hide()}if(!a.data("print")){$("#lbPrintLink").hide()}if(typeof Worker==="undefined"){$("#lbRotationLink").hide()}$(image).bind("contextmenu",function(){return false})}function animateCaption(){if(prevImage>=0)$(prevLink).show();if(nextImage>=0)$(nextLink).show();$(bottom).css("marginTop",-bottom.offsetHeight).animate({marginTop:0},options.captionAnimationDuration);bottomContainer.style.visibility=""}function stop(){preload.onload=null;preload.src=preloadPrev.src=preloadNext.src=activeURL;$([center,image,bottom]).stop(true);$([prevLink,nextLink,image,bottomContainer]).hide()}function close(reset){if(reset){$(image).clearRotation().rotate({angle:0,direction:true,speed:.5})}if(activeImage>=0){stop();activeImage=prevImage=nextImage=-1;$(center).hide();$(overlay).stop().fadeOut(options.overlayFadeDuration,setup)}return false}function rotate(){$([image]).rotate({angle:90,direction:true,speed:.5});var a=$('a[href="'+activeURL+'"]');close(false);a.trigger("click");return false}})(jQuery);jQuery(function($){$("a[rel^='lightbox']").slimbox({},null,function(el){return this==el||this.rel.length>8&&this.rel==el.rel})});
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n():"function"==typeof define&&define.amd?define(n):n()}(0,function(){"use strict";function e(e){var n=this.constructor;return this.then(function(t){return n.resolve(e()).then(function(){return t})},function(t){return n.resolve(e()).then(function(){return n.reject(t)})})}function n(){}function t(e){if(!(this instanceof t))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=undefined,this._deferreds=[],u(e,this)}function o(e,n){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,t._immediateFn(function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null!==t){var o;try{o=t(e._value)}catch(f){return void i(n.promise,f)}r(n.promise,o)}else(1===e._state?r:i)(n.promise,e._value)})):e._deferreds.push(n)}function r(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var o=n.then;if(n instanceof t)return e._state=3,e._value=n,void f(e);if("function"==typeof o)return void u(function(e,n){return function(){e.apply(n,arguments)}}(o,n),e)}e._state=1,e._value=n,f(e)}catch(r){i(e,r)}}function i(e,n){e._state=2,e._value=n,f(e)}function f(e){2===e._state&&0===e._deferreds.length&&t._immediateFn(function(){e._handled||t._unhandledRejectionFn(e._value)});for(var n=0,r=e._deferreds.length;r>n;n++)o(e,e._deferreds[n]);e._deferreds=null}function u(e,n){var t=!1;try{e(function(e){t||(t=!0,r(n,e))},function(e){t||(t=!0,i(n,e))})}catch(o){if(t)return;t=!0,i(n,o)}}var c=setTimeout;t.prototype["catch"]=function(e){return this.then(null,e)},t.prototype.then=function(e,t){var r=new this.constructor(n);return o(this,new function(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}(e,t,r)),r},t.prototype["finally"]=e,t.all=function(e){return new t(function(n,t){function o(e,f){try{if(f&&("object"==typeof f||"function"==typeof f)){var u=f.then;if("function"==typeof u)return void u.call(f,function(n){o(e,n)},t)}r[e]=f,0==--i&&n(r)}catch(c){t(c)}}if(!e||"undefined"==typeof e.length)throw new TypeError("Promise.all accepts an array");var r=Array.prototype.slice.call(e);if(0===r.length)return n([]);for(var i=r.length,f=0;r.length>f;f++)o(f,r[f])})},t.resolve=function(e){return e&&"object"==typeof e&&e.constructor===t?e:new t(function(n){n(e)})},t.reject=function(e){return new t(function(n,t){t(e)})},t.race=function(e){return new t(function(n,t){for(var o=0,r=e.length;r>o;o++)e[o].then(n,t)})},t._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){c(e,0)},t._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var l=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw Error("unable to locate global object")}();"Promise"in l?l.Promise.prototype["finally"]||(l.Promise.prototype["finally"]=e):l.Promise=t});

