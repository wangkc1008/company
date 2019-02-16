<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Back_log extends CI_Controller{
	public function __construct()
	{
		parent::__construct();
		$this->load->model('back_log_model');
	}

    public function index() {
        if(!$_SESSION['user_name']){
            redirect('?c=login&m=index');
        }else if($_SESSION['auth']=='admin'){
            extract($_REQUEST);
            $date = array();
            if(isset($_REQUEST["begin_date"]))
            {
                $start_date = $begin_date." ".$b_h.":".$b_m.":".$b_s;
                $end_date = $end_date." ".$e_h.":".$e_m.":".$e_s;

            }else
            {
                $start_date = date("Y-m-d 00:00:00");
                $end_date = date("Y-m-d H:i:s");
            } 
            $length = 10;
            $where=array();
            if(isset($_GET['pn'])){
                $page = $_GET['pn'];
            }else{
                $page = 1;
            }
            $array["search"]=array(
                array("id"=>1,"name"=>"账号"),
                array("id"=>2,"name"=>"模块"),
                array("id"=>3,"name"=>"操作"),
            );

            if(isset($_GET['condition'])&&isset($_GET['search'])){
                if($_GET['search'] == 1){
                    $where['user_name'] = $_GET['condition'];
                }
                else if($_GET['search'] == 2){
                    $where['model'] = $_GET['condition'];
                }
                else if($_GET['search'] == 3){
                    $where['operation'] = $_GET['condition'];
                }
                $array['condition'] = $_GET['condition'];
                $array['search_id'] = $_GET['search'];
            }

            $where['start_time']=$start_date;
            $where['end_time']=$end_date;
            $total = $this->back_log_model->get_total($where);
            $total_page = intval(count($total)/$length)+ 1;
            $array['current_page'] = $page;
            $array['request'] = $_REQUEST;
            $array['pages'] = range(1,$total_page);
            $array['total_page'] = $total_page;
            
            $array['nav'] = $_SESSION['nav'];
            unset($_GET['pn']);
            $array["selectUrl"]= '?'.http_build_query($_GET);

            $array["log_list"]=$this->back_log_model->get_log_list($where,strval($page-1)*$length,strval($length));

            $array['date'] = $date;

            $this->load->twig_display('logger.twig',$array);
        }else{
            echo '<script>alert("后台仅管理员账户访问");</script>';
            echo '<script>window.location.href="?c=common&m=index"</script>';
        }
    }
}
