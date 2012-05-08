module Spraycan
  class BootController < Spraycan::BaseController

    def editor
      #only support non-ssl as we are enteracting with an iframe
      if request.ssl?
        redirect_to :protocol => 'http://', :action => 'editor'
        return
      end

      #editor boot method
      if Theme.active.empty?
        if Theme.all.empty?
          Theme.create(:name => "Site Theme", :active => true)
        else
          Theme.first.update_attribute(:active, true)
        end
      end

      if session[:full] && Rails.application.config.spraycan.enable_editor
        render :action => "editor", :layout => false
      else
        session[:full] = false

        load_objects

        render :action => "selector", :layout => false
      end
    end

    def mini
      session[:full] = false
      redirect
    end

    def full
      session[:full] = true
      redirect
    end

    def toggle
      session[:full] = !session[:full]
      redirect
    end

    def state
      load_objects
      @themes_json = render_to_string(:file => 'spraycan/themes/index.json.rabl') 
      @palettes_json = render_to_string(:file => 'spraycan/palettes/index.json.rabl')
      @packs_json = render_to_string(:file => 'spraycan/packs/index.json.rabl')

      @stylesheet_json = render_to_string(:file => 'spraycan/stylesheets/show.json.rabl')

      @layouts = ActiveSupport::OrderedHash.new
      @layouts['Header'] = ['Logo', 'Search', 'Links', 'Navigation']
      @layouts['Sidebar'] = ['Layout', 'Categories']
      @layouts['Product Listing'] = ['Layout', 'Item', 'Image']
      @layouts['Product Detail'] = ['Layout','Description', 'Images', 'Variants', 'Similar']
      @layouts['Cart'] = ['Layout', 'Item']

      respond_to :js 
    end

    private
      def redirect
        redirect_to "/spraycan#{ '?goto=' + params[:goto] if params.key?(:goto)}#"
      end

      def load_objects
        @themes = Theme.all
        @palettes = Palette.all
        @packs = Pack.all

        #custom
        @stylesheet = Spraycan::Stylesheet.find(Spraycan::Config.preferred_custom_stylesheet_id)
      end

  end
end
