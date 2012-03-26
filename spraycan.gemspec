Gem::Specification.new do |s|
  s.platform    = Gem::Platform::RUBY
  s.name        = 'spraycan'
  s.version     = '0.3.0'
  s.summary     = 'Browser based theme editing for Rails applications.'
  s.required_ruby_version = '>= 1.8.7'

  s.author        = 'Brian D. Quinn'
  s.email         = 'brian@railsdog.com'

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.require_path = 'lib'
  s.requirements << 'none'

  s.has_rdoc = false

  s.add_dependency('deface', '>= 0.6.1')
  s.add_dependency('rabl', '>= 0.6.0')
  s.add_dependency('ejs', '1.0.0')
  s.add_dependency('carrierwave', '0.5.4')
  s.add_dependency('guid', '0.1.1')
  s.add_dependency('acts_as_list', '>= 0.1.2')
  s.add_dependency('acts_as_list', '>= 0.1.2')
  s.add_dependency('sass', '3.1.15')

  s.add_development_dependency('rspec', '>= 2.7.0')
  s.add_development_dependency('rspec-rails', '>= 2.7.0')
  s.add_development_dependency('factory_girl', '>= 2.3.0')
end
