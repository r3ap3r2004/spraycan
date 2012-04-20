module Spraycan
  class Pack < ActiveRecord::Base
    #themes that get activated when this pack is active
    has_and_belongs_to_many :themes, :join_table => 'spraycan_packs_themes'

    #pack specific theme to host images / css / js
    has_one :theme

    validates :guid, :presence => true, :uniqueness => true

    before_validation :bootstrap
    before_save :check_active

    before_destroy { themes.clear }

    def update_from_running
      self.themes.clear
      Theme.active.each { |t| self.themes << t }

      if palette = Spraycan::Palette.where(:active => true).first
        self.palette_guid = palette.guid
      end

      self.preference_hash = Spraycan::Config.preferences.except(:base_theme_id, :custom_stylesheet_id).to_json
      self.save
    end

    def self.import_from_running(name='Current')
      pack = Pack.create(:name => name)
      pack.update_from_running
      pack
    end

    def theme_guids
      self.themes.map(&:guid)
    end

    def palette
      Palette.where(:guid => self.palette_guid).first
    end

    def background_image
      Spraycan::File.where(:guid => self.preferences['background_file_guid']).first
    end

    def logo_image
      Spraycan::File.where(:guid => self.preferences['logo_file_guid']).first
    end

    def preferences
      self.preference_hash.present? ? JSON.parse(self.preference_hash) : {}
    end

    def theme_guid
      self.theme.guid
    end

    def export
      self.to_json(:methods => [:theme_guids, :preferences, :theme_guid], :only => [:name, :guid, :palette_guid, :active])
    end

    private
      def check_active
        if self.changed.include?('active') && self.active?
          Pack.update_all(:active => false)
          Theme.where('pack_id is not null').update_all(:active => false)

          Spraycan::Config.current_pack_guid = self.guid
          Spraycan::Config.base_theme_id = self.theme.id
          Spraycan::Config.custom_stylesheet_id = self.theme.stylesheets.where(:name => 'custom').first.id

          self.theme.active = true
          self.theme.save

          self.preferences.each { |pref, value| Spraycan::Config.send "preferred_#{pref}=".to_sym, value }

          if palette = Palette.where(:guid => self.palette_guid).first
            palette.active = true
            palette.save
          end

          self.themes.each do |theme|
            theme.active = true
            theme.save
          end
        end
      end

      def bootstrap
        self.guid ||= Guid.new.to_s

        if self.theme.nil?
          self.theme = Theme.create(:name => 'Pack Theme')
          self.theme.stylesheets.create(:name => 'custom')
          self.theme.javascripts.create(:name => 'custom')
        end
      end
  end
end
