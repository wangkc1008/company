<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 * 项目运维规范控制器
 */
 $table = 'standard_operation';
class Project_operation_rule extends CI_Controller{
   
    public function __construct()
    {
        parent::__construct();
         $this->load->model('back_log_model');
        $this->load->model('project_operation_rule_model');
    }

    public function index(){
        if(!$_SESSION['user_name']){
           redirect('?c=login&m=index');
        }
        global $table;
        $data['nav'] = $_SESSION['nav'];
        $data['title'] = '项目运维规范';
        $data['currentUrl'] = '?c=project_operation_rule';
        $data['data'] = $this->project_operation_rule_model->select($table);
        $this->load->twig_display('project_operation_rule.twig',$data);
    }
    public function delete(){
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,4,1);
        }
        $result = array('success'=>FALSE);
        if($qx==1){
            global $table;
            $id = $_POST['id'];
            if(!empty($id)){
                $content = $this->project_operation_rule_model->selectItem($table,$id);
                $this->back_log_model->add_log($_SESSION['user_name'],'项目运维规范','删除--'.$content,date('Y-m-d H:i:s'));
                if($this->project_operation_rule_model->delete($table,$id)){
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
            $qx = substr($data,4,1);
        }
        if($qx==1){
            global $table;
            if (isset($_POST['id'])&&isset($_POST['content'])&&!empty($_POST['content']))
            {
                $id = $_POST['id'];
                $content = $_POST['content'];
                $this->back_log_model->add_log($_SESSION['user_name'],'项目运维规范','修改--'.$content,date('Y-m-d H:i:s'));
                if($this->project_operation_rule_model->update($table,$id,$content)){
                    redirect('?c=project_operation_rule');
                }else{
                    echo '<script>alert("修改失败");</script>';
                    echo '<script>window.location.href="?c=project_operation_rule"</script>';
                }
            }else{
                echo '<script>alert("添加规范不能为空");</script>';
                echo '<script>window.location.href="?c=project_operation_rule&m=index"</script>';
            }
        }else{
            echo '<script>alert("权限不足");</script>';
            echo '<script>window.location.href="?c=project_operation_rule"</script>';
        }
    }
    public function  insert(){
        global $table;
        if(isset($_POST['id'])&&isset($_POST['content']))
        {
            if(!empty($_POST['content'])) {
                $id = $_POST['id'];
                $content = $_POST['content'];
                $this->back_log_model->add_log($_SESSION['user_name'], '项目运维规范', '添加--' . $content, date('Y-m-d H:i:s'));
                $this->project_operation_rule_model->insert($table, $id, $content);
                redirect('?c=project_operation_rule');
            }else{
                echo '<script>alert("添加规范不能为空");</script>';
                echo '<script>window.location.href="?c=project_operation_rule&m=index"</script>';
            }
        }
    }

}