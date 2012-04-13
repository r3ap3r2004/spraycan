collection @view_overrides

attributes :id, :name, :virtual_path, :selector, :end_selector, :replace_with, :target, :disabled, :sequence, :sequence_target

node :replacement do |override|
  override.replacement.to_s
end
