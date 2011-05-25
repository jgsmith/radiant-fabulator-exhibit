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
      data :exhibits do |io|
      end
      
      data :items do
      end
      
      data :types do
      end
      
      data :properties do
      end
    end
  end
end