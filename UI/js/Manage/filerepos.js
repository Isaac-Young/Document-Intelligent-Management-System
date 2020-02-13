!function(e,t,a,i){var n="ontouchstart"in a.documentElement,r="touchstart mousedown",l="touchmove mousemove",s="touchend mouseup";n&&e.each("touchstart touchmove touchend".split(" "),function(t,a){e.event.fixHooks[a]=e.event.mouseHooks});e(a).ready(function(){function t(e){var t={},a=e.match(/([^;:]+)/g)||[];while(a.length)t[a.shift()]=a.shift().trim();return t}e("table").each(function(){if(e(this).data("table")=="dnd"){e(this).tableDnD({onDragStyle:e(this).data("ondragstyle")&&t(e(this).data("ondragstyle"))||null,onDropStyle:e(this).data("ondropstyle")&&t(e(this).data("ondropstyle"))||null,onDragClass:e(this).data("ondragclass")==i&&"tDnD_whileDrag"||e(this).data("ondragclass"),onDrop:e(this).data("ondrop")&&new Function("table","row",e(this).data("ondrop")),onDragStart:e(this).data("ondragstart")&&new Function("table","row",e(this).data("ondragstart")),scrollAmount:e(this).data("scrollamount")||5,sensitivity:e(this).data("sensitivity")||10,hierarchyLevel:e(this).data("hierarchylevel")||0,indentArtifact:e(this).data("indentartifact")||'<div class="indent">&nbsp;</div>',autoWidthAdjust:e(this).data("autowidthadjust")||true,autoCleanRelations:e(this).data("autocleanrelations")||true,jsonPretifySeparator:e(this).data("jsonpretifyseparator")||"	",serializeRegexp:e(this).data("serializeregexp")&&new RegExp(e(this).data("serializeregexp"))||/[^\-]*$/,serializeParamName:e(this).data("serializeparamname")||false,dragHandle:e(this).data("draghandle")||null})}})});jQuery.tableDnD={currentTable:null,dragObject:null,mouseOffset:null,oldX:0,oldY:0,build:function(t){this.each(function(){this.tableDnDConfig=e.extend({onDragStyle:null,onDropStyle:null,onDragClass:"tDnD_whileDrag",onDrop:null,onDragStart:null,scrollAmount:5,sensitivity:10,hierarchyLevel:0,indentArtifact:'<div class="indent">&nbsp;</div>',autoWidthAdjust:true,autoCleanRelations:true,jsonPretifySeparator:"	",serializeRegexp:/[^\-]*$/,serializeParamName:false,dragHandle:null},t||{});e.tableDnD.makeDraggable(this);this.tableDnDConfig.hierarchyLevel&&e.tableDnD.makeIndented(this)});return this},makeIndented:function(t){var a=t.tableDnDConfig,i=t.rows,n=e(i).first().find("td:first")[0],r=0,l=0,s,o;if(e(t).hasClass("indtd"))return null;o=e(t).addClass("indtd").attr("style");e(t).css({whiteSpace:"nowrap"});for(var d=0;d<i.length;d++){if(l<e(i[d]).find("td:first").text().length){l=e(i[d]).find("td:first").text().length;s=d}}e(n).css({width:"auto"});for(d=0;d<a.hierarchyLevel;d++)e(i[s]).find("td:first").prepend(a.indentArtifact);n&&e(n).css({width:n.offsetWidth});o&&e(t).css(o);for(d=0;d<a.hierarchyLevel;d++)e(i[s]).find("td:first").children(":first").remove();a.hierarchyLevel&&e(i).each(function(){r=e(this).data("level")||0;r<=a.hierarchyLevel&&e(this).data("level",r)||e(this).data("level",0);for(var t=0;t<e(this).data("level");t++)e(this).find("td:first").prepend(a.indentArtifact)});return this},makeDraggable:function(t){var a=t.tableDnDConfig;a.dragHandle&&e(a.dragHandle,t).each(function(){e(this).bind(r,function(i){e.tableDnD.initialiseDrag(e(this).parents("tr")[0],t,this,i,a);return false})})||e(t.rows).each(function(){if(!e(this).hasClass("nodrag")){e(this).bind(r,function(i){if(i.target.tagName=="TD"){e.tableDnD.initialiseDrag(this,t,this,i,a);return false}}).css("cursor","move")}else{e(this).css("cursor","")}})},currentOrder:function(){var t=this.currentTable.rows;return e.map(t,function(t){return(e(t).data("level")+t.id).replace(/\s/g,"")}).join("")},initialiseDrag:function(t,i,n,r,o){this.dragObject=t;this.currentTable=i;this.mouseOffset=this.getMouseOffset(n,r);this.originalOrder=this.currentOrder();e(a).bind(l,this.mousemove).bind(s,this.mouseup);o.onDragStart&&o.onDragStart(i,n)},updateTables:function(){this.each(function(){if(this.tableDnDConfig)e.tableDnD.makeDraggable(this)})},mouseCoords:function(e){if(e.originalEvent.changedTouches)return{x:e.originalEvent.changedTouches[0].clientX,y:e.originalEvent.changedTouches[0].clientY};if(e.pageX||e.pageY)return{x:e.pageX,y:e.pageY};return{x:e.clientX+a.body.scrollLeft-a.body.clientLeft,y:e.clientY+a.body.scrollTop-a.body.clientTop}},getMouseOffset:function(e,a){var i,n;a=a||t.event;n=this.getPosition(e);i=this.mouseCoords(a);return{x:i.x-n.x,y:i.y-n.y}},getPosition:function(e){var t=0,a=0;if(e.offsetHeight==0)e=e.firstChild;while(e.offsetParent){t+=e.offsetLeft;a+=e.offsetTop;e=e.offsetParent}t+=e.offsetLeft;a+=e.offsetTop;return{x:t,y:a}},autoScroll:function(e){var i=this.currentTable.tableDnDConfig,n=t.pageYOffset,r=t.innerHeight?t.innerHeight:a.documentElement.clientHeight?a.documentElement.clientHeight:a.body.clientHeight;if(a.all)if(typeof a.compatMode!="undefined"&&a.compatMode!="BackCompat")n=a.documentElement.scrollTop;else if(typeof a.body!="undefined")n=a.body.scrollTop;e.y-n<i.scrollAmount&&t.scrollBy(0,-i.scrollAmount)||r-(e.y-n)<i.scrollAmount&&t.scrollBy(0,i.scrollAmount)},moveVerticle:function(e,t){if(0!=e.vertical&&t&&this.dragObject!=t&&this.dragObject.parentNode==t.parentNode)0>e.vertical&&this.dragObject.parentNode.insertBefore(this.dragObject,t.nextSibling)||0<e.vertical&&this.dragObject.parentNode.insertBefore(this.dragObject,t)},moveHorizontal:function(t,a){var i=this.currentTable.tableDnDConfig,n;if(!i.hierarchyLevel||0==t.horizontal||!a||this.dragObject!=a)return null;n=e(a).data("level");0<t.horizontal&&n>0&&e(a).find("td:first").children(":first").remove()&&e(a).data("level",--n);0>t.horizontal&&n<i.hierarchyLevel&&e(a).prev().data("level")>=n&&e(a).children(":first").prepend(i.indentArtifact)&&e(a).data("level",++n)},mousemove:function(t){var a=e(e.tableDnD.dragObject),i=e.tableDnD.currentTable.tableDnDConfig,n,r,l,s,o;t&&t.preventDefault();if(!e.tableDnD.dragObject)return false;t.type=="touchmove"&&event.preventDefault();i.onDragClass&&a.addClass(i.onDragClass)||a.css(i.onDragStyle);r=e.tableDnD.mouseCoords(t);s=r.x-e.tableDnD.mouseOffset.x;o=r.y-e.tableDnD.mouseOffset.y;e.tableDnD.autoScroll(r);n=e.tableDnD.findDropTargetRow(a,o);l=e.tableDnD.findDragDirection(s,o);e.tableDnD.moveVerticle(l,n);e.tableDnD.moveHorizontal(l,n);return false},findDragDirection:function(e,t){var a=this.currentTable.tableDnDConfig.sensitivity,i=this.oldX,n=this.oldY,r=i-a,l=i+a,s=n-a,o=n+a,d={horizontal:e>=r&&e<=l?0:e>i?-1:1,vertical:t>=s&&t<=o?0:t>n?-1:1};if(d.horizontal!=0)this.oldX=e;if(d.vertical!=0)this.oldY=t;return d},findDropTargetRow:function(t,a){var i=0,n=this.currentTable.rows,r=this.currentTable.tableDnDConfig,l=0,s=null;for(var o=0;o<n.length;o++){s=n[o];l=this.getPosition(s).y;i=parseInt(s.offsetHeight)/2;if(s.offsetHeight==0){l=this.getPosition(s.firstChild).y;i=parseInt(s.firstChild.offsetHeight)/2}if(a>l-i&&a<l+i)if(t.is(s)||r.onAllowDrop&&!r.onAllowDrop(t,s)||e(s).hasClass("nodrop"))return null;else return s}return null},processMouseup:function(){if(!this.currentTable||!this.dragObject)return null;var t=this.currentTable.tableDnDConfig,i=this.dragObject,n=0,r=0;e(a).unbind(l,this.mousemove).unbind(s,this.mouseup);t.hierarchyLevel&&t.autoCleanRelations&&e(this.currentTable.rows).first().find("td:first").children().each(function(){r=e(this).parents("tr:first").data("level");r&&e(this).parents("tr:first").data("level",--r)&&e(this).remove()})&&t.hierarchyLevel>1&&e(this.currentTable.rows).each(function(){r=e(this).data("level");if(r>1){n=e(this).prev().data("level");while(r>n+1){e(this).find("td:first").children(":first").remove();e(this).data("level",--r)}}});t.onDragClass&&e(i).removeClass(t.onDragClass)||e(i).css(t.onDropStyle);this.dragObject=null;t.onDrop&&this.originalOrder!=this.currentOrder()&&e(i).hide().fadeIn("fast")&&t.onDrop(this.currentTable,i);this.currentTable=null},mouseup:function(t){t&&t.preventDefault();e.tableDnD.processMouseup();return false},jsonize:function(e){var t=this.currentTable;if(e)return JSON.stringify(this.tableData(t),null,t.tableDnDConfig.jsonPretifySeparator);return JSON.stringify(this.tableData(t))},serialize:function(){return e.param(this.tableData(this.currentTable))},serializeTable:function(e){var t="";var a=e.tableDnDConfig.serializeParamName||e.id;var i=e.rows;for(var n=0;n<i.length;n++){if(t.length>0)t+="&";var r=i[n].id;if(r&&e.tableDnDConfig&&e.tableDnDConfig.serializeRegexp){r=r.match(e.tableDnDConfig.serializeRegexp)[0];t+=a+"[]="+r}}return t},serializeTables:function(){var t=[];e("table").each(function(){this.id&&t.push(e.param(this.tableData(this)))});return t.join("&")},tableData:function(t){var a=t.tableDnDConfig,i=[],n=0,r=0,l=null,s={},o,d,h,f;if(!t)t=this.currentTable;if(!t||!t.id||!t.rows||!t.rows.length)return{error:{code:500,message:"Not a valid table, no serializable unique id provided."}};f=a.autoCleanRelations&&t.rows||e.makeArray(t.rows);d=a.serializeParamName||t.id;h=d;o=function(e){if(e&&a&&a.serializeRegexp)return e.match(a.serializeRegexp)[0];return e};s[h]=[];!a.autoCleanRelations&&e(f[0]).data("level")&&f.unshift({id:"undefined"});for(var u=0;u<f.length;u++){if(a.hierarchyLevel){r=e(f[u]).data("level")||0;if(r==0){h=d;i=[]}else if(r>n){i.push([h,n]);h=o(f[u-1].id)}else if(r<n){for(var c=0;c<i.length;c++){if(i[c][1]==r)h=i[c][0];if(i[c][1]>=n)i[c][1]=0}}n=r;if(!e.isArray(s[h]))s[h]=[];l=o(f[u].id);l&&s[h].push(l)}else{l=o(f[u].id);l&&s[h].push(l)}}return s}};jQuery.fn.extend({tableDnD:e.tableDnD.build,tableDnDUpdate:e.tableDnD.updateTables,tableDnDSerialize:e.proxy(e.tableDnD.serialize,e.tableDnD),tableDnDSerializeAll:e.tableDnD.serializeTables,tableDnDData:e.proxy(e.tableDnD.tableData,e.tableDnD)})}(jQuery,window,window.document);
/*
 * zopen.filerepos
 * asset.js
 *
 */

