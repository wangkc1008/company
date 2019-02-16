$(function(){
    $(".delete").click(function () {
        if (confirm("确认删除你选中的规范？")){
            var tr = $(this).parent().parent();
            var currentUrl = $(this).parent().nextAll().last().text()+"&m=delete";
            $.ajax({
                type:"post",
                url:currentUrl,
                data:{
                    id:$(this).parent().prevAll().last().text()
                },
                datatype:"json",
                success:function (data){
                    var data = eval('('+data+')');
                    if(data.success){
                        alert("删除成功");
                        tr.remove();
                        location.reload(true);
                    }else if(data.success=='0'){
                        alert("权限不足");
                    }else{
                        alert("删除失败");
                    }
                },
                error:function (data) {
                    alert("请求错误，请检查网络");
                }
            });
        }else {
            alert("请选择规范");
        }
        return false;
    });
});
