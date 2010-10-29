namespace :radiant do
  namespace :extensions do
    namespace :fabulator_exhibit do

      desc "Runs the migration for the Fabulator Exhibit extension"
      task :migrate => :environment do 
        require 'radiant/extension_migrator'
        if ENV["VERSION"]
          FabulatorExhibitExtension.migrator.migrate(ENV["VERSION"].to_i)
          Rake::Task['db:schema:dump'].invoke
        else
          FabulatorExhibitExtension.migrator.migrate
          Rake::Task['db:schema:dump'].invoke
        end
      end

      desc "Copies public assets of the Fabulator Exhibit extenion to the instance public/ directory."
      task :update => :environment do
        is_svn_or_dir = proc { |path| path =~ /\.svn/ || File.directory?(path) }
        Dir[FabulatorExhibitExtension.root + "/public/**/*"].reject(&is_svn_or_dir).each do |file|
          path = file.sub(FabulatorExhibitExtension.root, '')
          directory = File.dirname(path)
          puts "Copying #{path}..."
          mkdir_p RAILS_ROOT + directory, :verbose => false
          cp file, RAILS_ROOT + path, :verbose => false
        end
      end
    end
  end
end
