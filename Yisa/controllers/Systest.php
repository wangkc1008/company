<?php
/**
 * Created by PhpStorm.
 * User: Jeeson
 * Date: 2018/12/5
 * Time: 11:55
 */


// 测试系统
class Systest extends CI_Controller {

    // 载入涉及的数据模型
    public function __construct() {
        parent::__construct();
        // 载入第三方的twig
        $this->load->model('test_system_model');
        $this->load->model('test_model_model');
        $this->load->model('test_data_model');
    }

    // 首页
    public function index() {
        if(!$_SESSION['user_name']){
          redirect('?c=login&m=index');
        }
        $data['nav'] = $_SESSION['nav'];
        $data['base_url'] = base_url();
        $data['systems']  = $this->test_system_model->get_system_name();
        $this->load->twig_display('test_index.twig', $data);
    }

    // 神眼详情页
    public function detail() {
        if(!$_SESSION['user_name']){
          redirect('?c=login&m=index');
        }
        $data['nav'] = $_SESSION['nav'];
        $data['base_url'] = base_url();
        $data['system'] = $_REQUEST['system'];
        // 根据系统的值取得所有模块（model提供根据系统获取模块，及每个模块的条件，一个数组）
        $data['modules'] = $this->test_model_model->get_module_name($data['system']);
        $data['conditions'] = $this->test_data_model->get_all_conditions($data['system']);
        $this->load->twig_display('test_detail.twig', $data);
    }
}