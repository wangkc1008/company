<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 * 首页控制器
 */
$table = 'function_list';
class Common extends CI_Controller
{
    public function __construct(){
        parent::__construct();
        $this->load->model('common_model');
    } 
    public function index(){
        if(!$_SESSION['user_name']){
            redirect('/login/index');
        }else{
            global $table;
            $data = $this->common_model->select($table);
            foreach ($data as $key => $value) {
                if ($value['pid']==1) {
                    //开发模块功能
                    $result['develop'][] = array(
                        'id'=>$value['id'],
                        'name'=>$value['function_name'],
                        'url'=>$value['function_url']
                    );
                }elseif ($value['pid']==2) {
                    //培训功能模块
                     $result['train'][]= array(
                        'id'=>$value['id'],
                        'name'=>$value['function_name'],
                        'url'=>$value['function_url']
                    );
                }elseif ($value['pid']==3) {
                    //测试功能模块
                     $result['test'][]= array(
                        'id'=>$value['id'],
                        'name'=>$value['function_name'],
                        'url'=>$value['function_url']
                    );
                }elseif($value['pid']==4){
                    //后台功能模块
                     $result['backen'][]= array(
                        'id'=>$value['id'],
                        'name'=>$value['function_name'],
                        'url'=>$value['function_url']
                    );
                }

            }
            $result['currentUser'] = $_SESSION['staff_name'];
            $nav = array('nav'=>$result);
            $this->session->set_userdata($nav);
            $result['nav'] = $_SESSION['nav'];
            $result['title'] = '首页';
            $result['currentUrl'] = '/company/common';
            $this->load->twig_display('common.twig',$result);
        }
    }
    
    public function logout(){
        $this->session->unset_userdata('auth');
        $this->session->sess_destroy();
        redirect('/login/index');
    }
}