Spraycan.Views.Themes.Index = Backbone.View.extend({
  events: {
    "click #themes_list a.edit": "load_theme",
    "click li:not(.disabled) a[rel='new']": "new_theme",
    "click li:not(.disabled) a[rel='save']": "save_theme"
  },

  initialize: function() {
    this.render();
  },

  calculate_size: function() {
    var height = 0;

    if(Spraycan.editor.maximised){
      if(this.code_editor!=null){
        $(this.code_editor.container).height($(window).height() - 170);
        this.code_editor.resize();
      }
    }else{
      height += 300;
    }

    return height;
  },

  render: function() {
    Spraycan.editor.minimised = false;
    Spraycan.editor.visible = true;

    Spraycan.view = this;

    var compiled = JST['spraycan/templates/editor/themes/index'];

    $(this.el).html(compiled({ collection : Spraycan.themes }));
    $('#main').html(this.el);

    $('.sortable tbody').sortable({
      axis: 'y',
      dropOnEmpty:false,
      handle: '.handle',
      cursor: 'crosshair',
      items: 'tr',
      opacity: 0.9,
      scroll: true,
      update: function(e,ui){
        var id = ui.item.attr('data-id');
        var new_position = ui.item.index();
        var theme = _.detect(Spraycan.themes.models, function(t) { return t.id == id });

        Spraycan.view.save_theme_record(theme,{position: new_position});
      }
    });

   $('table#themes').tableScroll({height:195});

    Spraycan.animate_resize(this.calculate_size());
    return this;
  },

  load_theme: function(e) {
    var id = $(e.target).attr('data-theme-id');
    var theme = _.detect(Spraycan.themes.models, function(t) { return t.id == id });

    this.model = theme;

    var compiled = JST['spraycan/templates/themes/edit'];
    $('#theme_details').html(compiled({ model : this.model }));

    $("a[rel='delete']").parent().removeClass('disabled');
    $("a[rel='save']").parent().removeClass('disabled');
  },

  save_theme: function(e) {
    Spraycan.clear_errors();

    attrs =  $('form#theme_form').serializeObject();
    if(attrs.active==undefined){
      attrs.active = false;
    }
    this.save_theme_record(this.model, attrs)

    return false;
  },

  save_theme_record: function(theme, attrs){
    theme.save(attrs, {
      success: function(model, resp) {
        frames[0].location.href = frames[0].location.href;

        if(Spraycan.themes.get(model.get('id'))!=undefined){
          Spraycan.themes.remove(Spraycan.themes.get(model.get('id')), {silent: true});
        }

        Spraycan.themes.add(model);
      },
      error: Spraycan.handle_save_error
    });
  },

  new_theme: function(e) {
    this.model = new Theme();

    var compiled = JST['spraycan/templates/themes/edit'];

    $("a[rel='delete']").parent().addClass('disabled');
    $("a[rel='save']").parent().removeClass('disabled');

    $('#theme_details').html(compiled({ model : this.model }));

    $('#file1').change(function() {
      $("a[rel='save']").parent().addClass('disabled');

      $(this).upload('/spraycan/themes/import.js', function(res) {
        frames[0].location.href = frames[0].location.href;
        Spraycan.themes.fetch();
      }, 'script');
    });
  }

});
