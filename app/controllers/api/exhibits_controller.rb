class Api::ExhibitsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  no_login_required

  def show
    @exhibit = FabulatorExhibit.find(:first, :conditions => [ "name = ?", params[:id] ])
    respond_to do |format|
      format.json { render :json => @exhibit.data }
    end
  end
end
