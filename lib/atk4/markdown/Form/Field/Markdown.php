<?php
/**
 * Created by PhpStorm.
 * User: vadym
 * Date: 13/03/15
 * Time: 19:27
 */

namespace atk4\markdown;

class Form_Field_Markdown extends \Form_Field_Text {

    protected $total_view;
    protected $text_view;
    protected $text_view_default_content = 'No text yet';

    function init() {
        parent::init();
        Initiator::getInstance()->addLocation($this->app);

        $this->addWrapper();

        $this->js(true)->atk4_markdown()->markdown($this->name);

    }


    function set($value){
        return parent::set($value);
    }

    function render() {
        $this->js(true)
            ->_load('gme/ghostdown')
            ->_load('atk4_markdown')
            //->_load('gme/jquery.ghostdown')
            ->_css('gme/ghostdown')
        ;
        parent::render();
    }

//    function defaultTemplate(){
//        return array('atk4_markdown_form_field');
//    }


    protected function addWrapper() {


        $this->template->setHTML('before_field','

            <div class="features">

                <section class="editor">
                    <div class="outer">
                        <div class="editorwrap">
                            <section class="entry-markdown">
                                <header class="floatingheader">
                                    &nbsp;&nbsp; Markdown
                                </header>
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
    }

}