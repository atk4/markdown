<?php
/**
 * Created by PhpStorm.
 * User: vadym
 * Date: 12/03/15
 * Time: 20:22
 */

namespace atk4\markdown;

class Initiator {


    protected $locations_added = false;


    function addLocation($app) {

        if (!$this->locations_added) {
            $this->namespace = __NAMESPACE__;
            $public_location = $app->pathfinder->addLocation(array(
                'js'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/js' ),
                'css'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/css' ),
            ))
                ->setBasePath(getcwd().'/public')
                ->setBaseURL($app->getBaseURL())
            ;
            $private_location = $app->pathfinder->addLocation(array(
                'template' => array( '../../../templates' ),
            ))
                ->setBasePath(__DIR__)
            ;
            $this->locations_added = true;
        }
    }











    /* --------------------------------------------------
     |
     |
     |                Singleton stuff
     |
     |
    */

    private static $instance;
    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new Initiator();
        }
        return self::$instance;
    }
    protected function __construct() {}

}