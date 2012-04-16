Spraycan.Routers.Advanced = Backbone.Router.extend({
  routes: {
    "tab-advanced": "edit",
  },

  edit: function(){
    new Spraycan.Views.Advanced.Index();
  }
});
