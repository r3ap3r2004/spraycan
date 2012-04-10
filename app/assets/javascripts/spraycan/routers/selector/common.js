Spraycan.Routers.Selector = Backbone.Router.extend({
  routes: {
    "save": "save_active",
    "theme?apply=:cid": "apply_theme",
    "cancel_dialog": "cancel_dialog",
  },

  save_active: function(){
    if(Spraycan.view!=null){
      Spraycan.view.save()
    }
    window.location.href ="#";
  },

  apply_theme: function(cid){
    var theme = Spraycan.themes.getByCid(cid);
    theme.save({active: true}, {
      success: function(model, resp) {
        Spraycan.handle_save();

        //mark other themes in group to inactive
        _.each(Spraycan.themes.models, function(t){
          if(theme.get('applies_to')==t.get('applies_to') && theme.cid!=t.cid){
            t.set({active: false});
          }
        });

        Spraycan.reload_frame();
        Spraycan.reset_url();
      },
      error: Spraycan.handle_save_error
    });
  },

  cancel_dialog: function() {
    window.location.href ="#";
    $('.modal').hide();
  },

});

