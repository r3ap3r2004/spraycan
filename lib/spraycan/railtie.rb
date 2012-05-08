require 'guid'
require 'rabl'

module Spraycan
  class Engine < Rails::Engine
    isolate_namespace Spraycan
    railtie_name "spraycan"

    config.autoload_paths += %W(#{root}/lib)

    def self.activate
      if Rails.application.config.spraycan.enable_editor || Rails.application.config.spraycan.enable_selector

        #define overrides needed for theming UI
        Rails.application.config.spraycan.editor_virtual_paths.each do |layout|
          Deface::Override.new(:virtual_path => layout,
                          :name => "_spraycan_ui",
                          :insert_bottom => "head",
                          :partial => "spraycan/shared/layout_scripts")

        end

      end
    end

    def self.initialize_themes
      if Rails.application.config.deface.enabled
        #ensure some basic required data is present:
        unless Spraycan::Palette.exists?
          Spraycan::Palette.create(:active => true, :name => 'Default')
        end

        if Spraycan::Theme.exists?(:applies_to => 'base')
          theme = Spraycan::Theme.where(:applies_to => 'base').first
        else
          theme = Spraycan::Theme.create(:name => 'Base Theme', :applies_to => 'base')
        end

        Spraycan::Config.preferred_base_theme_id = theme.id

        self.initiate_overrides
      end

    end

    def self.initiate_overrides
      #clear all WIP overrides, they get reloaded below
      Deface::Override.all.each do |virtual_path, overrides|
        overrides.reject! {|name, override| override.args[:from_editor] }
      end

      #load all overrides from db 
      if Spraycan::Theme.table_exists?
        if Rails.cache.exist?('spraycan_all_view_overrides')
          #load from cache
          Rails.cache.read('spraycan_all_view_overrides').each do |key|
            #dup needed to unfreeze hash
            Deface::Override.new Rails.cache.read(key).dup
          end
        else
          #fetch from db and initiate
          all = []

          Spraycan::Theme.active.includes(:view_overrides).each do |theme|
            #initiate each override and cache it's args
            theme.view_overrides.inject(all) do |all, override|
              override = override.initiate
              key = "deface_override_#{override.digest}"
              Rails.cache.write key, override.args
              all << key
            end
          end

          #cache list of current overrides
          Rails.cache.write 'spraycan_all_view_overrides', all

        end
      end

    end

    config.to_prepare &method(:activate).to_proc

    # sets up spraycan environment
    #
    initializer "spraycan.environment", :before => :load_environment_config do |app|
      app.config.spraycan = Spraycan::Environment.new

      # adds global before_filter that reloads all overrides from DB
      # this is needed in production where multiple app processes are
      # rendering so they must have the most recent overrides loaded.
      #
      # todo: consider using (a shared) Rails.cache to store overrides,
      # and re-enabling the old initialize_themes method in 
      # spraycan/base_controller
      ActiveSupport.on_load(:action_controller) do
        before_filter { Spraycan::Engine.initiate_overrides }
      end
    end

    # sets the manifests / assets to be precompiled
    initializer "spree.assets.precompile" do |app|
      app.config.assets.precompile += ['spraycan/editor/all.*', 'spraycan/editor/embed.*', 'spraycan/selector/all.*']
    end

  end
end

