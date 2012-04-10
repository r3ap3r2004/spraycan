Spraycan.Views.Inspector.Show = Backbone.View.extend({
  events: {
    "click button[rel='zoom-in']": "zoom_in",
    "click button[rel='zoom-out']": "zoom_out",
    "click button[rel='toggle']": "toggle",
    "click button[rel='new_override']": "new_override",
  },

  initialize: function() {
    $(this.el).data('view', this);
    this.hook = this.options.hook;

    this.render();
  },

  calculate_size: function() {
    var height = 0;

    if(Spraycan.editor.maximised){
      height = ($(window).height() - 40);

    }else if(Spraycan.editor.minimised){
      //leave it at default 0
    }else{
      height += 300;
    }

    return height;
  },

  render: function() {
    var compiled = JST["spraycan/templates/editor/inspector/show"];

    $(this.el).html(compiled({hook: this.hook}));
    $('#main').html(this.el);

    if(this.hook!=undefined){
      var details = Spraycan.get_hook_details(this.hook);
      $('#main #source').text(details['source']);
      $('#main #source_template').text(" from " + details['virtual_path']);
    }

    Spraycan.animate_resize(this.calculate_size());
  },

  zoom_in: function() {
    frames[0].hook_zoom('in');
    return false;
  },

  zoom_out: function() {
    frames[0].hook_zoom('out');
    return false;
  },

  toggle: function() {
    frames[0].show_frames = !frames[0].show_frames;
    frames[0].show_hook_frames();
    return false;
  },

  new_override: function() {
    window.location.href = '#view_override?new=' + this.hook;
    console.log(this.hook);
    return false;
  }


});

