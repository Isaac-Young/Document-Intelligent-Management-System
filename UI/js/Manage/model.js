/*
 * zopen.flow
 * flow.js
 *
 */

(function(){
    if (EDO.loaded['flow.js']) return;
    /* 搜索结果分页 */
    $('body').on('click', 'div.flowField div.listingBar a', function(event) {
        var $batch = _getAttr(this, 'batch');
        $('.batch_start').attr('value', $batch);

        var $form = $('form#dataitemSearch');
        var $data = $form.serialize();

        $form.kss({
          url: $form.attr('action'),
          params: $data,
          mask: true
        });
        $('.batch_start').attr('value', 0);
        event.preventDefault();
     });

    /* 阶段 */
    $('body').on('click', 'form#dataitemSearch a.KSSStageSearch', function(event) {
        $('.batch_start').attr('value', 0);
        var parentNode = $(this).parent();

        if ($(this).hasClass('selected')) {
            /* reset stage search */
            var stage = '';
            parentNode.find('a.selected').removeClass('selected');
        }
        else {
            parentNode.find('a.selected').removeClass('selected');
            $(this).addClass('selected');
            var stage = $(this).data('stage');
        }
        parentNode.find('input[name="stage"]').val(stage);

        var $form = $(this).closest('form');
        var $data = $form.serialize();

        $form.kss({
          url: $form.attr('action'),
          params: $data,
          mask: true
        });
        event.preventDefault();
    });

    /* 排序 */
    $('body').on('click', 'div.flowField a.sortDataItems', function(event) {
        var $sort = $(this).data('sort');
        var $reverse = $(this).data('reverse');
        $('input.sort').val($sort);
        $('input.reverse').val($reverse);

        var $form = $('form#dataitemSearch');
        var $data = $form.serialize();

        $form.kss({
          url: $form.attr('action'),
          params: $data,
          mask: true
        });
        event.preventDefault();
     });

    $('body').on('submit', 'form#import-xls-form', function(event) {
        $(this).find('.formAction').toggleClass('hidden');
        event.preventDefault();

        var $items = $('#content .chbitem');
        var $rows = '';
        $(this).find('.KSSCheckItem').each(function() {
            if ($(this).is(':checked'))
            {
                $rows += '-' + $(this).val();
            }
        });

        var data = $(this).serialize() + '&rows=' + $rows;
        var url = _getURL('@@import_xls_form_submit');
        $(this).kss(url, data);
     });

    EDO.loaded['flow.js'] = true;
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

