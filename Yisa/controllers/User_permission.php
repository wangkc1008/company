<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 * 用户权限控制器
 */
$table = 'function_list';
class User_permission extends CI_Controller
{
	
	public function __construct(){
		parent::__construct();
		$this->load->model('login_model');
		$this->load->model('common_model');
	}

	public function index(){
		if(!$_SESSION['user_name']){
            redirect('?c=login&m=index');
        }else if($_SESSION['auth']=='admin'){
			$id = $_REQUEST['id'];
			$auth = $this->login_model->select_Auth('yisa_user',$id);
			if($auth=='admin'){
				$auth='111111111111';
			}
			$data['id'] = $id;
			$query = $this->common_model->select('function_list');
			$i = 0;
			$result['develop']['name'] = '开发';
			$result['train']['name'] = '培训';
			$result['test']['name'] = '测试';
			foreach ($query as $key => $value) {
	            if ($value['pid']==1) {
	                //开发模块功能
	                $result['develop']['data'][]=array(
		                    'id'=>$value['id'],
		                    'name'=>$value['function_name'],
		                    'checked'=>substr($auth,$i,1)
	                );
	            }elseif ($value['pid']==2) {
	                //培训功能模块
	                $result['train']['data'][]=array(
		                    'id'=>$value['id'],
		                    'name'=>$value['function_name'],
		                    'checked'=>substr($auth,$i,1)
	                );
	            }elseif ($value['pid']==3){
	            	$result['test']['data'][]=array(
		                    'id'=>$value['id'],
		                    'name'=>$value['function_name'],
		                    'checked'=>substr($auth,$i,1)
	                );
	            }
	            $i++;
	        }
	        $data['nav'] = $_SESSION['nav'];
			$data['title'] = '用户权限设置';
			$data['currentUrl'] = '?c=user_permission';
			foreach ($result as $key => $value) {
				$data['menuTab'][] = array(
					'name'=>$value['name'],
	                'id'=>$key,
	                'child_nodes'=>$value['data']
				);
			}
			$this->load->twig_display('user_permission.twig',$data);
		}else{
			echo '<script>alert("后台仅管理员账户访问");</script>';
			echo '<script>window.location.href="?c=common&m=index"</script>';
		}
	}

	public function update(){
		$result = array('success'=>false);
		if(isset($_POST['id'])&&isset($_POST['auth'])){
			$id = $_POST['id'];
			$auth = $_POST['auth'];
			$currentAuth = $this->login_model->select_Auth('yisa_user',$id);
			if($currentAuth=='admin'){
				$auth = 'admin';
			}
			if($this->login_model->update('yisa_user',$id,$auth)){
 				$result['success'] = TRUE;
                echo json_encode($result);
            }else{
                echo json_encode($result);
            }
		}else{
			echo json_encode($result);
		}
	}
}