
<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 * 登陆控制器
 */
class Login extends CI_Controller
{
    public function __construct(){
        parent::__construct();
        $this->load->model('login_model');
         $this->load->model('back_prompt_model');
    }

    public function index(){
        $data['title'] = '登陆系统';
        $data['currentUrl'] = '?c=login&m=login_in';
        $this->load->twig_display('login.twig',$data);
    }

    public function login_in(){
        $table = 'yisa_user';
        $data = $this->login_model->select($table,null,null,null);
        $account = $_POST['user_name'];
        $password = $_POST['user_passwd'];
        $tips = $this->back_prompt_model->select('sys_prompt')[0];
        $title = $tips['title'];
        $prompt = $tips['prompt'];
        $flag = false;
        foreach ($data as $key => $value) {
            if ($account==$value['user_name']&&$password==$value['user_passwd']) {
                //密码正确,保存session信息，跳转首页
                $userdata = array('auth'=>$value['authority'],'staff_name'=>$value['staff_name'],'user_name'=>$value['user_name'],'user_passwd'=>$value['user_passwd']);
                $this->session->set_userdata($userdata);
                $flag = true;
                echo '<script>alert("提示:'.$title.'——'.$prompt.'")</script>';
                echo '<script>window.location.href="?c=common&m=index"</script>';
            }else{
                $flag = false;
            }
        }
        if(!$flag){
            echo "<script>alert('用户名或密码错误，请重新输入！')</script>";
            echo '<script>window.location.href="?c=login"</script>';
        }
    }
}