function bindEvent() {
    $(function() {
        $("a[rel^='lightbox']").slimbox({}, null, function(el) {
            return (this == el) || ((this.rel.length > 8) && (this.rel == el.rel));
        });

        $('.slow-images').imageReloader();

        $('#dimension_table').tableDnD({
           onDragStart: function(table, row) {
	           var tag_list = $(row).prevAll().filter('.dimension');
               if (tag_list) {
                   before_tag = tag_list.first().attr('id').replace('tag_', '');
               }
           },
           onDrop: function(table, row) {
               var tag_list = $(row).prevAll().filter('.dimension');
               if (tag_list) {
                   var after_tag = tag_list.first().attr('id').replace('tag_', '');
               }
               var file_id = row.id;
               if (file_id) {
                   var params = {
                       'dimension': $('#dimension').attr('value'),
                       'file_id': file_id,
                       'before_tag': before_tag,
                       'after_tag': after_tag
                   };
                   kssServerAction(row, "@@frashTag", params);
               }
           }
        });
        dropUpload();
        $('#totalFolderSearch .searchBoxInput').liveSearch({
          'url': '@@folder-live-search?text=',
          'addTopPos': 5,
          'addWidth': 100,
          'addLeftPos': 100,
          'loadingClass': 'loading',
          'wordLength':  1,
          'id': 'subfolder-menu'
        });
        var $table = $('#previewBody table.listing');
        if ($table.attr('sort')) {
            $('table.listing .folderRow').on('hover', function(event) {
                if (event.type == 'mouseover' || event.type == 'mouseenter') {
                    $(this).find('.menu .sort').removeClass('hidden');
                } else {
                    $(this).find('.menu .sort').addClass('hidden');
                }
            });
            var uids = '', uid = '';
            $table.tableDnD({
                onDragClass: 'myDrag',
                onDrop: function(table, row) {
                    $('table.listing .folderRow').each(function(index) {
                        uids += this.id.split('-')[1] + '+';
                    });
                    uid = row.id.split('-')[1];
                    $(table).kss($table.attr('sort'), {uids:uids, uid:uid});
                },
                dragHandle: '.dragHandle',
                onDragStart: function(table, row) {
                    uids = uid = '';
                }
            });
        }
    });
}

