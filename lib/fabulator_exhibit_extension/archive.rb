require 'fabulator/radiant/archive'

class FabulatorExhibitExtension
  class Archive < FabulatorExtension::Archive
    namespace Fabulator::EXHIBIT_NS
    version   0.9
    
    writing do
      data :exhibits, FabulatorExhibit
    
      data :items, FabulatorExhibitItem, {
        :exhibit_id => :fabulator_exhibit_id
      }
    
      data :types, FabulatorExhibitType, {
        :exhibit_id => :fabulator_exhibit_id
      }
    
      data :properties, FabulatorExhibitProperty, {
        :exhibit_id => :fabulator_exhibit_id
      }
    end
    
    reading do
      data :exhibits, FabulatorExhibit
      
      data :items, FabulatorExhibitItem, {
        :fabulator_exhibit_id => :exhibit_id
      }
      
      data :types, FabulatorExhibitType, {
        :fabulator_exhibit_id => :exhibit_id
      }
      
      data :properties, FabulatorExhibitProperties, {
        :fabulator_exhibit_id => :exhibit_id
      }
    end
  end
end