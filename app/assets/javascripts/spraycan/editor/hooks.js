var $jQ = jQuery.noConflict(true);

//set hook frame positions
var show_frames = false;
var frame_level = 0;

function show_hook_frames(){
  if(show_frames){
    if($jQ("[data-hook]").length==0){
      top.Spraycan.show_dialog('No hook defined', 'The current page does not contain any data-hook elements.');
    }

    $jQ.each($jQ("[data-hook]"), function(i, hook){
      var hooks = $jQ(hook).parents().filter(function(i,p) { return $jQ(p).attr("data-hook")!=undefined });
      if(hooks.length == frame_level){
        var hook = $jQ(hook);
        if(hook.attr('id')!="" || hook.attr('data-hook')!=""){
          hook.attr('data-layer', frame_level);

          hook.addClass('spraycan_hook_frame');
        }
      }
    });
  }else{
    $jQ('.spraycan_hook_frame').removeClass('spraycan_hook_frame');

  }
}

function find_hook_frame(event){
  var target = $jQ(this);

  if(target.hasClass('spraycan_hook_frame')){
    show_hook_details(target);
  }else{
    parents = target.parents('.spraycan_hook_frame');

    if(parents.length>0){
      show_hook_details($jQ(parents[0]));
    }

  }
}

function show_hook_details(target){
  var hook_name = target.attr('data-hook');

  if(hook_name==""){
    hook_name = target.attr('id');
  }

  top.location.href = "/spraycan#inspect/" + hook_name;
}


function hook_zoom(in_or_out){
  show_frames = true;
  var current_level = frame_level;

  if(in_or_out=="in"){
    frame_level = current_level + 1;
  }else{
    frame_level = current_level - 1;
  }

  if(frame_level!=current_level){
    $jQ('.spraycan_hook_frame').removeClass('spraycan_hook_frame');

    show_hook_frames();

    //check we haven't zoomed to far in or out,
    //undo if we did
    if($jQ('.spraycan_hook_frame').length==0){
      frame_level = current_level;

      show_hook_frames();
    }
  }
}

$jQ(function() {
  if(top.Spraycan!=undefined){
    top.Spraycan.iframe_busy(false);

    $jQ('*').bind('mouseenter', find_hook_frame);
    show_hook_frames();
  }else{

    // $jQ(document).bind('keypress.e', function(){
    //   // If there is no div with spraycan-loader id (check to prevent double add of div)
    //   if ($("#spraycan-loader").length < 1){

    //     // Apepnd white div with loading sign (hidden)
    //     $(this).find('body').append('<div id="spraycan-loader" style="display: none; position: absolute; left: 0; top: 0; width: '+$(document).width()+'px; height: '+$(document).height()+'px; background-color: white;"><h1 style="text-align: center; margin-top: 200px; color: #333;">Spraycan editor is loading ...</h1></div>')
    //     // Fade in that div and after it shows reload page
    //     $(this).find("#spraycan-loader").fadeIn('1500', function(){
    //       window.location.href="/spraycan?goto=" + escape(window.location.href);
    //     });
    //   }
    // });

  }
});

//show activity while iframe is loading
window.onbeforeunload = function() {
  if(top.Spraycan!=undefined){
    top.Spraycan.iframe_busy(true);
  }
}

