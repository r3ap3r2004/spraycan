Spraycan.Routers.Palettes = Spraycan.Routers.Base.extend({
  klass: 'palettes',

  routes: {
    "tab-colors": "all",
    "palette?all": "all",
    "palette/:cid": "edit",
    "palette?new": "new_record",
    "palette?delete=:cid&confirm=:confirm": "delete_record",
    "palette?switch=:cid": "switch_palette",
    "palette?edit_current": "edit_current"
  },

  switch_palette: function(cid) {
    var palette = Spraycan.palettes.getByCid(cid);

    _.each(Spraycan.palettes.models, function(p){
      if(p!=palette){
        p.set({active: false});
      }
    });

    palette.save({active: true}, {
      success: function(model, resp) {
        Spraycan.handle_save('Palette enabled, refreshing store...');
        Spraycan.reload_styles();
      },
      error: Spraycan.handle_save_error
    });
  },

  edit_current: function(){
    _.each(Spraycan.palettes.models, function(palette){
      if(palette.get('active')){
        this.edit(palette.cid);
      }
    }, this);
  }

});
