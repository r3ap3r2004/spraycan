Spraycan.Views.Advanced.Index = Backbone.View.extend({
  initialize: function(opts) {
    Spraycan.view = this;

    this.render();
  },

  setup_dirty_tracking: function(){
    Spraycan.set_initial_value('advanced', 'custom-css', Spraycan.ace_editor.getSession().getValue());
  },

  editor_changed: function(evt){
    Spraycan.track_change('advanced', 'custom-css',  Spraycan.ace_editor.getSession().getValue());
  },

  render: function() {
    var compiled = JST["spraycan/templates/selector/advanced/index"];

    $(this.el).html(compiled());
    $('#main').html(this.el);

    Spraycan.ace_editor = ace.edit("custom_css");
    Spraycan.ace_editor.setTheme("ace/theme/vibrant_ink");

    var css_mode = require("ace/mode/css").Mode;
    Spraycan.ace_editor.getSession().setTabSize(2);
    Spraycan.ace_editor.getSession().setMode(new css_mode());

    Spraycan.ace_editor.getSession().setValue(Spraycan.stylesheet.get('css'));
    Spraycan.ace_editor.getSession().doc.on('change', this.editor_changed, this);

    this.setup_dirty_tracking();

    Spraycan.refresh_toolbar('advanced');
  },

  save: function(){
    Spraycan.stylesheet.save({css: Spraycan.ace_editor.getSession().getValue() }, {success: function(){
      Spraycan.handle_save('Custom CSS saved, refreshing store...');
      Spraycan.disable_save();
      Spraycan.reload_styles();
    } });
  }
});
