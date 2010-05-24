class CreateFabulatorExhibitTables < ActiveRecord::Migration
  def self.up
    create_table :fabulator_exhibits do |t|
      t.string :name, :null => false
      t.text   :description
      t.integer :lock_version, :default => 0
      t.integer :items_count, :default => 0
      t.text   :data
      t.references :updated_by
      t.references :created_by
      t.timestamps
    end
  end

  def self.down
    drop_table :fabulator_exhibits
  end
end

