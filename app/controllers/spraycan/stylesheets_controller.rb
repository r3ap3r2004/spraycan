class Spraycan::StylesheetsController < Spraycan::BaseController
  respond_to :css, :json

  before_filter :set_theme, :only => [:index, :create]

  def index
    @stylesheets = @theme.stylesheets
    respond_with @stylesheets
  end

  def show
    @stylesheet = Spraycan::Stylesheet.where(:id => params[:id]).first

    # @stylesheet.css = params[:css]
    # @stylesheet.save
    # render :text => @stylesheet.css
    respond_with @stylesheet
  end

  def create
    @stylesheet = @theme.stylesheets.create params[:stylesheet]
    respond_with @stylesheet
  end

  def update
    @stylesheet = Spraycan::Stylesheet.where(:id => params.delete(:id)).first
    @stylesheet.update_attributes params[:stylesheet]

    respond_with @stylesheet
  end

  def destroy
    render :json => Spraycan::Stylesheet.destroy(params[:id])
  end

  private
    def set_theme
      @theme = Spraycan::Theme.find(params[:theme_id])
    end

end
