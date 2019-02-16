<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * 登陆模型
 */
class Login_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function select($table, $where, $offset, $limit)
    {
        $sql = 'select * from ' . $table;
        if (isset($where['dpt_id']) && isset($where['name'])) {
            $sql .= " where dpt_id={$where['dpt_id']} and staff_name like '%{$where['name']}%' or staff_num like '%{$where['name']}%'";
        } elseif (isset($where['dpt_id'])) {
            $sql .= ' where dpt_id=' . $where['dpt_id'];
        } elseif (isset($where['name'])) {
            $sql .= " where staff_name like '%{$where['name']}%' or staff_num like '%{$where['name']}%'";
        }
        if (isset($offset) && isset($limit)) {
            $sql .= ' limit ' . $offset . ',' . $limit;
        }
        $result = $this->db->query($sql)->result_array();
        if (!empty($result)) {
            return $result;
        } else {
            return false;
        }
    }

    public function update($table, $id, $auth)
    {
        $this->db->trans_start();
        $sql = 'update ' . $table . ' set authority="' . $auth . '" where user_id=' . $id;
        if ($this->db->query($sql)) {
            $this->db->trans_complete();
            return true;
        } else {
            $this->db->trans_rollback();
            return false;
        }
    }

    public function select_Auth($table, $id)
    {
        $sql = 'select authority from ' . $table . ' where user_id=' . $id;
        $result = $this->db->query($sql)->result_array();
        if (!empty($result)) {
            return $result[0]['authority'];
        } else {
            return false;
        }
    }

    public function selectUser($table)
    {
        $sql = 'select user_name from ' . $table;
        $result = $this->db->query($sql)->result_array();
        if (!empty($result)) {
            return $result;
        } else {
            return false;
        }
    }


    public function get_user($table, $id)
    {
        $result = $this->db->select("*")->from($table)->where("user_id", $id)->get()->result_array();
        if (!empty($result)) {
            return $result;
        } else {
            return false;
        }
    }

    public function updateUser($table, $id)
    {
        $sql = 'select user_name from ' . $table . ' where user_id != ' . $id;
        $result = $this->db->query($sql)->result_array();
        if (!empty($result)) {
            return $result;
        } else {
            return false;
        }
    }

    public function delete($table, $id)
    {
        $this->db->trans_start();
        if ($this->db->delete($table, array('user_id' => $id))) {
            $this->db->trans_complete();
            return TRUE;
        } else {
            $this->db->trans_rollback();
            return FALSE;
        }
    }

    public function update_User($table, $id, $data = array())
    {
        $this->db->trans_start();
        if ($this->db->update($table, $data, array('user_id' => $id))) {
            $this->db->trans_complete();
            return true;
        } else {
            $this->db->trans_rollback();
            return false;
        }

    }

    public function insert($table, $data = array())
    {
        $this->db->trans_start();
        if ($this->db->insert($table, $data)) {
            $this->db->trans_complete();
            return true;
        } else {
            $this->db->trans_rollback();
            return false;
        }
    }

    public function get_Total($table, $where)
    {
        $sql = 'select count(*) from ' . $table;
        if (isset($where['dpt_id']) && isset($where['name'])) {
            $sql .= " where dpt_id={$where['dpt_id']} and staff_name like '%{$where['name']}%' or staff_num like '%{$where['name']}%'";
        } elseif (isset($where['dpt_id'])) {
            $sql .= ' where dpt_id=' . $where['dpt_id'];
        } elseif (isset($where['name'])) {
            $sql .= " where staff_name like '%{$where['name']}%' or staff_num like '%{$where['name']}%'";
        }
        $query = $this->db->query($sql)->result_array();
        return $query[0]['count(*)'];

    }
}