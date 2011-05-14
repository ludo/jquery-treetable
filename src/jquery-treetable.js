(function($) {
  $.treeTable = function(element, options) {
    var plugin = this;

    var defaults = {};

    plugin.settings = {};

    var $element = $(element),
        element = element;

    plugin.init = function() {
      plugin.settings = $.extend({}, defaults, options)
    };

    plugin.init();
  };

  $.fn.treeTable = function(options) {
    return this.each(function() {
      var plugin = new $.treeTable(this, options);
      $(this).data('treeTable', plugin);
    });
  };
})(jQuery);
