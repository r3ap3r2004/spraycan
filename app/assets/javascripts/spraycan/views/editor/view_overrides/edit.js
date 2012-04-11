Spraycan.Views.ViewOverrides.Edit = Backbone.View.extend({
  show_form: false,
  show_text_editor: false,
  show_advanced: false,
  show_attributes_editor: false,
  code_editor: null,

  events: {
    "click button[rel='save']:not(.disabled)": "save",
    "click a[rel='advanced']:not(.disabled)": "advanced",
    "change select[name='replace_with']": "set_replacement",
    "change select[name='target']": "set_replacement",
    "change input" :"changed",
    "change select" :"changed",
    "change textarea" :"changed"
  },

  initialize: function() {
    Spraycan.view = this;

    this.bind('editor:resize', this.handle_resize);

    $(this.el).data('view', this);
    this.show_form = true;
    this.model = this.options.model;
    this.render();
  },

  handle_resize: function(){
    if(this.code_editor!=null){

      if(Spraycan.editor.maximised){

        if(this.show_advanced){
          $(this.code_editor.container).height($(window).height() - 290);
        }else{
          $(this.code_editor.container).height($(window).height() - 210);
        }

        this.code_editor.resize();
      }else{
        $(this.code_editor.container).height(150);
        this.code_editor.resize();
      }
    }
  },

  save: function() {
    Spraycan.clear_errors();

    attrs = $('form#view_override_form').serializeObject();
    if(attrs.disabled==undefined){
      attrs.disabled = false;
    }

    //removes unwanted prepended forward slashes / from rails virtual paths
    attrs.virtual_path = attrs.virtual_path.replace(/^\//, '');

    var replacement = $("select[name='replace_with']").val();
    var target = $("select[name='target']").val();

    if(target=="set_attributes" || target=="add_to_attributes" || target=="remove_from_attributes"){
      attrs.replacement = $("#replace_" + target).val();
      attrs.replace_with = target;
    }else if(replacement=='text'){
      attrs.replacement = this.code_editor.getSession().getValue();
    }else{
      attrs.replacement = $("#replace_" + replacement).val();
    }

    this.model.save(attrs, {
      success: function(model, resp) {
        Spraycan.reload_frame();

        $("a[rel='delete']").html('Delete');
      },
      error: Spraycan.handle_save_error
    });

    return false;
  },

  close: function(){
    current = this.model;

    if(current.id==undefined){


      _.each(Spraycan.view_overrides.models, function(override){
        if(override.cid == current.cid){
          Spraycan.view_overrides.remove(override);
        }
      });

    }else if(current.changed==true){
     console.log(current);
    }

    window.location.href = "#view_override?all";
    return false;
  },

  advanced: function() {
    this.show_advanced = !this.show_advanced;

    Spraycan.view.trigger('editor:resize');

    Spraycan.animate_resize(this.calculate_size());
    $('#view_override_form .advanced').toggle();
    return false;
  },

  changed: function(evt) {
    var field = $(evt.currentTarget);
    var name = field.attr('name');

    if(name=='disabled'){
      this.set_change(name, field.is(":checked"));
    }else{
      this.set_change(name, field.val());
    }

  },

  editor_changed: function(evt){
    Spraycan.view.set_change("replacement", Spraycan.view.code_editor.getSession().getValue());
  },

  set_change: function(name, value){
    var attrs = {};
    attrs[name] = value;

    this.model.set(attrs);
  },

  calculate_size: function() {
    var height = 60;

    if(this.show_form){

      if(this.show_text_editor && this.code_editor!=null){
        height += 300;
      }else{
        height += 150;
      }

      if(this.show_advanced){
        height += 60;
      }

      if(this.show_attributes_editor){
        height += 40;
      }
    }

    return height;
  },

  set_replacement: function() {
    var replacement = $("select[name='replace_with']").val();
    var target = $("select[name='target']").val();

    $('div#replace_withs > div').hide();

    if(target=='remove' || target=='remove_contents'){
      $('div#replace_withs').hide();
      this.show_text_editor = false;
    }else{
      $('div#replace_withs').show();

      $('div#replace_withs .fields').attr('disabled','true');

      var field;

      if(target=="set_attributes" || target=="add_to_attributes" || target=="remove_from_attributes"){
        this.show_attributes_editor = true;
        this.show_text_editor = false;

        this.code_editor = null;
        field = $("#replace_" + target);
        field.removeAttr('disabled');
        field.val(this.model.get('replacement'));

        $("select[name='replace_with']").attr('disabled','true');
        $('div#replace_with_' + target).show();

      }else{
        this.show_attributes_editor = false;
        this.show_text_editor = true;

        $('div#replace_with_' + replacement).show();

        $("select[name='replace_with']").removeAttr('disabled');

        if(replacement=="text"){
          this.show_text_editor = true;
          var editor_height = 17

          if(Spraycan.editor.maximised){
            editor_height = $(window).height() - 170;
          }

          $("#view_override_replace_text").height(editor_height);
          this.code_editor = ace.edit("view_override_replace_text");

          this.code_editor.setTheme("ace/theme/vibrant_ink");

          var html_mode = require("ace/mode/html").Mode;
          this.code_editor.getSession().setTabSize(2);
          this.code_editor.getSession().setMode(new html_mode());
          if(this.model.get('replacement')!=null){
            this.code_editor.getSession().setValue(this.model.get('replacement'));
          }

          this.code_editor.getSession().doc.on('change', this.editor_changed, {view: this});

        }else if(replacement=="partial"){
          this.code_editor = null;
          field = $("#replace_parital");
          field.val(this.model.get('replacement'));
        }else if(replacement=="template"){
          this.code_editor = null;
          field = $("#replace_template");
          field.val(this.model.get('replacement'));
        }else if(replacement=="cut"){
          this.code_editor = null;
          field = $("#replace_cut");
          field.val(this.model.get('replacement'));
        }else if(replacement=="copy"){
          this.code_editor = null;
          field = $("#replace_copy");
          field.val(this.model.get('replacement'));
        }
      }

      if(field!=undefined){
        field.removeAttr('disabled');
      }

    }

    Spraycan.view.trigger('editor:resize');

    Spraycan.animate_resize(this.calculate_size());

  },

  render: function() {
    Spraycan.editor.minimised = false;
    Spraycan.editor.visible = true;

    var compiled = JST['spraycan/templates/editor/view_overrides/edit'];

    if(this.model.get('hook')!=undefined){
      hook_name = this.model.get('hook');

      if(hook_name=="new_override"){
      }else{
        var details = Spraycan.get_hook_details(hook_name)

        this.model.set( {virtual_path: details['virtual_path'], replacement: details['source'] } );
      }

      //todo finish this unset to remove hook attr
      this.model.unset('hook')
    }

    $(this.el).html(compiled(this.model.toJSON()));
    $('#main').html(this.el);

    this.set_replacement();

    return this;
  }
});
