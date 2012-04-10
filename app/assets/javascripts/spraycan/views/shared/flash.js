Spraycan.Views.Shared.Flash = Backbone.View.extend({
  events: {
    'click .close': 'close'
  },

  initialize: function() {
    this.render();

    setTimeout(this.close, 3000);
  },

  render: function() {
    var compiled = JST["spraycan/templates/shared/flash"];

    $('.flash').remove();
    $(this.el).html(compiled({ level: this.options.level, message: this.options.message }));
    $('#main').before(this.el);
  },

  close: function(){
    $('.flash').remove();
  }
});
