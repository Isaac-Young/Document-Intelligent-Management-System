
    function ImagePaster(name, element) {
      this.name = name;

      var $paster           = $(element)
        , $clipboard        = $('<div></div>')
        , $pasteCatcher     = $('<div></div>')
        , template          = '<input name="'+this.name+'" type="hidden" value="{value}"><img src="{src}">'
      ;

      if (!window.FileReader) {
        $paster.html('您的浏览器不支持，不能进行贴图操作。');
        return;
      }

      $paster.html(
        $('<div></div>').css({'border':'1px solid #ccc'}).append(
          $('<div>Ctrl + V 进行粘贴</div>')
            .css({'background':'#f0f0ee', 'padding':'5px', 'border-bottom':'1px solid #ccc'}),
          $clipboard.html($pasteCatcher.css('opacity', 0).attr('contenteditable', ''))
            .css({'height':'150px', 'width':'100%', 'overflow':'auto', 'background':'#fff'})
        )
      );
      $pasteCatcher.focus();
      $paster.on('click', function() { $pasteCatcher.focus(); });
      $paster.on('paste', pasteHandler).closest('form').on('paste', pasteHandler);

      function pasteHandler(e) {
        e.stopPropagation();
        if (e.originalEvent.clipboardData && e.originalEvent.clipboardData.items) {
          var items = e.originalEvent.clipboardData.items;
          if (items) {
            for (var i = 0; i < items.length; i++) {
              if (items[i].type.indexOf('image') !== -1) {
                 var blob = items[i].getAsFile();
                 var URLObj = window.URL || window.webkitURL;
                 var source = URLObj.createObjectURL(blob);
                 var reader = new FileReader();
                 reader.readAsDataURL(blob);
                 reader.onload = function(e) {
                   $clipboard.html(template.replace(/{src}/, source).replace(/{value}/, this.result));
                 }
              }
            }
          }
        } else {
          setTimeout(checkInput, 1);
        }
      }

      function checkInput() {
        var child = $pasteCatcher.find(':first-child');
        $pasteCatcher.empty();
        if (child.is('img')) {
          var src = child.attr('src');
          $clipboard.html(template.replace(/{src}/, src).replace(/{value}/, src));
        }
      }
    }

