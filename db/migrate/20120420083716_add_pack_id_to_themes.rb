class AddPackIdToThemes < ActiveRecord::Migration
  def change
    add_column :spraycan_themes, :pack_id, :integer
  end
end