function dropUpload() {
    if (! window.FileReader) {
        return;
    } else {
        load(['jquery.filedrop.js', 'tus.js', 'fileprogress.js'], function() {
            $('#folder-drop-upload').remove();
            var pop = $('<div id="folder-drop-upload" width="600" height="450" class="popup-container" style="display:none:">' +
                '<a class="modalCloseImg b-close"></a>' +
                '<div class="simplemodal-wrap">' + $('#drop-upload').prop('outerHTML') + '</div></div>'),
                signurl = pop.find('#signurl').val(),
                callback_url = pop.find('#callback_url').val();
                box = pop.find('#drop-upload-box');

            pop.find('#progress').attr('id', 'folder-progress');

            $('#main').filedrop({
                signurl: signurl,
                submitElement: pop.find('.submit'),
                uploadElement: pop.find('.upload'),
                closeElement: pop.find('.b-close'),
                dropElement: box,
                uploadStarted: function(i, file, len){
                    file.id = 'folderdropupload_' + i;
                    $('#' + file.id).remove();
                    if (file.name === undefined) {
                        $('#main').trigger('cancelupload', i);
                        return false;
                    }
                    if (!pop.is(':visible')) {
                        pop.bPopup({
                          modalClose: false,
                          opacity: 0.5,
                          follow: [true, true],
                          position: ['auto','auto'],
                          closeClass: 'b-close',
                          focus: false,
                          remove: false,
                          onClose: function() {
                            pop.find('.b-close').trigger('click');
                            $('#folder-progress').empty();
                          },
                          onOpen: function() {
                            pop.show().find('#drop-upload').removeClass('hidden');
                          }
                        });
                    }
                    var progress = new FileProgress(file, 'folder-progress');
                    progress.toggleCancel(true, undefined);
		            progress.fileProgressElement.childNodes[0].onclick = function () {
                        var proresses = $('#folder-progress .progressWrapper:visible');
                        var index = $('#' + progress.fileProgressID).index(proresses);
                        $('#main').trigger('cancelupload', index);
                        progress.disappear();

                        pop.find('.total').text('共选择 ' + (proresses.length - 1) + ' 个文件');
		                return false;
		            };
                    progress.setStatus('准备上传');
                    pop.find('.total').text('共选择 ' + len + ' 个文件');
                },
                uploadFinished: function(file) {
                    var progress = new FileProgress(file, 'folder-progress');
                    progress.setComplete();
                    progress.setStatus('成功上传');
                    var filename = file.rename || file.name;
                    var filepath = file.path || '';
                    if (sessionStorage.dropFiles) {
                        var str = sessionStorage.dropFiles;
                        var obj = JSON.parse(str);
                        obj.files.push(filename);
                        obj.paths.push(filepath);
                        sessionStorage.dropFiles = JSON.stringify(obj);
                    } else {
                        sessionStorage.dropFiles = JSON.stringify({
                            files: new Array(filename),
                            paths: new Array(filepath)
                        });
                    }
                },
                uploadErrored: function(error, file) {
                    var progress = new FileProgress(file, 'folder-progress');
                    if (error == 'file exist') {
                        progress.setError(true);
                        var progressElement = $(progress.getElement());
                        var filename = file.rename || file.name;
                        if (filename.indexOf('.') !== -1) {
                            var splitname = filename.split('.');
                            var ext = splitname.pop();
                            var rename = splitname.join('.') + '-2.' + ext;
                        } else {
                            var rename = file.name + '-2';
                        }

                        var action = $('<div><span>文件名已存在，您可以选择 </span>');
                        action.append($('<button type="button" class="button danger mini">放弃上传</button>').click(function(){ $(this).closest('.progressWrapper').find('.progressCancel').trigger('click'); }));
                        action.append($('<button type="button" class="button mini" style="margin-left: 5px;">上传为新版本</button>').click(function(){
                            file.rename = '';
                            file.newrevision = true;
                            file.upload(file, file.index, true);
                        }));
                        action.append('<br>或改名上传');
                        action.append($('<input type="text" style="margin: 0 5px;width: 50%;">').val(rename).focus());
                        action.append($('<button type="button" class="button mini">上传</button>').click(function(){
                            file.rename = $(this).prev().val();
                            file.newrevision = '';
                            if (!$.trim(file.rename)) {
                                $().message('文件名为空', 'warning');
                                $(this).prev().focus();
                            } else {
                                progressElement.find('.progressName').html(file.rename);
                                file.upload(file, file.index, true);
                            }
                        }));
                        progressElement.find('.progressBarStatus').html(action);
                    } else {
                        progress.setError(true);
                        progress.setStatus('上传失败：' + error);
                    }
                },
                progressUpdated: function(i, file, progress) {
                    var progressObj = new FileProgress(file, 'folder-progress');
                    progressObj.setProgress(progress);
                    progressObj.fileProgressElement.childNodes[0].style.display = 'none';
                },
                start: function(len) {
                    pop.find('.upload-actions').addClass('hidden');
                    pop.find('.upload-loading').removeClass('hidden');
                },
                end: function(len) {
                    pop.find('.upload-actions').removeClass('hidden');
                    pop.find('.upload-loading').addClass('hidden');
                },
                afterAll: function(close_callback) {
                    pop.find('.upload-actions').removeClass('hidden');
                    pop.find('.upload-loading').addClass('hidden');
                    if (sessionStorage.dropFiles) {
                        sessionStorage.dropFiles.privated = pop.find('#setPrivate').is(':checked') ? 'true' : '';
                        var data = JSON.parse(sessionStorage.dropFiles);
                        data.close_callback = close_callback;
                        // 保密
                        data.privated = pop.find('#setPrivate').is(':checked') ? 'true' : '';
                        pop.kss(callback_url, data);
                        sessionStorage.removeItem('dropFiles');
                    }
                }
            });
        });
    }
}

