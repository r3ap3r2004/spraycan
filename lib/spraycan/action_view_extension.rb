ActionView::Template.class_eval do

  require 'base64'
  alias_method :without_spraycan_initialize, :initialize

  def initialize(source, identifier, handler, details)
    if Rails.application.config.spraycan.enable_editor
      if details[:format].to_s == "text/html"
        doc = Deface::Parser.convert(source.clone)

        inject = <<-text
    <script type="text/javascript">
      //<![CDATA[
        all_templates = ((typeof(all_templates)==='undefined') ? new Array() : all_templates);
        all_templates[all_templates.length] = '#{details[:virtual_path]}';
        hooks_by_template = ((typeof(hooks_by_template)==='undefined') ? new Array() : hooks_by_template);
        text

        doc.css("[data-hook]").each_with_index do |match, i|
          if i == 0
            inject << "hooks_by_template['#{details[:virtual_path]}'] = new Array();\n"
          end
          name = match.attr("data-hook") == "" ? match.attr("id") : match.attr("data-hook")

          inject << "hooks_by_template['#{details[:virtual_path]}'][#{i}] = ['#{name}', '#{Base64.encode64(Deface::Parser.undo_erb_markup!(match.to_s.dup)).gsub("\n","")}'];\n"
        end

        inject << <<-text
      //]]>
    </script>
        text
      else
        inject = nil
      end

      without_spraycan_initialize("#{inject}#{source}", identifier, handler, details)
    else

      without_spraycan_initialize(source, identifier, handler, details)
    end
  end
end
