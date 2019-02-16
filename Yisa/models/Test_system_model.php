<?php
/**
 * Created by PhpStorm.
 * User: wbn
 * Date: 2018/12/6
 * Time: 10:29
 */

class Test_system_model extends CI_Model
{


    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }


    /**
     * 添加新系统
     *
     * @param string $system_name 系统名
     * @return bool 添加成功返回true，否则返回false
     */
    public function add_system(string $system_name)
    {
        $this->db->set('id', null);
        $this->db->set('system_name', $system_name);
        $query = $this->db->insert('test_system');
        if ($query == true) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 删除系统，以及其下的模块和模块数据
     *
     * @param int $s_id 传入的系统id
     */
    public function del_system(int $s_id)
    {
        $this->db->trans_start();
        $m_id_arr = $this->db->select("id")->from("test_model")->where("s_id", $s_id)->get()->result_array();
        foreach ($m_id_arr as $item) {
            $this->db->where("id", $item['id'])->delete("test_model");
            $this->db->where("m_id", $item['id'])->delete("test_data");
        }
        $this->db->where("id", $s_id)->delete("test_system");
        $this->db->trans_complete();
    }

    /**
     * 获得全部的系统菜单
     *
     * @return array 系统数据
     */
    public function get_all_system()
    {
        return $this->db->get("test_system")->result_array();
    }

    /**
     * 判断某个系统是否存在 系统表中
     * @param $system
     * @return bool true:存在   false:不存在
     */
    public function is_repeat($system)
    {
        $query_result = $this->db->where('system_name', $system)->get("test_system")->result_array();
        if (empty($query_result)) { return 0; }
        else { return 1; }
    }

    /**
     * 获取系统的名称
     * @return array 系统名字的数组
     */
    public function get_system_name() {
        $system = array();
        $query_result =  $this->db->select("system_name")->get("test_system")->result_array();
        foreach ($query_result as $result) {
            array_push($system, $result['system_name']);
        }
        return $system;
    }

    /**
     * 判断某个系统是否含有测试模块
     * @param $system
     * @return bool true:有 false:没有
     */
    public function is_have_module($system) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $query_result = $this->db->select("*")->from('test_model')->where('s_id', $system_id)->get()->result_array();
        if (empty($query_result)) { return 0; }
        else { return 1; }
    }

    /**
     * 根据系统名删除其所有数据
     * @param $system
     */
    public function delete_system($system) {
        $system_id = $this->db->select('id')->where('system_name', $system)->get('test_system')->row_array()['id'];
        $this->del_system($system_id);
    }
}
