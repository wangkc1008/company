<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 * 常用字段定义控制器
 */
$table = 'common_field';
class common_field_define extends CI_Controller
{
	
	public function __construct()
    {
        parent::__construct();
        $this->load->model('common_field_define_model');
        $this->load->model('back_log_model');
    }

    public function index(){
        if(!$_SESSION['user_name']){
           redirect('?c=login&m=index');
        }
        global $table;
        $data['nav'] = $_SESSION['nav'];
        $data['title'] = '常用字段定义';
        $data['currentUrl'] = '?c=common_field_define';
        $data['data'] = $this->common_field_define_model->select($table);
        $this->load->twig_display('common_field.twig',$data);
     }
     public function delete(){
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,3,1);
        }
        $result = array('success'=>FALSE);
        if($qx==1){
            global $table;
            $id = $_POST['id'];
            if(!empty($id)){
                $content = $this->common_field_define_model->selectItem($table,$id);
                $this->back_log_model->add_log($_SESSION['user_name'],'常用字段定义','删除--字段名:'.$content['field_name'].',字段含义:'.$content['field_mean'],date('Y-m-d H:i:s'));
                if($this->common_field_define_model->delete($table,$id)){
                    $result['success'] = TRUE;
                    echo json_encode($result);
                }else{
                    echo json_encode($result);
                }
            }
        }else{
            $result = array('success'=>0);
            echo json_encode($result);
        }
        

     }
     public function update(){
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,3,1);
        }
        if($qx==1){
            global $table;
            if (isset($_POST['id'])&&isset($_POST['field_name'])&&isset($_POST['field_mean'])&&!empty($_POST['field_name'])&&!empty($_POST['field_mean'])){
                $id = $_POST['id'];
                $field_name = $_POST['field_name'];
                $field_mean = $_POST['field_mean'];
                $this->back_log_model->add_log($_SESSION['user_name'],'常用字段定义','修改--字段名:'.$field_name.',字段含义:'.$field_mean,date('Y-m-d H:i:s'));
                if($this->common_field_define_model->update($table,$id,$field_name,$field_mean)){
                    redirect('?c=common_field_define');
                }else{
                    echo '<script>alert("修改失败");</script>';
                    echo '<script>window.location.href="?c=common_field_define"</script>';
                }
            }else{
                echo '<script>alert("添加内容不能为空");</script>';
                echo '<script>window.location.href="?c=common_field_define&m=index"</script>';
            }
        }else{
            echo '<script>alert("权限不足");</script>';
            echo '<script>window.location.href="?c=common_field_define"</script>';
        }
     }

     public function insert(){
        global $table;
        if(isset($_POST['id'])&&isset($_POST['field_name'])&&isset($_POST['field_mean']))
        {
            if(!empty($_POST['field_name'])&&!empty($_POST['field_mean'])) {
                $id = $_POST['id'];
                $field_name = $_POST['field_name'];
                $field_mean = $_POST['field_mean'];
                $this->back_log_model->add_log($_SESSION['user_name'], '常用字段定义', '添加--字段名:' . $field_name . ',字段含义:' . $field_mean, date('Y-m-d H:i:s'));
                $this->common_field_define_model->insert($table, $id, $field_name, $field_mean);
                redirect('?c=common_field_define');
            }else{
                echo '<script>alert("添加内容不能为空");</script>';
                echo '<script>window.location.href="?c=common_field_define&m=index"</script>';
            }
        }
     }
}