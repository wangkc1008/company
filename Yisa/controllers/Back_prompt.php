<?php


defined('BASEPATH') OR exit('No direct script access allowed');

class Back_prompt extends CI_Controller{
	public function __construct()
	{
		parent::__construct();
		$this->load->model("Back_prompt_model");
	}

	public function index()
    {
        if(!$_SESSION['user_name']){
            redirect('?c=login&m=index');
        }else if($_SESSION['auth']=='admin'){
            $data['nav'] = $_SESSION['nav'];
        	$data['save_url'] = "?c=Back_prompt&m=save_data";
            $this->load->twig_display('prompt.twig',$data);
        }else{
            echo '<script>alert("后台仅管理员账户访问");</script>';
            echo '<script>window.location.href="?c=common&m=index"</script>';
        }

    }
    public function save_data(){
		$title = $_POST['title'];
    	$prompt = $_POST['prompt'];

		//print_r($data);
		if(!empty($title)&&!empty($prompt)){
            $r = $this->Back_prompt_model->update_info($title,$prompt, 'sys_prompt');
            echo"<script>alert('修改成功'),location.href='?c=back_prompt&m=index';</script>";
        }else{
        	echo"<script>alert('标题和内容不能为空'),location.href='?c=back_prompt&m=index';</script>";
        }

    }
}




