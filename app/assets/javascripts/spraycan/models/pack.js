var Pack = Backbone.Model.extend({
  toJSON: function() {
    var object = new Object;
    object['pack'] = _.clone(this.attributes);

    //remove non-ar attributes:
    _.each(['logo_url', 'background_url', 'background_color'], function(attr){
      delete object['pack'][attr];;
    });

    object['cid'] = this.cid;
    return object;
  },

  klass: function(){
    return 'pack'
  },

  url: function() {
    var base = '/spraycan/packs';
    if (this.isNew()) return base;
    return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
  },

  validate: function(attrs) {
    var errors = new Object;
    var has_errors = false;

    if(attrs.name==""){
      errors['name'] = "Name cannot be blank";
      has_errors = true;
    }

    if(has_errors){
      return errors;
    }
  }
});
