Spraycan.Views.Palettes.Edit = Backbone.View.extend({
  current_color_picker: null,

  events: {
    "click input.back": "back"
  },

  initialize: function() {
    Spraycan.view = this;

    $(this.el).data('view', this);
    this.model = this.options.model;

    this.render();
  },

  setup_dirty_tracking: function(pallete){
    Spraycan.set_initial_value('palettes-' + pallete.cid, 'name', pallete.get('name'));

    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_layout_background_color', pallete.get('preferred_layout_background_color'));
    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_product_background_color', pallete.get('preferred_product_background_color'));

    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_title_text_color', pallete.get('preferred_title_text_color'));
    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_body_text_color', pallete.get('preferred_body_text_color'));
    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_link_text_color', pallete.get('preferred_link_text_color'));

    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_product_title_text_color', pallete.get('preferred_product_title_text_color'));
    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_product_body_text_color', pallete.get('preferred_product_body_text_color'));
    Spraycan.set_initial_value('palettes-' + pallete.cid, 'preferred_product_link_text_color', pallete.get('preferred_product_link_text_color'));
  },

  save: function(event) {
    if(event!=undefined){ event.preventDefault(); }

    Spraycan.clear_errors();

    attrs = $('form#new-palette-form').serializeObject();

    this.model.save(attrs, {
      success: function(model, resp) {
        Spraycan.handle_save();

        Spraycan.reload_styles();
        Spraycan.view.setup_dirty_tracking(model);
        Spraycan.disable_save();
      },
      error: Spraycan.handle_save_error
    });

    return false;
  },

  back: function(){
    window.location.href = "#tab-colors";
  },

  render: function() {
    var compiled = JST["spraycan/templates/selector/palettes/edit"];
    $(this.el).html(compiled(this.model.toJSON()));

    this.setup_dirty_tracking(this.model);

    $('#main').html(this.el);

    $('#new-palette-form #name').keyup(function(evt){
      Spraycan.track_change('palettes-' + Spraycan.view.model.cid, 'name', $(evt.currentTarget).val());
    });

    $('#new-palette .picker').ColorPicker({
      onBeforeShow: function (x,y,z,f) {
        Spraycan.view.current_color_picker = $(this)
        $(this).ColorPickerSetColor($(this).find('input').val());
      },
	    onSubmit: function(hsb, hex, rgb, el) {
		    Spraycan.view.current_color_picker.find('input').val('#' + hex);
		    $(el).ColorPickerHide();
	    },
      onChange: function (hsb, hex, rgb) {
        Spraycan.view.current_color_picker.find('.sample').css('backgroundColor', '#' + hex);
        var input = Spraycan.view.current_color_picker.find('input')
        input.val('#' + hex);

        Spraycan.track_change('palettes-' + Spraycan.view.model.cid, input.attr('name'), '#' + hex);
    	} });

    return this;
  }
});

