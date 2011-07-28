class DefaceEditor::GraphicsController < DefaceEditor::BaseController
  respond_to :json, :js

  before_filter :set_theme, :only => [:index, :create]

  def index
    @graphics = @theme.graphics

    respond_with @graphics
  end

  def create
    @graphic = @theme.graphics.create params[:graphic]
    render :js => "var new_url = '#{@graphic.file.url}';"
  end

  def destroy
    render :json => DefaceEditor::Graphic.destroy(params[:id])
  end

  private
    def set_theme
      @theme = DefaceEditor::Theme.find(params[:theme_id])
    end

end
