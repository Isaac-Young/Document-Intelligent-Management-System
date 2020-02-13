(function(global) {
  $.getJSON($('[rel="packages-cache-url"]').attr('href') + '/zopen.message/resources/i18n.json?v=' + EDO.resource_version['zopen.message'], function(obj) {
    // Ensure namespace existence
    if (typeof global.EDO === 'undefined') {
      global.EDO = {};
    }
    if (typeof global.EDO.i18n === 'undefined') {
      global.EDO.i18n = {};
    }
    var _selected = false;
    $.each(obj, function(k, v) {
      if (k === global.EDO.lang) {
        global.EDO.i18n.im = v;
        _selected = true;
        return false; // break
      }
    });
    // fallback to English
    if (!_selected) {
      global.EDO.i18n.im = obj.en;
    }

    // Register a general helper function for Handlebars templates
    // Usage: `{{i18n "namespace.key"}}`, e.g. `{{i18n "im.offline"}}`
    // where `namespace` is key in `EDO.i18n` object
    Handlebars && Handlebars.registerHelper('i18n', function(key_path) {
      function path_attr(obj, paths) {
        return paths.length ? path_attr(obj[paths[0]], paths.slice(1)) : obj;
      }
      try {
        var value = path_attr(window.EDO.i18n, key_path.split('.'));
        return (typeof value === 'string') ? value : key_path;
      } catch (e) {
        window.console && console.warn('Error get i18n value for', key_path);
        return key_path;
      }
    });
  });
})(window);