class FabulatorExhibit < ActiveRecord::Base
  validates_presence_of :name
  validates_uniqueness_of :name

  has_many :fabulator_exhibit_types
  has_many :fabulator_exhibit_items
  has_many :fabulator_exhibit_properties

  belongs_to :updated_by, :class_name => 'User'
  belongs_to :created_by, :class_name => 'User'
end
