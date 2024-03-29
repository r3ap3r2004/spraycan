module Spraycan
  class Palette < ActiveRecord::Base
    preference :layout_background_color, :string, :default => '#ffffff'
    preference :title_text_color, :string, :default => '#000000'
    preference :body_text_color, :string, :default => '#000000'
    preference :link_text_color, :string, :default => '#000000'
    preference :product_background_color, :string, :default => '#ffffff'
    preference :product_title_text_color, :string, :default => '#000000'
    preference :product_body_text_color, :string, :default => '#000000'
    preference :product_link_text_color, :string, :default => '#000000'

    validates :guid, :presence => true, :uniqueness => true
    before_validation :set_guid
    before_save :check_active
    after_save :set_digest

    def export
      self.to_json(:methods => [:preferences], :only => [:name, :active, :guid])
    end

    private
      def check_active
        if self.changed.include?('active') && self.active?
          Spraycan::Palette.update_all(:active => false)
        end
      end

      def set_digest
        return unless self.active?
        CompileDigest.update_stylesheet_digest(self)
      end 

      def set_guid
        self.guid ||= Guid.new.to_s
      end
  end
end
