module Spraycan
  class CompilerController < BaseController
    include Sprockets::Helpers::RailsHelper
    caches_page :css, :js

    def css
      #combine all active stylesheets into a single string

      @custom_stylesheet = nil

      @source = Theme.active.inject("") do |src, theme|
        src << theme.stylesheets.inject("") do |s, stylesheet|

          if stylesheet.id == Spraycan::Config.custom_stylesheet_id
            #do not include custom stylsheet in main body
            #as we don't want it bassed to ERB renderer
            #for fear of evil code!
            @custom_stylesheet = stylesheet
          else
            s << stylesheet.css.to_s
          end

          s
        end
      end

      #pass to erb compiler first, to have preference values included
      @template = Erubis::Eruby.new(@source)
      palette = Spraycan::Palette.where(:active => true).first
      evaluated = @template.result(binding())

      #re-include custom css as it's safe now (only sass compiler next)
      evaluated << @custom_stylesheet.try(:css).to_s

      #sass compiler second, to re-use core's themes variables
      sass_engine = Sass::Engine.new(evaluated, :syntax => :scss)

      #return
      render :text => sass_engine.render, :content_type => "text/css"
    end

    def js
      @source = Theme.active.inject("") do |src, theme|
        src << theme.javascripts.inject("") do |s, javascript|
          s << javascript.body
        end
      end

      @template = Erubis::Eruby.new(@source)
      palette = Spraycan::Palette.where(:active => true).first

      render :text => @template.result(binding()), :content_type => "text/js"
    end

    private
      def authenticate_spraycan
        #always allowed
      end

      def controller
        self
      end
  end
end
