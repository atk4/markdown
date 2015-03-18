<?php
/**
 * Created by PhpStorm.
 * User: vadym
 * Date: 12/03/15
 * Time: 20:22
 */

namespace atk4\markdown;

class Config {

    private $app;


    private $upload_path = false;
    private $upload_url = false;
    public function setUploadPath($upload_path) {
        $this->upload_path = $upload_path;
        return $this;
    }
    public function getUploadPath() {
        if (!$this->upload_path) {
            $this->upload_path = getcwd() . '/upload/atk4_markdown';
        }
        return $this->upload_path;
    }


    /**
     * Upload URL - is url which will be sent to markdown editor after image upload
     * and it must valid URL to be used both in admin part editor and on frontend.
     *
     * Priority order:
     *
     *  - First add-on trying to get URL which is already set. Use setUploadURL() to set your custom
     * URL programmatically
     *
     *  - In second order add-on try to get from project config. You can set upload URL there like this
     * $config['atk4-markdown']['upload_url']
     *
     *  - Finally add-on set default upload URL which must be located in public directory '/upload/atk4_markdown'
     *
     *
     * @return bool
     */
    public function getUploadURL() {
        if (!$this->upload_url) {
            $this->upload_url = $this->app->getConfig('atk4-markdown/upload_url',
                $this->app->getBaseURL() . 'upload/atk4_markdown'
            );
        }
        return $this->upload_url;
    }
    public function setUploadURL($upload_url) {
        $this->upload_url = $upload_url;
        return $this;
    }





    /* --------------------------------------------------
     |
     |
     |                Singleton stuff
     |
     |
    */

    private static $instance;
    public static function getInstance($app) {
        if (!self::$instance) {
            self::$instance = new Config();
        }
        self::$instance->app = $app;
        return self::$instance;
    }
    protected function __construct() {}

}