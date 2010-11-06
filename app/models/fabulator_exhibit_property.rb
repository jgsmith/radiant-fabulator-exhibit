class FabulatorExhibitProperty < ActiveRecord::Base
  validates_presence_of :name
  validates_uniqueness_of :name, :scope => [ :fabulator_exhibit_id ]

  belongs_to :fabulator_exhibit
end
