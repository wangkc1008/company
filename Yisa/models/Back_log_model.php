<?php
/*************************************************************************
* File Name: Back_log_model.php
* Author: zpf
* Mail: zpf@yisa.com 
* Created Time: Sat 25 Mar 2017 04:37:41 PM CST
************************************************************************/

class Back_log_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->DB1 = $this->load->database('default', TRUE);
    }

    /**
     * 如果日志表查表速度过慢，那么就是这个函数的问题
     * 因为使用了 username LIKE "%xx%" 这种前缀模糊查询的手段
     * 数据库并没有办法使用索引查询
     * 如果需要提升查询速度，可以改为 username LIKE "xx%" 这种后缀查询手段
     * 或者 直接精准查询 username= "xx"
     *
     * 2018/12/13
     */
    public function get_log_list($where,$offset,$length){
      $sql="select * from operation_log where date>'{$where['start_time']}' and date<'{$where['end_time']}'";

		  if(isset($where['user_name']))
        {
            $sql.=" and operation_log.username  like '%{$where['user_name']}%'";
        }
      if(isset($where['model']))
        {
            $sql.=" and operation_log.model  like '%{$where['model']}%'";
        }
		  if(isset($where['operation']))
        {
            $sql.=" and operation_log.operation like '%{$where['operation']}%'";
        }
      $sql .= "order by date desc  limit {$offset},{$length}";
      $query = $this->DB1->query($sql);
      return $query->result_array(); 
   }

   public function get_total($where){
      $sql="select * from operation_log where date>'{$where['start_time']}' and date<'{$where['end_time']}'";

      if(isset($where['user_name']))
        {
            $sql.=" and operation_log.username  like '%{$where['user_name']}%'";
        }
      if(isset($where['model']))
        {
            $sql.=" and operation_log.model  like '%{$where['model']}%'";
        }
      if(isset($where['operation']))
        {
            $sql.=" and operation_log.operation like '%{$where['operation']}%'";
        }
      $query = $this->DB1->query($sql);
      return $query->result_array();
   }

   public function add_log($user_name,$model,$operation,$date){
      $table = 'operation_log';
      $log = array(
        'username'=>$user_name,
        'model'=>$model,
        'operation'=>$operation,
        'date'=>$date
      );
      $this->db->trans_start();
      if($this->db->insert($table,$log)){
          $this->db->trans_complete();
          return true;
      }else{
          $this->db->trans_rollback();
          return false;
      }
   }
}