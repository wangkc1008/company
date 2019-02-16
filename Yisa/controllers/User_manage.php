<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 * 用户管理控制器
 */
$table = 'yisa_user';

class User_manage extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('login_model');
    }

    public function index()
    {
        if (!$_SESSION['user_name']) {
            redirect('?c=login&m=index');
        } else if ($_SESSION['auth'] == 'admin') {
            $length = 20;
            if (isset($_GET['pn'])) {
                $page = $_GET['pn'];
            } else {
                $page = 1;
            }
            $where = array();
            if (isset($_GET['depart']) || isset($_GET['name'])) {
                if ($_GET['depart'] == 0 && empty($_GET['name'])) {
                    redirect('?c=user_manage&m=index');
                }
                if (isset($_GET['depart']) && ($_GET['depart'] != 0)) {
                    $where['dpt_id'] = $_GET['depart'];
                    $data['depart'] = $_GET['depart'];
                }
                if (!empty($_GET['name'])) {
                    $where['name'] = $_GET['name'];
                    $data['name'] = $_GET['name'];
                }

            }
            global $table;
            $count = $this->login_model->get_Total($table, $where);
            $total_page = intval($count / $length) + 1;
            $data['pages'] = range(1, $total_page);
            $data['total_page'] = $total_page;
            $data['current_page'] = $page;
            $data['nav'] = $_SESSION['nav'];
            $data['title'] = '用户管理';
            $data['currentUrl'] = '?c=user_manage';
            unset($_GET['pn']);
            $data['searchUrl'] = '?' . http_build_query($_GET);
            $data['data'] = $this->login_model->select($table, $where, strval($page - 1) * $length, strval($length));
            $this->load->twig_display('user_manege.twig', $data);
        } else {
            echo '<script>alert("后台仅管理员账户访问");</script>';
            echo '<script>window.location.href="?c=common&m=index"</script>';
        }

    }

    public function delete()
    {
        $result = array('success' => FALSE);
        if ($_SESSION['auth'] == 'admin') {
            global $table;
            $id = $_POST['id'];
            if (!empty($id)) {
                if ($this->login_model->delete($table, $id)) {
                    $result['success'] = TRUE;
                    echo json_encode($result);
                } else {
                    echo json_encode($result);
                }
            }
        } else {
            $result = array('success' => 0);
            echo json_encode($result);
        }
    }

    public function get()
    {
        $result = array('success' => FALSE);
        if ($_SESSION['auth'] == 'admin') {
            global $table;
            $id = $_POST['id'];
            if (!empty($id)) {
                $result = $this->login_model->get_user($table, $id);
                echo json_encode($result);
            }
        } else {
            $result = array('success' => 0);
            echo json_encode($result);
        }
    }

    public function update()
    {
        global $table;
        if ($_SESSION['auth'] == 'admin') {
            if (!empty($_POST['user_id']) && !empty($_POST['user_name']) && !empty($_POST['user_passwd']) && !empty($_POST['staff_name']) && !empty($_POST['staff_email']) && !empty($_POST['staff_num']) && !empty($_POST['character']) && !empty($_POST['depart'])) {
                $flag = true;
                $allUser = $this->login_model->updateUser($table, $_POST['user_id']);
                foreach ($allUser as $k => $v) {
                    if ($v['user_name'] == $_POST['user_name']) {
                        $flag = false;
                        break;
                    }
                }
                $user_id = $_POST['user_id'];
                $character = $_POST['character'];
                $depart = $_POST['depart'];
                $auth = $this->login_model->select_Auth($table, $user_id);
                if ($character == 'admin') {
                    $auth = 'admin';
                }
                if (strpos($depart, '开发') !== false) {
                    $dpt_id = 1;
                } elseif (strpos($depart, '测试') !== false) {
                    $dpt_id = 2;
                } else {
                    $dpt_id = 0;
                }
                $data = array(
                    'user_name' => $_POST['user_name'],
                    'user_passwd' => $_POST['user_passwd'],
                    'staff_name' => $_POST['staff_name'],
                    'staff_email' => $_POST['staff_email'],
                    'staff_num' => $_POST['staff_num'],
                    'staff_dpt' => $_POST['depart'],
                    'dpt_id' => $dpt_id,
                    'authority' => $auth
                );
                if ($flag) {
                    if ($this->login_model->update_User($table, $user_id, $data)) {
                        redirect('?c=user_manage');
                    } else {
                        echo '<script>alert("修改失败");</script>';
                        echo '<script>window.location.href="?c=user_manage"</script>';
                    }
                } else {
                    echo '<script>alert("该用户已存在");</script>';
                    echo '<script>window.location.href="?c=user_manage&m=index"</script>';
                }
            } else {
                echo '<script>alert("请填写全部信息");</script>';
                echo '<script>window.location.href="?c=user_manage"</script>';
            }
        } else {
            echo '<script>alert("权限不足");</script>';
            echo '<script>window.location.href="?c=common"</script>';
        }
    }

    public function insert()
    {
        global $table;
        if ($_SESSION['auth'] == 'admin') {
            if (!empty($_POST['user_name']) && !empty($_POST['user_passwd']) && !empty($_POST['staff_name']) && !empty($_POST['staff_email']) && !empty($_POST['staff_num']) && !empty($_POST['character']) && !empty($_POST['depart'])) {
                $flag = true;
                $allUser = $this->login_model->selectUser($table);
                foreach ($allUser as $k => $v) {
                    if ($v['user_name'] == $_POST['user_name']) {
                        $flag = false;
                        break;
                    }
                }
                $character = $_POST['character'];
                $depart = $_POST['depart'];
                if ($character == 'admin') {
                    $auth = 'admin';
                } else {
                    $auth = '0000000000';
                }
                if (strpos($depart, '开发') !== false) {
                    $dpt_id = 1;
                } elseif (strpos($depart, '测试') !== false) {
                    $dpt_id = 2;
                } else {
                    $dpt_id = 0;
                }
                $data = array(
                    'user_name' => $_POST['user_name'],
                    'user_passwd' => $_POST['user_passwd'],
                    'staff_name' => $_POST['staff_name'],
                    'staff_email' => $_POST['staff_email'],
                    'staff_num' => $_POST['staff_num'],
                    'staff_dpt' => $_POST['depart'],
                    'dpt_id' => $dpt_id,
                    'authority' => $auth
                );
                if ($flag) {
                    if ($this->login_model->insert($table, $data)) {
                        redirect('?c=user_manage&m=index');
                    } else {
                        echo '<script>alert("添加失败");</script>';
                        echo '<script>window.location.href="?c=user_manage&m=index"</script>';
                    }
                } else {
                    echo '<script>alert("该用户已存在");</script>';
                    echo '<script>window.location.href="?c=user_manage&m=index"</script>';
                }
            } else {
                echo '<script>alert("请填写全部信息");</script>';
                echo '<script>window.location.href="?c=user_manage&m=index"</script>';
            }
        } else {
            echo '<script>alert("权限不足");</script>';
            echo '<script>window.location.href="?c=user_manage&m=index"</script>';
        }
    }
}