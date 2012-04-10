Spraycan.Routers.Packs = Spraycan.Routers.Base.extend({
  klass: 'packs',

  routes: {
    "tab-themes": "all",
    "pack?all": "all",
    "pack/:cid": "edit",
    "pack?new": "new_record",
    "pack?delete=:cid&confirm=:confirm": "delete_record",
    "pack?switch=:cid": "switch_pack",
    "pack?edit_current": "edit_current"
  },

  switch_pack: function(cid) {
    var pack = Spraycan.packs.getByCid(cid);

    //disable all other packs
    _.each(Spraycan.packs.models, function(p){
      if(p!=pack){
        p.set({active: false});
      }
    });



    pack.save({active: true}, {
      success: function(model, resp) {
        Spraycan.reload_frame();
        Spraycan.handle_save();

        $.getScript("/spraycan/state.js", function(data, textStatus, jqxhr) {
          Spraycan.preload();
        });
      },
      error: Spraycan.handle_save_error
    });

    window.location.href = "#tab-themes";
  },

  edit_current: function(){
    _.each(Spraycan.packs.models, function(pack){
      if(pack.get('active')){
        this.edit(pack.cid);
      }
    }, this);
  }

});
