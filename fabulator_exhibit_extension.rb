require 'fabulator/exhibit'

class FabulatorExhibitExtension < Radiant::Extension
  version "1.0"
  description "Exhibit extension to the Fabulator extension"
  url "http://github.com/jgsmith/radiant-fabulator-exhibit"

  class MissingRequirement < StandardError; end

  define_routes do |map|
    map.namespace 'admin' do |admin|
      admin.namespace 'fabulator', :member => { :remove => :get } do |fab|
        fab.resources :exhibits
      end
    end
    map.namespace 'api' do |api|
      api.resources :exhibits
    end
  end

  def activate
    raise FabulatorExhibitExtension::MissingRequirement.new('FabulatorExtension must be installed and loaded first.') unless defined?(FabulatorExtension)

    admin.nav[:fabulator] << admin.nav_item(:exhibits, "Exhibit Databases", "/admin/fabulator/exhibits")

    Radiant::AdminUI.class_eval do
      attr_accessor :exhibits
      alias_method :fabulator_exhibit, :exhibits
    end
    admin.exhibits = load_default_fabulator_exhibit_regions

    Fabulator::Exhibit::Actions::Lib.class_eval do
      def self.fetch_database(nom)
        db = FabulatorExhibit.find(:first, :conditions => [ 'name = ?', nom ])
        if db.nil?
          return { :items => [], :types => {}, :properties => {} }
        else
          data = (JSON.parse(db.data) rescue { :items => [], :types => {}, :properties => {} })
          ret = { :items => { }, :types => data[:types], :properties => data[:properties] }
          data[:items].each do |i| 
            ret[:items][i[:id]] = i
          end
          return ret
        end
      end

      def self.store_database(nom, data)
        db = FabulatorExhibit.find(:first, :conditions => [ 'name = ?', nom ])
        if db.nil?
          raise "The Exhibit database #{nom} does not exist."
        end
        to_save = { :items => data[:items].values, :properties => data[:properties], :types => data[:types] }
        db.data = to_save.to_json
        db.items_count = to_save[:items].size
        db.save
      end
    end
  end

  def deactivate
  end

  def load_default_fabulator_exhibit_regions
    returning OpenStruct.new do |exhibit|
      exhibit.edit = Radiant::AdminUI::RegionSet.new do |edit|
        edit.main.concat %w{edit_header edit_form}
        edit.form.concat %w{edit_title edit_description}
        edit.form_bottom.concat %w{edit_buttons edit_timestamp}
      end
      exhibit.index = Radiant::AdminUI::RegionSet.new do |index|
        index.top.concat %w{help_text}   
        index.thead.concat %w{title_header size_header modify_header}
        index.tbody.concat %w{title_cell size_cell modify_cell}
        index.bottom.concat %w{new_button}
      end
      exhibit.new = exhibit.edit
    end
  end
end
