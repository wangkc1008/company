<?php


defined('BASEPATH') OR exit('No direct script access allowed');

class Back_prompt_model extends CI_Model{
	public function __construct()
	{
		$this->load->database();
		parent::__construct();
	}

    public function update_info($title,$prompt,$table) {

		$judge_sql = "select * from $table where id = 1" ;
		$query = $this->db->query($judge_sql);
		if(empty($query->result_array())){
			$sql = "insert $table values (1,'$title','$prompt')";
		}else{
			$sql = "update $table set title='$title', prompt='$prompt' where id = 1";
		}
        $this->db->query($sql);
        return $this->db->affected_rows();
    }

    public function select($table){
    	$this->db->select('*');
    	$query = $this->db->get($table);
    	if($query->num_rows()>0){
    		return $query->result_array();
    	}
    }
}


