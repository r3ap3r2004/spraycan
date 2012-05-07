module Spraycan
  class CompileDigest
    def self.update_stylesheet_digest(palette=nil)
      key = Time.now.to_f.to_s

      Spraycan::Config[:stylesheet_digest] = Digest::MD5.new.update(key).hexdigest
    end

    def self.update_javascript_digest
      key = Time.now.to_f.to_s

      Spraycan::Config[:javascript_digest] = Digest::MD5.new.update(key).hexdigest
    end
  end
end
