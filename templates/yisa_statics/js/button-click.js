/**
 * 修改规则的js代码，因为需要提交到后端修改的id
 * 因此需要在弹框中的表单中，存放一个id的隐藏input提交到后台
 */
$(".edit-button").click(function () {
    let id = $(this).attr("data-id");
    $("#edit-id").val(id);
});

$(".del-button").click(function () {
    let id = $(this).attr("data-id");
    let res = confirm("确定要删除id为：" + id + " 的规则吗？");

    if (res === true) {
        $.ajax({
            type: "POST",
            url: "{{ currentUrl }}&m=delete",
            data: {
                "id": id
            },
            dataType: "json",
            success: function (data) {
                alert("删除成功！");
                location.href="{{ currentUrl }}";
            },
            error: function () {
                alert("连接服务器失败！");
            }
        })
    } else {
        alert("好吧 QAQ ~~");
    }
});