(function(){
    if (EDO.loaded['asset.js']) return;

    /* 文件夹搜索 */
    $('body').on('click', '#totalFolderSearch #magnifier, #totalFolderSearch button[type="submit"], #portal-tagsearch .submitTag', function() {
        $('.batch_start').attr('value', 0);
        $('.search_subtree').attr('value', true);
     });
    $('body').on('keydown', '#totalFolderSearch #searchTextInput', function(event) {
        event = window.event || event;
        if (event.keyCode == 13) {
            $('.search_subtree').attr('value', true);
        }
     });

    $('body').on('click', '#previewBody div.listingBar a', function(event) {
        event.preventDefault();
        var batch = _getAttr(this, 'batch');
        $('input.batch_start').attr('value', batch);

        var $form = $("form[name='totalFolderSearch']");
        var $data = $form.serialize();
        $(this).kss({
          url: $form.attr('action'),
          params: $data,
          mask: true
        });
     });

    /* 文件夹快捷方式翻页 */
    $('body').on('click', '#folderShortcutContent div.listingBar a', function(event) {
        event.preventDefault();
        var batch = _getAttr(this, 'batch');
        $(this).kss({
          url: '@@folderShortcutPage',
          params: {'b_start:int': batch},
          mask: true
        });
     });

    /* 文件排序 */
    $('body').on('click', '.KSSSortListingBar', function(event) {
        event.preventDefault();

        var sort_index = $(this).data('sort');
        $('input.sort_index').attr('value', sort_index);

        var reverse = $(this).data('reverse');
        $('input.reverse').attr('value', reverse);

        var $form = $("form[name='totalFolderSearch']");
        var $data = $form.serialize() + '&is_sort=true';
        $(this).kss({url:$form.attr('action'), params:$data, mask:true});
     });

    $('body').on('click', '.KSSAdvancedSearchCancel', function(event) {
        event.preventDefault();
        $('#KSSSearchField2').html('');
        $('#searchTextInput').attr('name', 'searchTextHight').closest('.KSSSearchField1').removeClass('hidden');
     });

    $('body').on('submit', 'form#import-xls-form', function(event) {
        $(this).find('.formAction').toggleClass('hidden');
        event.preventDefault();

        var $items = $('#content .chbitem');
        var $rows = '';
        $(this).find('.KSSCheckItem').each(function() {
            if ($(this).is(':checked')) {
                $rows += '-' + $(this).val();
            }
        });

        var $data = $(this).serialize() + '&rows=' + $rows;
        var url = _getURL('@@import_xls_form_submit');
        $(this).kss(url, $data);
     });

    $('body').on('change', '#totalFolderSearch select[name="typeHight"]', function() {
        if ($(this).val() == 'folder') {
            $(this).closest('tr').nextAll('tr').not(':last').hide();
        } else {
            $(this).closest('tr').nextAll('tr').not(':last').show();
        }
     });
    $('body').on('click', 'table.listing .folderRow td', function(event) {
        if (event.target.tagName == 'TD') {
            $(this).closest('tr').find('.icon-chbactions').trigger('click');
        }
    });

    bindEvent();

    EDO.loaded['asset.js'] = true;
})();

