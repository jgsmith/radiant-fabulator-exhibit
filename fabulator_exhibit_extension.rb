require 'fabulator/exhibit'
require 'json'

class FabulatorExhibitExtension < Radiant::Extension
  version "0.0.3"
  description "Exhibit extension to the Fabulator extension"
  url "http://github.com/jgsmith/radiant-fabulator-exhibit"

  class MissingRequirement < StandardError; end

  extension_config do |config|
    config.gem 'radiant-fabulator-extension'
    config.gem 'fabulator-exhibit'
  end

  def activate
    #raise FabulatorExhibitExtension::MissingRequirement.new('FabulatorExtension must be installed and loaded first.') unless defined?(FabulatorExtension)

    %w{exhibit.js data.js  expressions.js views.js facets.js}.each do |s|
      FabulatorExtension.scripts << "fabulator/exhibit/#{s}"
    end
    #FabulatorExtension.scripts << 'fabulator/exhibit/exhibit.js'
    #FabulatorExtension.scripts << 'fabulator/exhibit/exhibit-expressions.js'
    FabulatorExtension.css << 'fabulator/exhibit/exhibit.css'

    tab 'Fabulator' do
      add_item("Exhibit Databases", "/admin/fabulator/exhibits")
    end

    Radiant::AdminUI.class_eval do
      attr_accessor :exhibits
      alias_method :fabulator_exhibit, :exhibits
    end
    admin.exhibits = load_default_fabulator_exhibit_regions

  ## TODO: better database so we can have multiple applications accessing
  ##       the same database at the same time
    Fabulator::Exhibit::Lib.class_eval do
      def self.fetch_database(nom)
        db = FabulatorExhibit.find(:first, :conditions => [ 'name = ?', nom ])
        if db.nil?
          return { :items => [], :types => {}, :properties => {} }
        else
          data = (JSON.parse(db.data) rescue { 'items' => [], 'types' => {}, 'properties' => {} })
          ret = { :items => { }, :types => data['types'], :properties => data['properties'] }
          ret[:properties] = { } if ret[:properties].nil?
          ret[:types] = { } if ret[:types].nil?
          data['items'].each do |i| 
            ret[:items][i['id']] = i
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
