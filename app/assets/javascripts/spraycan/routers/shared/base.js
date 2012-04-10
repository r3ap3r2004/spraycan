Spraycan.Routers.Base = Backbone.Router.extend({
  klass: undefined,

  initialize: function(){
    Spraycan[this.klass] = eval("new Spraycan.Collections." + this.klass.camelize() + "()");
    Spraycan[this.klass].bind("reset", this.collection_fetched, this);
    Spraycan[this.klass].bind("reset", this.collection_changed, this);
    Spraycan[this.klass].bind("add", this.collection_changed, this);
    Spraycan[this.klass].bind("remove", this.collection_changed, this);
  },

  edit: function(cid) {
    Spraycan.ensure_fetched(this.klass);

    Spraycan.editor.visible = true;

    model = Spraycan[this.klass].getByCid(cid);

    eval("new Spraycan.Views." + this.klass.camelize() + ".Edit({ model: model })");
    Spraycan.set_current(this.klass, 'edit', model);

    window.location.href ="#"; //reset url as we use client id, can't restart to here.
    return false;
  },

  all: function() {
    Spraycan.set_current(this.klass, 'index');
    Spraycan.ensure_fetched(this.klass);

    eval("new Spraycan.Views." + this.klass.camelize() + ".Index()");
  },

  // fired when collection is retrieved from the server
  collection_fetched: function(collection){
    Spraycan.loaded[this.klass] = true;
  },

  // fired when models are added/removed from collection
  // and when collection is retrieved from the server
  collection_changed: function(collection) {
    //copy any unsaved objects from temporary hiding place
    _.each(Spraycan.new_collections[this.klass], function(model){
      Spraycan[this.klass].add(model, {silent: true});
    }, this);

    //clear temporary hiding place
    Spraycan.new_collections[this.klass] = [];

    if(Spraycan.current==this.klass && Spraycan.current_action=='index'){
      eval("new Spraycan.Views." + this.klass.camelize() + ".Index()");
    }

    //ensure all current collection objects are still present (toolbar)
    Spraycan.current_collections[this.klass] = _.reject(Spraycan.current_collections[this.klass], function(current){
      return !_.any(Spraycan[this.klass].models, function(model){
        return model.cid == current.cid;
      });
    }, this);

    Spraycan.refresh_toolbar();
  },

  new_record: function() {
    var model = new top[this.klass.singularize().camelize()]()
    model.set({ name: 'new_' + model.cid });

    Spraycan[this.klass].add(model);

    eval("new Spraycan.Views." + this.klass.camelize() + ".Edit({ model: model })");

    Spraycan.set_current(this.klass, 'edit', model);

    window.location.href ="#";
    return false;
  },

  delete_record: function(cid,confirm) {
    window.location.href = "/spraycan#" + this.klass.singularize() + "?all";

    if(confirm!="true"){
      var temp = JST["spraycan/templates/shared/confirm_delete"];
      $('#dialogs').html(temp({ klass: this.klass.singularize(), warning: 'Are you really sure that you want to delete this ' + this.klass.singularize().humanize().titleize() + '?', cid: cid}));
      $('#confirm-delete').modal({backdrop: true, keyboard: true, show: true})
    }else{
      // needs to be made multi-editor aware
      // $('.modal.in').modal('hide');
      // $('.modal').hide(); //used by tweaker due to lack of bootstrap styles

      var model = Spraycan[this.klass].getByCid(cid);
      Spraycan[this.klass].remove(model);

      if(model.id!=undefined){
        model.destroy();

        if(this.klass=='view_overrides'){
          Spraycan.reload_frame();
        }
      }
    }
  }

});
