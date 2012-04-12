class Spraycan::ViewOverride < ActiveRecord::Base
  belongs_to :theme
  after_save :initiate

  def initiate
    if ['set_attributes', 'add_to_attributes', 'remove_from_attributes'].include? self.target
      #have to parse string to safely get the hash keys +   values
      self.replacement = eval(self.replacement)

      self.replace_with = 'attributes'
    end

    if ['cut', 'copy'].include? self.replace_with
      if self.replacement.first == ?{ && self.replacement.last == ?}
         self.replacement = eval(self.replacement)
      end
    end

    Deface::Override.new( :from_editor => true,
                          :virtual_path => self.virtual_path,
                          :name => self.name,
                          self.target.to_sym => self.selector,
                          :closing_selector => self.closing_selector,
                          self.replace_with.to_sym => self.replacement,
                          :disabled => self.disabled,
                          :sequence =>  (self.sequence_target.blank? ? 100 : {self.sequence.to_sym => self.sequence_target}))
  end
end
