class Api::ExhibitsController < ApplicationController

    def show
      @exhibit = FabulatorExhibit.find(:first, :conditions => [ "id = ? OR name = ?", params[:id], params[:id] ])
      respond_to do |format|
        format.json { render :json => @exhibit.data }
      end
    end

end
