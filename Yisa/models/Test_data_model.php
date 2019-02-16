<?php
/**
 * Created by PhpStorm.
 * User: wbn
 * Date: 2018/12/6
 * Time: 11:57
 */


class Test_data_model extends CI_Model{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    /**
     * 增加数据
     *
     * @param int $model_id 模块id
     * @param string $content 数据内容
     * @return int  成功返回1,失败返回0
     */
    public function add_data(int $model_id,string $content){
        $this->db->set('id',null);
        $this->db->set('m_id',$model_id);
        $this->db->set('content',$content);
        $query = $this->db->insert('test_data');
        if($query==true){
            return 1;
        }
        else{
            return 0;
        }
    }


    /**
     * 修改数据
     *
     * @param int $data_id  数据id
     * @param string $content 数据内容
     */
    public function update_data(int $data_id,string $content){
        $update = "UPDATE " . "test_data" . " SET content = '".$content ."' WHERE id = " . $data_id . ";";
        $this->db->query($update);
    }


    /**
     * 删除数据
     *
     * @param int $data_id 数据id
     * @return int 成功返回1 失败返回0
     */
    public function del_data(int $data_id){

        $this->db->where('id',$data_id);
        $this->db->delete('test_data');
        if($this->db->affected_rows()!==0){
            return 1;
        }
        else{
            return 0;
        }

    }


    /**
     * 根据模块id，获取数据内容
     * @param int $m_id 模块id
     * @return mixed  返回数据内容
     */
    public function get_all_data(int $m_id){
        $res = $this->db->where("m_id",$m_id)->get("test_data")->result_array();
        return $res;
    }

    /**
     * 根据系统名称获取该系统的所有模块和条件的所有数据
     * @param $system
     * @return array
     */
    public function get_all_conditions($system) {
        $conditions = array();
        $system_id = $this->db->select('id')->from('test_system')->where('system_name', $system)->get()->row_array()['id'];
        $modules_array= $this->db->select('*')->from('test_model')->where('s_id', $system_id)->order_by('index_id', 'ASC')->get()->result_array();
        $conditions['modules'] = $modules_array;
        foreach ($modules_array as $module) {
            $module_id = $module['id'];
            $condition_list = $this->get_all_data($module_id);
            $conditions['modules'][$module['index_id']-1]['condition_list'] = $condition_list;
        }
        return $conditions;
    }

    /**
     * 根据系统名、模块名和条件名称删除条件
     * @param $system
     * @param $module
     * @param $condition
     * @return int 1:成功 0:失败
     */
    public function delete_condition($system, $module, $condition) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $where= array('s_id'=>$system_id, 'model_name'=>$module);
        $module_id = $this->db->where($where)->get('test_model')->row_array()['id'];
        $where= array('m_id'=>$module_id, 'content'=>$condition);
        $condition_id = $this->db->where($where)->get('test_data')->row_array()['id'];
        $ok = $this->del_data($condition_id);
        return $ok;
    }

    /**
     * 根据系统名、模块名、条件名称、新条件名称更新条件
     * @param $system
     * @param $module
     * @param $condition
     * @param $new_condition
     */
    public function update_condition($system, $module, $condition, $new_condition) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $where= array('s_id'=>$system_id, 'model_name'=>$module);
        $module_id = $this->db->where($where)->get('test_model')->row_array()['id'];
        $where= array('m_id'=>$module_id, 'content'=>$condition);
        $condition_id = $this->db->where($where)->get('test_data')->row_array()['id'];
        $this->update_data($condition_id, $new_condition);
    }

    /**
     * 根据系统名、模块名和条件名判断条件是否存在
     * @param $system
     * @param $module
     * @param $condition
     * @return int 1:存在 0:不存在
     */
    public function is_repeat($system, $module, $condition) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $where= array('s_id'=>$system_id, 'model_name'=>$module);
        $module_id = $this->db->where($where)->get('test_model')->row_array()['id'];
        $where= array('m_id'=>$module_id, 'content'=>$condition);
        $query_result = $this->db->where($where)->get('test_data')->result_array();
        if (empty($query_result)) { return 0;}
        else { return 1; }
    }


    public function add_condition($system, $module, $condition) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $where= array('s_id'=>$system_id, 'model_name'=>$module);
        $module_id = $this->db->where($where)->get('test_model')->row_array()['id'];
        $ok = $this->add_data($module_id, $condition);
        return $ok;
    }
}