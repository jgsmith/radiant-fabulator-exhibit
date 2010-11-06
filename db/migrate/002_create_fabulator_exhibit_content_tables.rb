# this will let us have multiple apps operating on a database at the same time
class CreateFabulatorExhibitContentTables < ActiveRecord::Migration
  def self.up
    create_table :fabulator_exhibit_items do |t|
      t.references :fabulator_exhibit, :null => false
      t.string :uuid, :null => false
      t.text   :data
      t.references :updated_by
      t.references :created_by
      t.timestamps
    end

    create_table :fabulator_exhibit_types do |t|
      t.references :fabulator_exhibit, :null => false
      t.string :name, :null => false
      t.text :data
      # we may want some other stuff here, like which xsm we use
      # to edit something of this type
    end

    create_table :fabulator_exhibit_properties do |t|
      t.references :fabulator_exhibit, :null => false
      t.string :name, :null => false
      t.text :data
    end

    FabulatorExhibit.find(:all).each do |db|
      data = (JSON.parse(db.data) rescue { 'items' => [], 'types' => {}, 'properties' => {} })
      data['types'].each_pair do |k,t|
        t_ob = FabulatorExhibitType.create({
          :fabulator_exhibit_id => db.id,
          :name => k,
          :data => t.to_json
        })
        t_ob.save!
      end

      data['properties'].each_pair do |k,p|
        p_ob = FabulatorExhibitProperty.create({
          :fabulator_exhibit_id => db.id,
          :name => k,
          :data => p.to_json
        })
        p_ob.save!
      end

      data['items'].each do |i|
        i_ob = FabulatorExhibitItem.create({
          :fabulator_exhibit_id => db.id,
          :uuid => i['id'],
          :data => i.to_json
        });
        i_ob.save!
      end
    end
  end

  def self.down
    FabulatorExhibit.find(:all).each do |db|
      db.data = db.database.to_json
      db.save!
    end

    drop_table :fabulator_exhibit_properties
    drop_table :fabulator_exhibit_types
    drop_table :fabulator_exhibit_items
  end
end

