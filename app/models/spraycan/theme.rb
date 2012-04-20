require 'zlib'
require 'stringio'
require 'net/http'
require 'uri'

module Spraycan
  class Theme < ActiveRecord::Base
    has_many :view_overrides, :dependent => :destroy
    has_many :stylesheets, :dependent => :destroy
    has_many :javascripts, :dependent => :destroy
    has_many :files, :dependent => :destroy

    has_and_belongs_to_many :packs, :join_table => 'spraycan_packs_themes'

    belongs_to :pack

    validates :name, :presence => true
    validates :guid, :presence => true, :uniqueness => true

    default_scope order('position DESC')
    scope :active, where(:active => true)

    before_validation :set_guid
    before_save :check_active

    acts_as_list

    before_destroy { packs.clear }

    def export
      self.to_json(:methods => [:source], :only => [:name, :guid, :applies_to, :position])
    end

    def self.import_from_string(data)
      self.import_from_json(JSON.parse(data))
    end

    def self.import_from_json(data)
      data = data["theme"] if data.keys.include? "theme"

      if %w(guid name source).all? {|k| data.include? k}
        return false unless %w(view_overrides stylesheets javascripts files).all? {|k| data["source"].include? k}
      else
        return false
      end

      Spraycan::Theme.delete_all(:guid => data["guid"])

      theme = Spraycan::Theme.new

      theme.name = data["name"]
      theme.guid = data["guid"]
      theme.applies_to = data["applies_to"]

      if theme.save
        data["source"]["view_overrides"].each { |override| theme.view_overrides.create(override) }
        data["source"]["stylesheets"].each { |stylesheet| theme.stylesheets.create(stylesheet) }
        data["source"]["javascripts"].each { |javascript| theme.javascripts.create(javascript) }

        data["source"]["files"].each do |file|
          s = StringIO.new(ActiveSupport::Base64.decode64(file["data"]))
          z = Zlib::GzipReader.new(s)

          temp_path = ::File.join([Rails.root, "tmp", file["file_name"]])
          ::File.open(temp_path, "w") {|f| f.write(z.read) }

          if file.key? 'guid'
            Spraycan::File.delete_all(:guid => file["guid"])
          end

          local_file = ::File.open(temp_path, "r")
          theme.files.create(:file => local_file, :guid => file["guid"])
          local_file.close
        end

        true
      else
        false
      end
    end

    def source
      @source = {}
      @source[:view_overrides] = self.view_overrides.map { |s| s.attributes.reject { |key, val| [:id, :theme_id, :updated_at, :created_at].include? key.to_sym } }
      @source[:stylesheets] = self.stylesheets.map { |s| s.attributes.reject { |key, val| ![:name, :css].include? key.to_sym } }
      @source[:javascripts] = self.javascripts.map { |s| s.attributes.reject { |key, val| ![:name, :js].include? key.to_sym } }
      @source[:files] = []

      self.files.each do |f|
        file = f.file.file #meta huh? location location location!
        next if file.nil? || !file.exists?

        data = StringIO.new
        z = Zlib::GzipWriter.new(data)
        z.write file.read
        z.close

        @source[:files] << { :file_name => file.filename, :guid => f.guid,
          :data => ActiveSupport::Base64.encode64(data.string) }
      end

      @source
    end

    private
      def check_active
        if self.changed.include?('active') && self.active? && self.applies_to.present?
          Theme.where(:applies_to => self.applies_to).update_all(:active => false)

          CompileDigest.update_stylesheet_digest()
        end
      end

      def set_guid
        self.guid ||= Guid.new.to_s
      end
  end
end
