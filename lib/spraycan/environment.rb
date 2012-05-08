module Spraycan
  class Environment
    attr_accessor :enable_editor, :enable_selector, :editor_virtual_paths
    def initialize
      @enable_editor        = false
      @enable_selector      = true
      @editor_virtual_paths = ["layouts/application"]
    end
  end
end

