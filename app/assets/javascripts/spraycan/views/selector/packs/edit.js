Spraycan.Views.Packs.Edit = Backbone.View.extend({
  events: {
    "click input.back": "back"
  },

  initialize: function() {
    Spraycan.view = this;

    $(this.el).data('view', this);
    this.model = this.options.model;

    this.render();
  },

  setup_dirty_tracking: function(pack){
    Spraycan.set_initial_value('packs-' + pack.cid, 'name', pack.get('name'));
  },

  save: function(event) {
    if(event!=undefined){
      event.preventDefault();
    }

    Spraycan.clear_errors();
    attrs = $('form#new-theme-form').serializeObject();
    attrs.import = $("form#new-theme-form [name='import']").is(':checked');


    this.model.save(attrs, {
      success: function(model, resp) {
        Spraycan.handle_save('Theme saved successfully.');

        Spraycan.view.setup_dirty_tracking(model);
        Spraycan.disable_save();
      },
      error: Spraycan.handle_save_error
    });

    return false;
  },

  back: function(){
    window.location.href = "#tab-themes";
  },

  render: function() {
    var compiled = JST["spraycan/templates/selector/packs/edit"];
    $(this.el).html(compiled(this.model.toJSON()));

    this.setup_dirty_tracking(this.model);

    $('#main').html(this.el);

    $('#new-theme-form #name').keyup(function(evt){
      Spraycan.track_change('packs-' + Spraycan.view.model.cid, 'name', $(evt.currentTarget).val());
    });

    return this;
  }
});
