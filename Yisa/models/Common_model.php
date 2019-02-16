<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 *首页模型 
 */
class Common_model extends CI_Model
{
	public function __construct(){
        parent::__construct();
        $this->load->database();
    }
    /**
     * 读取功能列表
     * @param  String $table function_list
     * @return Array        
     */
    public function select($table){
    	$this->db->trans_start();
    	$this->db->select('*');
    	$result = $this->db->get($table);
    	if($result->num_rows()>0){
    		$data = $result->result_array();
    		$this->db->trans_complete();
    		return $data; 
    	}else{
    		return false;
    	}
    }
}