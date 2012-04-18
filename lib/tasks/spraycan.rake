namespace :spraycan do
  desc 'Import Theme from engine'
  task :import_railtie_assets, [:name] => [:environment] do |t, args|
    railtie = Rails.application.railties.all.detect {|r| r.railtie_name == args[:name] }
    if railtie.nil?
      puts "Railtie named '#{args[:name]}' is not loaded."
    else
      Spraycan::Import.execute(railtie)
    end
  end

  desc 'Export Theme to engine'
  task :export_railtie_assets, [:name] => [:environment] do |t, args|
    railtie = Rails.application.railties.all.detect {|r| r.railtie_name == args[:name] }
    if railtie.nil?
      puts "Railtie named '#{args[:name]}' is not loaded."
    else
      Spraycan::Export.new.execute(railtie)
    end

  end

  desc 'Dump all themes and palettes to a single file'
  task :dump => :environment do
    output = { :themes => [], :palettes => [], :preferences => {:spraycan => {} }, :packs => [] }

    Spraycan::Theme.all.each do |theme|
      output[:themes] << JSON.parse(theme.export)
    end

    Spraycan::Palette.all.each do |palette|
      output[:palettes] << JSON.parse(palette.export)
    end

    output[:preferences][:spraycan] = Spraycan::Config.preferences.except(:base_theme_id, :custom_stylesheet_id)

    Spraycan::Pack.all.each do |pack|
      output[:packs] << JSON.parse(pack.export)
    end

    path = File.join(Dir.pwd, 'spraycan.json')

    File.open(path, 'w') {|f| f.write(output.to_json) }

    puts "All theme(s), palette(s) and preferences exported to: #{path}"
  end

  desc 'Batch import multiple themes and palettes from a single file'
  task :load => :environment do

    path = File.join(Dir.pwd, 'spraycan.json')

    if File.exists? path
      data = JSON.parse(File.open(path).read)

      data['themes'].each do |theme|
        Spraycan::Theme.import_from_json(theme)
      end

      data['palettes'].each do |palette|
        palette = palette["palette"] if palette.keys.include? "palette"
        prefs = palette.delete 'preferences'

        p = Spraycan::Palette.create(palette) 
        prefs.each { |pref, value| p.send "preferred_#{pref}=".to_sym, value }
      end

      data['preferences']['spraycan'].each { |pref, value| Spraycan::Config.send "preferred_#{pref}=".to_sym, value }

      data['packs'].each do |pack|
        pack = pack["pack"] if pack.keys.include? "pack"
        prefs = pack.delete 'preferences'
        theme_guids = pack.delete 'theme_guids'

        p = Spraycan::Pack.new(pack)
        active = p.active
        p.active = false
        p.preference_hash = prefs.to_json
        p.save

        theme_guids.each do |guid|
          if theme = Spraycan::Theme.where(:guid => guid).first
            p.themes << theme
          end
        end

        if active
          p.active = true
          p.save
        end
      end

      #ensure minimum data and set required values
      if Spraycan::Theme.exists?(:applies_to => 'base')
        theme = Spraycan::Theme.where(:applies_to => 'base').first
      else
        theme = Spraycan::Theme.create(:name => 'Base Theme', :applies_to => 'base')
      end
      Spraycan::Config.preferred_base_theme_id = theme.id

      stylesheet = theme.stylesheets.where(:name => 'custom').first
      stylesheet ||= theme.stylesheets.create(:name => 'custom')
      Spraycan::Config.preferred_custom_stylesheet_id = stylesheet.id


      puts "Imported theme(s), palette(s) and preferences from #{path}"
    else
      puts "Could not find import at #{path}"
    end
  end

  desc 'DELETES all spraycan models'
  task :clear => :environment do
    Spraycan::Theme.destroy_all
    Spraycan::Palette.destroy_all
    Spraycan::Pack.destroy_all
  end


end
