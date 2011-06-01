class FabulatorExhibitItem < ActiveRecord::Base
  validates_presence_of :uuid
  validates_uniqueness_of :uuid, :scope => [ :fabulator_exhibit_id ]

  belongs_to :fabulator_exhibit, :counter_cache => :items_count

  belongs_to :updated_by, :class_name => 'User'
  belongs_to :created_by, :class_name => 'User'
end
