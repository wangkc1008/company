$(document).ready(function () {

    // 添加系统
    $('#add_sys').click(function () {
        // 获取提交的系统
        var system = $('#add_sys_input').val();
        $.ajax({
            url: "?c=tools&m=add_system",
            type: "POST",
            async: false,
            data: "system="+system,
            success: function (data) {
                if (data == 0) { alert("请输入系统名称！"); }
                else if (data == 2) { alert("系统【"+system+"】已经存在！"); }
                else if (data == 1) { alert("添加成功！"); window.location.reload(); }
                else if (data == -1) { alert("权限不足！"); }
            },
        });
    });

    // 删除系统
    $('#del_sys').click(function () {
        // 获取被选中的系统
        var system = $('#del_sys_select option:selected').text();
        $.ajax({
            url: "?c=tools&m=delete_system",
            type: "POST",
            async: false,
            data: "action=query&&system="+system,
            success: function (data) {
                // 空系统
                if (data==1) { alert("删除成功！"); window.location.reload(); }
                else if (data == -1) { alert("权限不足！"); }
                // 系统含有测试模块
                else if (data==0){
                    var message = confirm("该系统存在测试模块，此操作将会删除该系统下的所有测试数据，确定删除吗？");
                    if (message) {
                        $.ajax({
                            url: "?c=tools&m=delete_system",
                            type: "POST",
                            async: false,
                            data: "action=delete&&system="+system,
                            success: function (data) {
                                alert("删除成功！");
                                window.location.reload();
                            },
                        });
                    }
                }
            },
        });
    });

    // 添加模块
    $('#add_mod').click(function () {
        var system = $(this).attr("data-system");
        var module_order = $('#mod_ord').val();
        var module = $('#add_mod_input').val();
        $.ajax({
            url: "?c=tools&m=add_module",
            type: "POST",
            async: false,
            data: "system="+system+"&&module_order="+module_order+"&&module="+module,
            success: function (data) {
                if (data == 0) { alert("请输入模块名称！"); }
                else if (data == 2) { alert("模块【"+module+"】已经存在！"); }
                else if (data == 1) { alert("添加成功！"); window.location.reload(); }
            }
        });
    });

    // 删除模块
    $('#del_mod').click(function () {
        var system = $(this).attr("data-system");
        var module = $('#del_mod_select option:selected').text();
        $.ajax({
            url: "?c=tools&m=delete_module",
            type: "POST",
            async: false,
            data: "action=query&&system="+system+"&&module="+module,
            success: function (data) {
                if (data==1) { alert("删除成功！"); window.location.reload();}
                else if (data == -1) { alert("权限不足！"); }
                else if (data==0) {
                    var message = confirm("该系统存在测试模块，此操作将会删除该系统下的所有测试数据，确定删除吗？");
                    if (message) {
                        $.ajax({
                            url: "?c=tools&m=delete_module",
                            type: "POST",
                            async: false,
                            data: "action=delete&&system="+system+"&&module="+module,
                            success: function (data) {
                                alert("删除成功！");
                                window.location.reload();
                            },
                        });
                    }
                }
            },
        });
    });

    // 添加条件
    $('#add_cond').click(function () {
        var system = $(this).attr("data-system");
        var module = $('#add_cond_select option:selected').text();
        var conditions = $('#add_cond_textarea').val();
        $.ajax({
            url: "?c=tools&m=add_detail",
            type: "POST",
            data: "system="+system+"&&module="+module+"&&conditions="+conditions,
            success: function (data) {
                if (data == 0) { alert("请输入测试条件！"); }
                else if (data == 1) { alert("添加成功"); window.location.reload(); }
                else { alert("条件【"+data+"】重复添加！"); window.location.reload();}
            },
        });
    });

    // 修改条件
    $("[data-id='upd_cond']").click(function () {
        var system = $(this).attr('data-system');
        var module= $(this).attr('data-module');
        var condition = $(this).attr('data-condition');
        var new_condition = prompt("请输入新条件", condition);
        if (new_condition && new_condition != condition) {
            $.ajax({
                url: "?c=tools&m=update_detail",
                type: "POST",
                data: "system=" + system + "&&module=" + module + "&&condition=" + condition+"&&new_condition="+new_condition,
                success: function (data) {
                    if (data==1) { alert("更改成功！"); window.location.reload(); }
                    else if (data==2) { alert("该条件已经存在！"); }
                    else if (data == -1) { alert("权限不足！"); }
                }
            });
        }
    });

    // 删除条件
    $("[data-id='del_cond']").click(function () {
        var system = $(this).attr('data-system');
        var module= $(this).attr('data-module');
        var condition = $(this).attr('data-condition');
        var cfm = confirm("确定删除【"+condition+"】吗？");
        if (cfm) {
            $.ajax({
                url: "?c=tools&m=delete_detail",
                type: "POST",
                data: "system=" + system + "&&module=" + module + "&&condition=" + condition,
                success: function (data) {
                    if (data == 1) { alert("删除成功！"); window.location.reload(); }
                    else if (data == -1) { alert("权限不足！"); }
                    else { alert("删除失败！"); }
                },
            });
        }
    });
});

