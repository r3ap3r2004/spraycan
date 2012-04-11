Spraycan.Views.Packs.Index = Backbone.View.extend({
  events: {
    "click li.pack a": "show_selected"
  },

  initialize: function() {
    Spraycan.view = this;

    this.render();
  },

  render: function() {
    var compiled = JST['spraycan/templates/selector/packs/index'];

    $(this.el).html(compiled({ packs : Spraycan.packs.models }));

    $('#main').html(this.el);


    Spraycan.refresh_toolbar('themes');

    return this;
  },

  show_selected: function(sel){
    $(sel.currentTarget).parents('ul').find('li').removeClass('active');
    $(sel.currentTarget).parents('li').addClass('active');
  }

});
