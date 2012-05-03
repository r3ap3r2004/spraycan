Spraycan.Routers.Layouts = Backbone.Router.extend({
  routes: {
    "tab-layouts": "index",
	"tab-layouts-product-detail": "index",
	"tab-layouts-product-listing": "index",
	"tab-layouts-cart": "index",
  },

  index: function(){
    new Spraycan.Views.Layouts.Index();
  }
});
