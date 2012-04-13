Spraycan.Views.Fonts.Edit = Backbone.View.extend({
  current_attrs: null,

  events: {
    "submit form": "save"
  },

  initialize: function(opts) {
    Spraycan.view = this;

    this.render();
  },

  setup_dirty_tracking: function(){
    Spraycan.set_initial_value('fonts', 'preferred_store_name_font', Spraycan.preferences.store_name_font);
    Spraycan.set_initial_value('fonts', 'preferred_title_font', Spraycan.preferences.title_font);
    Spraycan.set_initial_value('fonts', 'preferred_body_font', Spraycan.preferences.body_font);

    Spraycan.set_initial_value('fonts', 'preferred_store_name_font_size', Spraycan.preferences.store_name_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_base_font_size', Spraycan.preferences.base_font_size);

    Spraycan.set_initial_value('fonts', 'preferred_header_navigation_font_size', Spraycan.preferences.header_navigation_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_horizontal_navigation_font_size', Spraycan.preferences.horizontal_navigation_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_main_navigation_header_font_size', Spraycan.preferences.main_navigation_header_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_main_navigation_font_size', Spraycan.preferences.main_navigation_font_size);

    Spraycan.set_initial_value('fonts', 'preferred_product_list_name_font_size', Spraycan.preferences.product_list_name_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_product_list_price_font_size', Spraycan.preferences.product_list_price_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_product_list_header_font_size', Spraycan.preferences.product_list_header_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_product_list_search_font_size', Spraycan.preferences.product_list_search_font_size);

    Spraycan.set_initial_value('fonts', 'preferred_product_detail_name_font_size', Spraycan.preferences.product_detail_name_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_product_detail_description_font_size', Spraycan.preferences.product_detail_description_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_product_detail_price_font_size', Spraycan.preferences.product_detail_price_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_product_detail_title_font_size', Spraycan.preferences.product_detail_title_font_size);

    Spraycan.set_initial_value('fonts', 'preferred_heading_font_size', Spraycan.preferences.heading_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_sub_heading_font_size', Spraycan.preferences.sub_heading_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_button_font_size', Spraycan.preferences.button_font_size);
    Spraycan.set_initial_value('fonts', 'preferred_input_box_font_size', Spraycan.preferences.input_box_font_size);
  },

  render: function() {
    var compiled = JST["spraycan/templates/selector/fonts/edit"];

    $(this.el).html(compiled({display_name: this.display_name, themes: this.themes}));
    $('#main').html(this.el);

    this.setup_dirty_tracking();


    Spraycan.refresh_toolbar('fonts');

    $('#store_name_font').googleFontPicker({
      defaultFont: Spraycan.preferences.store_name_font,
      callbackFunc: function(fontFamily){
        var val = fontFamily.split(',')[0];
        $("input#preferred_store_name_font").val(val);

        Spraycan.track_change('fonts', 'preferred_store_name_font', val);
      }
    });

    $('#title_font').googleFontPicker({
      defaultFont: Spraycan.preferences.title_font,
      callbackFunc: function(fontFamily){
        var val = fontFamily.split(',')[0];
        $("input#preferred_title_font").val(val);

        Spraycan.track_change('fonts', 'preferred_title_font', val);
      }
    });

    $('#body_font').googleFontPicker({
      defaultFont: Spraycan.preferences.body_font,
      callbackFunc: function(fontFamily){
        var val = fontFamily.split(',')[0];
        $("input#preferred_body_font").val(val);

        Spraycan.track_change('fonts', 'preferred_body_font', val);
      }
    });

    $("#tab-fonts .slider").each(function(){
      var size_el = $(this).next().find('input');
      var size_value = parseInt(size_el.attr('value'));

      var slider = $(this).slider({
        range: "min",
        value: size_value,
        min: 1,
        max: 30,
        slide: function(event, ui) {
          Spraycan.track_change('fonts', size_el.attr('id'), ui.value);

          size_el.val(ui.value)
        }
      });

      size_el.keyup(function(){

        slider.slider("value", parseInt(size_el.attr('value')));
      });
    });

    $('.toolbar nav.actions li.show-hide').show();
  },

  save: function(event){
    if(event!=undefined){
      event.preventDefault();
    }
    // Spraycan.clear_errors();

    this.current_attrs = $('form#fonts_form').serializeObject();

    prefs = new Spraycan.Collections.Preferences();

    _.each(this.current_attrs, function(value, key){
      prefs.add({
        configuration: "Spraycan::Config",
        name: key,
        value: value
      });
    });

    Backbone.sync('create', prefs, {
      success: function(model, resp) {
        Spraycan.reload_styles();

        _.each(Spraycan.view.current_attrs, function(value, attr){
          Spraycan.preferences[attr] = value;
        });
        Spraycan.view.setup_dirty_tracking();
        Spraycan.disable_save();

      },
      error: Spraycan.handle_save_error
    });

    return false;

   }

});
