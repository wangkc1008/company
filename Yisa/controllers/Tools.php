<?php
/**
 * Created by PhpStorm.
 * User: Jeeson
 * Date: 2018/12/5
 * Time: 13:05
 */


// 数据修改操作功能类
class Tools extends CI_Controller {

    // 载入涉及的数据模型
    public function __construct() {
        parent::__construct();
        $this->load->model('test_system_model');
        $this->load->model('test_model_model');
        $this->load->model('test_data_model');
        $this->load->model('back_log_model');
    }

    // 添加系统 返回：0 输入为空，1 成功，2 重复添加
    public function add_system() {
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,7,1);
        }
        if($qx==1){
            $system = $_POST['system'];
            // 判断输入的系统是否为空
            if (!$system) { $message = 0; }
            else {
                // 判断是否重复添加
                $is_repeat = $this->test_system_model->is_repeat($system);
                if ($is_repeat == 1) { $message = 2; }
                // 执行添加操作
                else {
                    // 末尾添加系统
                    $this->test_system_model->add_system($system);
                    // 写日志
                    $this->back_log_model->add_log($_SESSION['user_name'],'测试数据-添加系统','添加--'.$system,date('Y-m-d H:i:s'));
                    $message = 1;
                }
            }
            echo $message;
        }else{
            $message = -1;
            echo $message;
        }
       
    }

    // 删除系统 需判断是否有测试模块
    public function delete_system() {
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,7,1);
        }
        if($qx==1){
            $system = $_POST['system'];
            $action = $_POST['action'];
            // model判断该系统是否存在测试模块
            $have_module = $this->test_system_model->is_have_module($system);
            // 该系统还存在模块
            if ($action == 'query' and $have_module == 1) { $message = 0; }
            // 执行删除
            if ($action == 'delete' or $have_module == 0) {
                // model删除
                $this->test_system_model->delete_system($system);
                // model写日志
                $this->back_log_model->add_log($_SESSION['user_name'],'测试数据-删除系统','删除--'.$system,date('Y-m-d H:i:s'));
                $message = 1;
            }
            echo $message;
        }else{
            $message = -1;
            echo $message;
        }
    }

    // 添加模块（可按序号插入） 返回：0 输入为空，1 成功，2 重复添加
    public function add_module() {
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,7,1);
        }
        if($qx==1){
            $system = $_POST['system'];
            $module_order =$_POST['module_order'];
            $module = $_POST['module'];
            if (!$module_order) { $module_order = null; }
            // 输入模块为空
            if (!$module) { $message = 0; }
            else {
                // 重复添加(model判断)
                $is_repeat = $this->test_model_model->is_repeat($system, $module);
                if ($is_repeat == 1) { $message = 2; }
                // 执行操作
                else {
                    // model按序号添数据,判断序号为空
                    $this->test_model_model->add_module($system, $module, $module_order);
                    // model写日志
                    $this->back_log_model->add_log($_SESSION['user_name'],'测试数据-'.$system.'系统','添加--'.$module,date('Y-m-d H:i:s'));
                    $message = 1;
                }
            }
            echo $message;
        }else{
            $message = -1;
            echo $message;
        }
    }

    // 删除模块 需判断是否有测试条件
    public function delete_module() {
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,7,1);
        }
        if($qx==1){
            $system = $_POST['system'];
            $module = $_POST['module'];
            $action = $_POST['action'];
            // model判断该模块是否有测试条件
            $have_condition = $this->test_model_model->is_have_condition($system, $module);
            // 模块存在条件
            if ($action == 'query' and $have_condition ==1) { $message = 0; }
            // 执行删除
            if ($action == 'delete' or $have_condition ==0) {
                // model删数据
                $this->test_model_model->delete_module($system, $module);
                // model写日志
                $this->back_log_model->add_log($_SESSION['user_name'],'测试数据-'.$system.'系统','删除--'.$module,date('Y-m-d H:i:s'));
                $message = 1;
            }
            echo $message;
        }else{
            $message = -1;
            echo $message;
        }
    }

    // 添加条件详情 (条件是多行) 返回：0 输入为空，1 成功，2 重复添加
    public function add_detail() {
        $system = $_POST['system'];
        $module = $_POST['module'];
        $conditions = $_POST['conditions'];
        // 输入条件为空
        if (!$conditions) { $message = 0;}
        else {
            // 按换行符分开条件
            $conditions_array = explode("\n", trim($conditions));
            // 记录重复的条件
            $repeat_conditions = array();
            foreach ($conditions_array as $condition) {
                // model判断重复
                $condition = trim($condition);
                $is_repeat = $this->test_data_model->is_repeat($system, $module, $condition);
                if ($is_repeat == 1) {
                    array_push($repeat_conditions, $condition);
                    continue;
                }
                // 执行添加
                else {
                    // model添加
                    $ok = $this->test_data_model->add_condition($system, $module, $condition);
                    // model写日志
                    $this->back_log_model->add_log($_SESSION['user_name'],'测试数据-'.$system.'系统'.$module.'模块','添加--'.$condition,date('Y-m-d H:i:s'));
                }
            }
            if (empty($repeat_conditions)) { $message = 1; }
            else {
                $message = implode('，', array_unique($repeat_conditions));
            }
        }
        echo $message;
    }

    // 删除条件详情
    public function delete_detail() {
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,7,1);
        }
        if($qx==1){
            $system = $_POST['system'];
            $module = $_POST['module'];
            $condition = $_POST['condition'];
            // 执行删除
            $message = $this->test_data_model->delete_condition($system, $module, $condition);
            // 写日志
            $this->back_log_model->add_log($_SESSION['user_name'],'测试数据-'.$system.'系统'.$module.'模块','添加--'.$condition,date('Y-m-d H:i:s'));
            echo $message;
        }else{
            $message = -1;
            echo $message;
        }
    }

    // 修改条件详情
    public function update_detail() {
        $data = $_SESSION['auth'];
        if($data=='admin'){
            $qx = 1;
        }else{
            $qx = substr($data,7,1);
        }
        if($qx==1){
            $system = $_POST['system'];
            $module = $_POST['module'];
            $condition = $_POST['condition'];
            $new_condition = $_POST['new_condition'];
            // 判断新条件是否已经存在
            $is_repeat = $this->test_data_model->is_repeat($system, $module, $new_condition);
            if ($is_repeat == 1) { $message = 2; }
            else {
                $this->test_data_model->update_condition($system, $module, $condition, $new_condition);
                 $this->back_log_model->add_log($_SESSION['user_name'],'测试数据-'.$system.'系统'.$module.'模块','修改--'.$new_condition,date('Y-m-d H:i:s'));
                $message = 1;
            }
            echo $message;
        }else{
            $message = -1;
            echo $message;
        }
    }
}