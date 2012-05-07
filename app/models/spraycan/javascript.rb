module Spraycan
  class Javascript < ActiveRecord::Base
    belongs_to :theme

    after_save :set_digest

    def body
      self.js
    end

    private

      def set_digest
        CompileDigest.update_javascript_digest()
      end
  end
end
