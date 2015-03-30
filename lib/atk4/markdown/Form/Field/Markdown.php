<?php
/**
 * Created by PhpStorm.
 * User: vadym
 * Date: 13/03/15
 * Time: 19:27
 */

namespace atk4\markdown;

use Intervention\Image\ImageManagerStatic as Image;


class Form_Field_Markdown extends \Form_Field_Text {

    protected $total_view;
    protected $text_view;
    protected $text_view_default_content = 'No text yet';
    protected $image_upload_get_key = 'md_image';
    protected $image_upload_get_value = 'upload';

    protected $config;

    function init() {
        parent::init();
        Initiator::getInstance()->addLocation($this->app);
        $this->config = Config::getInstance($this->app);

        $this->checkImageUpload();

        $this->addWrapper();

		switch ($this->config->getEditorType()) {
			case Config::EDITOR_TYPE_GME:
				$this->js(true)->atk4_markdown()->markdown($this->name,$this->app->url(null,['md_image'=>'upload']));
				break;
			/*case Config::EDITOR_TYPE_WP:
				$this->js(true)->atk4_markdown()->markdownWP($this->name);
				break;*/
			case Config::EDITOR_TYPE_JMN:
				$this->js(true)->atk4_markdown()->markdownJMN($this->name);
				break;
			default:
				throw $this->exception('Not supported');
		}

    }


    function set($value){
        return parent::set($value);
    }

    function render() {
		switch ($this->config->getEditorType()) {
			case Config::EDITOR_TYPE_GME:
				$this->app->jquery
					//->addStaticInclude('gme/kv-markdown')
					//->addStaticInclude('gme/rangyinputs-jquery-1.1.2')
					->addStaticInclude('gme/button-bar')
				;
				$this->js(true)
					//->_load('gme/kv-markdown')
					->_load('gme/dropzone')
					->_load('gme/ghostdown')
					->_load('atk4_markdown')
					//->_load('gme/jquery.ghostdown')
					->_css('gme/ghostdown')
					->_css('gme/dropzone')
				;
				break;
			/*case Config::EDITOR_TYPE_WP:
				$this->app->jquery
					->addStaticInclude('wp/markdown')
					->addStaticInclude('wp/prettify')
					->addStaticInclude('wp/pagedown/markdown-converter')
					->addStaticInclude('wp/pagedown/markdown-editor')
					->addStaticInclude('wp/pagedown/markdown-sanitizer')
					->addStaticInclude('atk4_markdown')
					->addStaticStylesheet('wp/markdown-editor')
					->addStaticStylesheet('wp/prettify')
				;
				break;*/
			case Config::EDITOR_TYPE_JMN:
				$this->app->jquery
					->addStaticInclude('wp/markdown')
					->addStaticInclude('wp/prettify')
					->addStaticInclude('wp/pagedown/markdown-converter')
					->addStaticInclude('wp/pagedown/markdown-editor')
					->addStaticInclude('wp/pagedown/markdown-sanitizer')
					->addStaticInclude('atk4_markdown')
					->addStaticStylesheet('wp/markdown-editor')
					->addStaticStylesheet('wp/prettify')
				;
				break;
			default:
				throw $this->exception('Not supported');
		}
        parent::render();
    }

//    function defaultTemplate(){
//        return array('atk4_markdown_form_field');
//    }


    protected function addWrapper() {

		switch ($this->config->getEditorType()) {
			case Config::EDITOR_TYPE_GME:

				$this->template->setHTML('before_field','

					<div class="features" id="markdown-editor-wrapper">

						<section class="editor">
							<div class="outer">
								<div class="editorwrap">
									<section class="entry-markdown">
										<header class="floatingheader">
											&nbsp;&nbsp; Markdown
										</header>
										<div id="wmd-button-bar"></div>
										<section class="entry-markdown-content">

				');
						$this->template->setHTML('after_field','

										</section>
									</section>
									<section class="entry-preview active">
										<header class="floatingheader">
											&nbsp;&nbsp; Preview <span class="entry-word-count">0 words</span>
										</header>
										<section class="entry-preview-content">
											<div class="rendered-markdown"></div>
										</section>
									</section>
								</div>
							</div>
						</section>

					</div>

				');

				break;
			/*case Config::EDITOR_TYPE_WP:
				break;*/
			case Config::EDITOR_TYPE_JMN:
				break;
			default:
				throw $this->exception('Not supported');
		}
    }

    protected function checkImageUpload() {
        if ($_GET[$this->image_upload_get_key] == $this->image_upload_get_value) {

            $file = $_FILES['file'];

            $path = $this->config->getUploadPath();
            $name = substr(md5(microtime()),0,8) . '_' . $this->sanitizeFilename($file['name']);
            $full_path = $path . '/' . $name;

            Image::configure(array('driver' => 'gd'));
            $image = Image::make($file['tmp_name']);
            $image->save($full_path);

            $data = [
                'path' => $this->config->getUploadURL() . '/' . $name,
            ];

            echo json_encode($data);

            exit();
        }
    }

    protected function sanitizeFilename($file) {
        // Remove anything which isn't a word, whitespace (\s), number
        // or any of the following caracters -_~,;:[]().
        $file = preg_replace("([^\w\d\-_~,;:\[\]\(\).])", '', $file);
        // Remove any runs of periods (thanks falstro!)
        $file = preg_replace("([\.]{2,})", '', $file);

        return $file;
    }

}