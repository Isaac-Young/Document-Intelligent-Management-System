;(function ($) {
    $.fn.edo_select_file = function (options) {

        options = $.extend({}, {
            multiple: true,
            success: function () {}
        }, options);

        var $self   =   $(this),
            $w      =   $(window);

        if ($self.length > 1) {
            $self.each(function (i, el) {
                $(el).edo_select_file(options);
            });
            return $self;
        }

        $w.unbind('message').bind('message', function (e) {
            e.preventDefault();
            var $data = jQuery.parseJSON((e.originalEvent.data));
            if ($data.mode === 'select' &&
                options.server.search(new RegExp('^' + e.originalEvent.origin)) !== -1) {
                success($data.items);
                $.modal.close();
            }
        });

        function success (data) {
            options.success.call($self, data);
         }

        $self.bind('click', function () {

            if (!options.server) {
                throw new Error('server is required');
            }

            var $closeReplacer = $('<a href="#">X</a>').css({
                backgroundColor: '#fff',
                color: '#000',
                position: 'absolute',
                right: -12,
                top: -10,
                fontWeight: 'bold',
                fontSize: '11px',
                borderRadius: 12,
                width: 20,
                lineHeight: '20px',
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'
            });

            $.modal('<iframe src="' + options.server + '/embed.html?multiple=' + options.multiple + '" height="380" width="545" frameBorder="0" style="border:0;">', {
                closeHTML: $closeReplacer,
                containerCss: {
                  backgroundColor: "#fff",
                  height: 380,
                  padding: 12,
                  width: 545,
                  backgroundClip: 'padding-box',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  boxShadow: '0 3px 7px rgba(0, 0, 0, 0.3)'
                },
                opacity: 30,
                overlayCss: {
                  backgroundColor: '#000'
                },
                zIndex: 9999999
            });
        });

        return $self;
    };
})(jQuery);
