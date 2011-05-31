require 'fabulator/exhibit'
require 'json'

require_dependency "#{File.expand_path(File.dirname(__FILE__))}/app/models/fabulator_exhibit"

class FabulatorExhibitExtension < Radiant::Extension
  version "0.0.6"
  description "Exhibit extension to the Fabulator extension"
  url "http://github.com/jgsmith/radiant-fabulator-exhibit"

  class MissingRequirement < StandardError; end

  extension_config do |config|
    config.gem 'radiant-fabulator-extension'
    config.gem 'fabulator-exhibit'
    config.after_initialize do
      require 'fabulator_exhibit_extension/archive'
    end
  end

  def activate
    %w{exhibit.js 
       util.js 
       data.js 
       expressions.js 
       views.js 
       facets.js
       }.each do |s|
      FabulatorExtension.scripts << "fabulator/exhibit/#{s}"
    end

    FabulatorExtension.css << 'fabulator/exhibit/exhibit.css'

    tab 'Fabulator' do
      add_item("Exhibit Databases", "/admin/fabulator/exhibits")
    end

    Radiant::AdminUI.class_eval do
      attr_accessor :exhibits
      alias_method :fabulator_exhibit, :exhibits
    end
    admin.exhibits = load_default_fabulator_exhibit_regions

    Fabulator::Exhibit::Lib.class_eval do
      def self.fetch_database(nom)
        db = FabulatorExhibit.find(:first, :conditions => [ 'name = ?', nom ])
        return db.database
      end

      def self.store_database(nom, data)
        return
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

require 'fabulator_exhibit_extension/database'
