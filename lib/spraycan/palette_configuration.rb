# Ugly hack until perferences is extracted to it's own gem
module Spree
  module Preferences

  end
end

require 'spree_core'
require Spree::Core::Engine.root.join "app/models/spree/preferences/preferable"
require Spree::Core::Engine.root.join "app/models/spree/preferences/preferable_class_methods"
require Spree::Core::Engine.root.join "app/models/spree/preferences/configuration"
require Spree::Core::Engine.root.join "app/models/spree/preference"

class Spraycan::AppConfiguration < Spree::Preferences::Configuration
  preference :current_pack_guid, :string

  preference :base_theme_id, :integer
  preference :custom_stylesheet_id, :integer

  preference :favicon_file_guid, :string

  preference :logo_file_guid, :string
  preference :logo_alignment, :string, :default => 'center left'

  ## BACKGROUND
  preference :background_file_guid, :string
  preference :background_alignment, :string, :default => 'top left'
  preference :background_repeat,    :string, :default => 'no-repeat'

  ## FONTS
  preference :store_name_font, :string, :default => 'Ubuntu'
  preference :title_font, :string, :default => 'Ubuntu'
  preference :body_font,  :string, :default => 'Ubuntu'

  ## FONT SIZES ##
  # Store
  preference :header_navigation_font_size, :integer, :default => 14
  preference :horizontal_navigation_font_size, :integer, :default => 16
  preference :main_navigation_header_font_size, :integer, :default => 14
  preference :main_navigation_font_size, :integer, :default => 12

  # Product Listing
  preference :product_list_name_font_size,        :integer, :default => 12
  preference :product_list_price_font_size,       :integer, :default => 16
  preference :product_list_header_font_size,      :integer, :default => 20
  preference :product_list_search_font_size,      :integer, :default => 14

  # Product Details
  preference :product_detail_name_font_size,        :integer, :default => 24
  preference :product_detail_description_font_size, :integer, :default => 12
  preference :product_detail_price_font_size,       :integer, :default => 20
  preference :product_detail_title_font_size,    :integer, :default => 14

  # Basic
  preference :base_font_size,         :integer, :default => 12
  preference :store_name_font_size,   :integer, :default => 20
  preference :heading_font_size,      :integer, :default => 24
  preference :sub_heading_font_size,  :integer, :default => 14
  preference :button_font_size,       :integer, :default => 13
  preference :input_box_font_size,    :integer, :default => 13

  ## DIGEST
  preference :stylesheet_digest, :string, :default => 'fresh'
  preference :javascript_digest, :string, :default => 'fresh'
end

Spraycan::Config = Spraycan::AppConfiguration.new
