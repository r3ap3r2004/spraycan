var Spraycan = {
  Views: {Shared: {}, Layouts: {}, Palettes: {}, Fonts: {}, Images: {}, Packs: {}, Advanced: {} },
  Routers: {},
  Collections: {},

  current: null,

  current_action: null,

  view: null,

  editor: {minimised: false, maximised: false, visible: false },

  loaded: {},

  busy: { ajax: false, iframe: true },

  //holds the last x models opened for each class
  current_collections: {},

  //holds unsaved models when main collection is being fetched
  new_collections: {themes: []},

  theme_id: null,

  preload: { },

  preferences: { },

  changes: {},

  ace_editor: null,

  init: function() {
    //ajax activity indicators
    $(document).ajaxSend(function() {
      Spraycan.busy.ajax = true;
      Spraycan.busy_indicator();
    });
    $(document).ajaxStop(function() {
      Spraycan.busy.ajax = false;
      Spraycan.busy_indicator();
    });


    Spraycan.themes = new Spraycan.Collections.Themes();
    Spraycan.palettes = new Spraycan.Collections.Palettes();
    Spraycan.packs = new Spraycan.Collections.Packs();

    new Spraycan.Routers.Selector();
    new Spraycan.Routers.Layouts();
    new Spraycan.Routers.Palettes();
    new Spraycan.Routers.Fonts();
    new Spraycan.Routers.Images();
    new Spraycan.Routers.Packs();
    new Spraycan.Routers.Advanced();

    Spraycan.reset_collections(); //initializes collection routers aswell
    Spraycan.preload_data();


    Backbone.history.start();

    // Assign editor html block to a variable
    var editor = $("#spreeworks-editor");

    // Set additional classes to editor for crossbrowser fixes
    if($.browser.webkit){
      editor.addClass('browser-webkit browser-version-'+$.browser.version);
    }
    else if($.browser.msie){
      editor.addClass('browser-ie browser-version-'+$.browser.version); 
    }
    else if($.browser.mozilla){
      editor.addClass('browser-mozilla browser-version-'+$.browser.version); 
    }
    else if($.browser.opera){
      editor.addClass('browser-opera browser-version-'+$.browser.version); 
    }

    // Bind hiding editor content to X icon on toolbar
    editor.find('.toolbar nav.actions li.show-hide span.icon').click(function(){
      var tab = editor.find('.content');
      tab.hide();

      window.location.href = "#";

      editor.find('.toolbar nav.tabs li.active').removeClass('active');
      $(this).parent().hide();
    })

    // Disable click on .disabled class
    editor.find('.toolbar nav.actions li.disable span.icon').click(function(e){
      e.preventDefault();
    })

    // Make editor draggable
    editor.draggable({
      handle: 'nav.actions li.drag',
      start: function () {
        $("iframe").each(function (index, element) {
        var d = $('<div class="iframeCover" style="zindex:999;position:absolute;width:100%;top:0px;left:0px;height:' + $(element).height() + 'px"></div>');
        $(element).before(d);});
      },
      stop: function () {
        $('.iframeCover').remove();
        $("#spreeworks-editor").css({
          position: 'fixed'
        });
      }
    });


    Spraycan.preload_fonts();

  },

  preload_data: function(){
    Spraycan.themes.reset(Spraycan.preload.themes);
    Spraycan.loaded.themes = true;

    Spraycan.palettes.reset(Spraycan.preload.palettes);
    Spraycan.loaded.palettes = true;

    Spraycan.packs.reset(Spraycan.preload.packs);
    Spraycan.loaded.packs = true;

    Spraycan.stylesheet = new Stylesheet(Spraycan.preload.custom_stylesheet);
  },

  reset_collections: function(){
    Spraycan.loaded = { themes: false, palettes: false };

    Spraycan.current_collections = { themes: []};

    Spraycan.new_collections = { themes: [] };
  },

  set_current: function(group, action, model){
    Spraycan.current = group;
    Spraycan.current_action = action;
  },

  refresh_toolbar: function(current){
    if(current!=undefined){
      Spraycan.disable_save();

      var editor = $("#spreeworks-editor");
      editor.find(".tabs .active").removeClass('active');
      editor.find(".tabs ." + current).addClass('active');

      editor.find(".content")
          .removeClass('active-layouts active-colors active-fonts active-images active-themes active-advanced')
          .addClass('active-' + current)
          .find(".tab.active")
          .hide()
          .removeClass('active');

      editor.find(".content")
        .show()
        .find(".tab#tab-" + current)
        .show()
        .addClass('active');

      $('.toolbar nav.actions li.show-hide').show();

      if($("#spreeworks-editor .toolbar").offset().top > $(window).height()){
        editor.css({top:''});
        console.log('off');
      }
    }
  },

  enable_save: function(){
    $('.toolbar nav.actions li.save').removeClass('disabled').addClass('enabled');
  },

  disable_save: function(){
    $('.toolbar nav.actions li.save').removeClass('enabled').addClass('disabled');
  },

  reload_frame: function(){
    window.frames[0].location.reload();
  },

  reset_url: function(){
    window.location.href = "#";
  },

  reload_styles: function(){
    window.frames[0].$('link#compiled_stylesheets').attr('href', '/spraycan/compiled/' + Date.now() + '.css');
  },

  ensure_fetched: function(collection){
    if(!Spraycan.loaded[collection]){
      Spraycan.new_collections[collection] = _.select(Spraycan[collection].models, function(model){
        return model.get('id') == undefined;
      });

      Spraycan[collection].fetch({
        error: function() {
          Spraycan.loaded[collection] = false;
          new Error({ message: "Error loading collection." });
        }
      });
    }
  },

  iframe_busy: function(state){
    Spraycan.busy.iframe = state;
    Spraycan.busy_indicator();
  },

  busy_indicator: function(){
    if(Spraycan.busy.iframe || Spraycan.busy.ajax){
      $('.toolbar nav.actions li.ajax-spinner').show();
    }else{
      $('.toolbar nav.actions li.ajax-spinner').hide();
    }
  },

  set_initial_value: function(view, field, value){
    if(Spraycan.changes[view]==undefined){
      Spraycan.changes[view] = {}
    }

    Spraycan.changes[view][field] = { initial: value, current: value };
  },

  track_change: function(view, field, value){
    Spraycan.changes[view][field]['current'] = value;

    if(Spraycan.has_changes(view)){ 
      Spraycan.enable_save();
    }else{
      Spraycan.disable_save();
    }
  },

  has_changes: function(view){
    return _.any(Spraycan.changes[view], function(field){
      if(field['current']==undefined){
        return false
      }else{
        return field['current']!=field['initial'] 
      }
    });
  },

  preload_fonts: function(){
    // load google fonts
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  },

  handle_save_error: function(model, errors){
    if(errors.statusText==undefined){
      new Spraycan.Views.Shared.Flash({ level: 'error', message: 'Form is invalid and cannot be saved.' });

      _.each(errors, function(message, field){
        $("[name='" + field + "']").addClass('error');
        $("[name='" + field + "']").after("<span title='" + message + "' class='error_icon'>E<span>")
      });
    }else{
      Spraycan.handle_error();
    }
  },

  clear_errors: function(){
    $('.flash').remove();

    $(".error").removeClass("error");
    $(".error_icon").remove();
  },

  handle_error: function(){
    new Spraycan.Views.Shared.Flash({ level: 'error', message: 'An unexpected error occurred, please try again.' });
  },

  handle_save: function(message){
    if(message==undefined){
      message = 'Record saved successfully.';
    }
    new Spraycan.Views.Shared.Flash({ level: 'success', message: message });
  }
};
