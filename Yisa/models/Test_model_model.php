<?php
/**
 * Created by PhpStorm.
 * User: wbn
 * Date: 2018/12/6
 * Time: 11:05
 */

class Test_model_model extends CI_Model{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    /**
     * 获得当前页面中model最大的序号
     *
     * @param int $s_id 传入的系统id
     * @return int 最大序号
     */
    private function get_greatest_id(int $s_id )
    {
        $sql = "SELECT index_id FROM test_model WHERE s_id = ? ORDER BY index_id DESC LIMIT 0,1;";
        $query = $this->db->query($sql,array($s_id));
        if (null == ($query->result_array())) {
            return 0;
        }
        return $query->result_array()[0]['index_id'];
    }

    /**
     * 添加一个新模块
     *
     * @param int $system_id 需要添加到的系统的id
     * @param string $model_name 需要添加的模块名
     * @param int|null $index_id 需要插入到的序号，可以为空
     * @return bool 添加成功返回true，否则返回false
     */
    public function add_model(int $system_id,string $model_name,int $index_id=null){
        if($index_id==null){
            $greatest_id = $this->get_greatest_id($system_id);
            $greatest_id++;
            $this->db->set('id',null);
            $this->db->set('s_id',$system_id);
            $this->db->set('model_name',$model_name);
            $this->db->set('index_id',$greatest_id);

            $query = $this->db->insert('test_model');
            if($query==true){
                return true;
            }
            else{
                return false;
            }
        }
        else{
            $where = array('s_id'=>$system_id, 'index_id>='=>$index_id);
            $this->db->set('index_id','index_id+1',false)->where($where)->update("test_model");
            $this->db->set('id',null);
            $this->db->set('s_id',$system_id);
            $this->db->set('model_name',$model_name);
            $this->db->set('index_id',$index_id);
            $query = $this->db->insert('test_model');
            if($query==true){
                return true;
            }
            else{
                return false;
            }
        }
    }


    /**
     * 删除指定的模块，并删除模块的数据
     *
     * @param int $s_id 模块所在系统id
     * @param int $index_id 模块序号
     * @param int $model_id 模块id
     * @return bool 成功返回true，否则返回false
     */
    public function del_model(int $s_id,int $index_id,int $model_id){
        $this->db->trans_start();
        $this->db->where("m_id",$model_id)->delete("test_data");
        $this->db->where("s_id",$s_id)->where("index_id",$index_id)->delete("test_model");
        $this->db->set("index_id","index_id-1",false)->where("index_id>",$index_id)->update("test_model");
        $this->db->trans_complete();
        if ($this->db->affected_rows() != 0){
            return true;
        }
        return false;
    }

    /**
     * 根据系统的id，来获得模块的内容
     *
     * @param int $s_id 系统id
     * @return array 模块内容
     */
    public function get_all_model(int $s_id)
    {
        $res = $this->db->where("s_id",$s_id)->order_by('index_id', 'ASC')->get("test_model")->result_array();
        return $res;
    }

    /**
     * 根据系统名获取全部模块名称
     * @param $system
     * @return array
     */
    public function get_module_name ($system) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $query_result = $this->get_all_model($system_id);
        $modules = array();
        foreach ($query_result as $result) {
            array_push($modules, $result['model_name']);
        }
        return $modules;
    }

    /**
     * 根据模块名称把模块添加到系统对应的位置
     * @param $system
     * @param $module_order
     * @param $module
     */
    public function add_module($system, $module, $module_order=null) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $this->add_model($system_id, $module, $module_order);
    }

    /**
     * 判断模块是否已经存在
     * @param $module
     * @return int 1:存在 0:不存在
     */
    public function is_repeat($system, $module) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $where= array('s_id'=>$system_id, 'model_name'=>$module);
        $query_result = $this->db->where($where)->get('test_model')->result_array();
        if (empty($query_result)) { return 0; }
        else { return 1; }
    }

    /**
     * 根据系统名和模块名删除模块
     * @param $system
     * @param $module
     */
    public function delete_module($system, $module) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $where= array('s_id'=>$system_id, 'model_name'=>$module);
        $module_id = $this->db->where($where)->get('test_model')->row_array()['id'];
        $module_order = $this->db->where($where)->get('test_model')->row_array()['index_id'];
        $this->del_model($system_id, $module_order, $module_id);
    }

    /**
     * 根据系统名称和条件名称判断模块是否含有条件
     * @param $system
     * @param $module
     * @return int 1:有条件 0:没有条件
     */
    public function is_have_condition($system, $module) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $where= array('s_id'=>$system_id, 'model_name'=>$module);
        $module_id = $this->db->where($where)->get('test_model')->row_array()['id'];
        $query_result = $this->db->where('m_id', $module_id)->get('test_data')->result_array();
        if (empty($query_result)) { return 0; }
        else { return 1; }
    }

}