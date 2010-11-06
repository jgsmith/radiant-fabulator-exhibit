class FabulatorExhibitProperty < ActiveRecord::Base
  validates_presence_of :name
  validates_uniqueness_of :name, :scope => [ :fabulator_exhibit_id ]

  before_save :freeze_data

  belongs_to :fabulator_exhibit
end
