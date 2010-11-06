class FabulatorExhibitItem < ActiveRecord::Base
  validates_presence_of :uuid
  validates_uniqueness_of :uuid, :scope => [ :fabulator_exhibit_id ]

  belongs_to :fabulator_exhibit

  belongs_to :updated_by, :class_name => 'User'
  belongs_to :created_by, :class_name => 'User'
end