/*
 * zopen.tags
 * tagselect.js
 *
 */

(function(){
    if (EDO.loaded['tagselect.js']) return;

    $('body').on('click', 'div.selectTags div.mainSpan a.topLevel', function(event) {
        $(this).closest('.tagParentNode').find('.tagToggle').toggleClass('hidden');
        event.preventDefault();
     });

    $('body').on('click', 'div.selectTags a.tagToggle', function(event) {
        $(this).closest('.tagParentNode').find('.tagToggle').toggleClass('hidden');
        event.preventDefault();
     });

    $('body').on('click', 'div.selectTags div.subTags a.tagImage', function(event) {
        $(this).closest('.tagParentNode').find('.tagParentNode').toggleClass('hidden');
        $(this).closest('div.imageField').find('img.tagImage').toggleClass('hidden');
        event.preventDefault();
     });

    $('body').on('click', 'div.subTags a.submitTag1', function(event) {
        var node = $(this).closest('div.subTags');
        node.find('a.submitTag1').removeClass('hidden');
        node.find('a.submitTag2').addClass('hidden');

        node = $(this).parent('div');
        node.find('a.submitTag1').addClass('hidden');
        node.find('a.submitTag2').removeClass('hidden');
        event.preventDefault();
     });

    $('body').on('click', 'div.subTags a.submitTag2', function(event) {
        var node = $(this).parent('div');
        node.find('a.submitTag1').removeClass('hidden');
        node.find('a.submitTag2').addClass('hidden');
        event.preventDefault();
     });

    /* 标签搜索 */
    $('body').on('click', '#portal-tagsearch a.submitTag', function(event) {
        var $ths = $(this);
        var $formid = $ths.closest('dl#portal-tagsearch').attr('kssattr:formid');

        if (!$formid) { return; }

        if ($ths.hasClass('selected')) {
            $ths.removeClass('selected');
            var $tags = '';
        } else {
            $ths.closest('.tagParentNode').find('a.selected').removeClass('selected');
            $ths.addClass('selected');
            var $tags = $ths.attr('tags');
        }

        var $form = $('form#' + $formid);
        var tagcategory = _getAttr(this, 'tagcategory');
        if ($form.find($(tagcategory)).length > 0) {
            $(tagcategory).attr('value', $tags);
        } else {
            $form.append('<input class="'+tagcategory.split('.')[1]+'" type="hidden" name="selectTags:list" value="'+$tags+'" />');
        }

        $form.find('input.batch_start').attr('value', 0);

        $(this).kss({
          url: $form.attr('action'),
          params: $form.serialize(),
          mask: true
        });
        event.preventDefault();
     });

     EDO.loaded['tagselect.js'] = true;
})();

