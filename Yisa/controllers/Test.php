<?php
$table = 'standard_back';

class Test extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('back_log_model');
        $this->load->model('back_coding_rule_model');
    }

    public function index()
    {
        echo time();
        echo date('Y-m-d H:i:s');
//        $this->load->twig_display('logger.twig');
    }


}