<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 * 后端编码规范控制器
 */
$table = 'standard_back';

class back_coding_rule extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('back_log_model');
        $this->load->model('back_coding_rule_model');
    }

    public function index()
    {
        if (!$_SESSION['user_name']) {
            redirect('?c=login&m=index');
        }
        global $table;
        $data['nav'] = $_SESSION['nav'];
        $data['title'] = '后端编码规范';
        $data['currentUrl'] = '?c=back_coding_rule';
        $data['data'] = $this->back_coding_rule_model->select($table);
        $this->load->twig_display('back_rule.twig', $data);
    }

    public function delete()
    {
        $data = $_SESSION['auth'];
        if ($data == 'admin') {
            $qx = 1;
        } else {
            $qx = substr($data, 2, 1);
        }
        $result = array('success' => FALSE);
        if ($qx == 1) {
            global $table;
            $id = $_POST['id'];
            if (!empty($id)) {
                $content = $this->back_coding_rule_model->selectItem($table, $id);
                $this->back_log_model->add_log($_SESSION['user_name'], '后端编码规范', '删除--' . $content, date('Y-m-d H:i:s'));
                if ($this->back_coding_rule_model->delete($table, $id)) {
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

    public function update()
    {
        $data = $_SESSION['auth'];
        if ($data == 'admin') {
            $qx = 1;
        } else {
            $qx = substr($data, 2, 1);
        }
        if ($qx == 1) {
            global $table;
            if (isset($_POST['id']) && isset($_POST['content']) && !empty($_POST['content'])) {
                $id = $_POST['id'];
                $content = $_POST['content'];
                $this->back_log_model->add_log($_SESSION['user_name'], '后端编码规范', '修改--' . $content, date('Y-m-d H:i:s'));
                if ($this->back_coding_rule_model->update($table, $id, $content)) {
                    redirect('?c=back_coding_rule');
                } else {
                    echo '<script>alert("修改失败");</script>';
                    echo '<script>window.location.href="?c=back_coding_rule"</script>';
                }
            } else {
                echo '<script>alert("添加规范不能为空");</script>';
                echo '<script>window.location.href="?c=back_coding_rule&m=index"</script>';
            }
        } else {
            echo '<script>alert("权限不足");</script>';
            echo '<script>window.location.href="?c=back_coding_rule"</script>';
        }
    }

    public function insert()
    {
        global $table;
        if (isset($_POST['id']) && isset($_POST['content'])) {
            if (!empty($_POST['content'])) {
                $id = $_POST['id'];
                $content = $_POST['content'];
                $this->back_log_model->add_log($_SESSION['user_name'], '后端编码规范', '添加--' . $content, date('Y-m-d H:i:s'));
                $this->back_coding_rule_model->insert($table, $id, $content);
                echo '<script>alert("添加成功！");</script>';
                redirect('?c=back_coding_rule');
            } else {
                echo '<script>alert("添加规范不能为空");</script>';
                echo '<script>window.location.href="?c=back_coding_rule&m=index"</script>';
            }
        }
    }
}