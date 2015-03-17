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
    }
    public function getUploadPath() {
        if (!$this->upload_path) {
            $this->upload_path = getcwd() . '/upload/atk4_markdown';
        }
        return $this->upload_path;
    }
    public function getUploadURL() {
        if (!$this->upload_url) {
            $this->upload_url = $this->app->getBaseURL() . '/upload/atk4_markdown';
        }
        return $this->upload_url;
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