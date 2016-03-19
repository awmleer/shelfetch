var ssh,jh;
$(document).ready(function(){
    //读取URL参数
    var url = location.search; //获取url中"?"符后的字串
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        ssh=strs[0].split("==")[1];//因为索书号中可能含有等号，所以等号是两个
        $("#lab-ssh").html("索书号：" + ssh);//设置索书号的label
        jh=strs[1].split("=")[1];
        $("#lab-jh").html("第" + jh + "架");//设置架号的label
        $(".shelf"+jh).css("background-color","#bce8f1");
        $(".shelf"+jh).attr("id","anchor");
    }

    //          调整页面布局
    if($(window).height()<$(window).width()){
        $(".container").css("width","500px");
        $(".container").css("margin","0 auto");
    }
});


/*错误报告*/
function submiterror(){
    var url = location.href;
    var obj={url:url,ssh:ssh,jh:jh};
    $.ajax({
        url: "http://121.42.209.162:3031/api/zju/error",
        type: "post",
        data: JSON.stringify(obj)
    }).done(function (data) {
        if (data == "ok") {
            alert("提交成功，谢谢您的反馈！");
        }
    }).fail(function () {
        alert("获取信息失败，请稍后再试");
    });
}


/*发送邮件*/
function email(){
    var url = location.href;
    url=url.match(/result.*\.html/);
    var recv=$("#recv").val();
    var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    //检查用户输入的邮箱格式是否正确
    if(filter.test(recv)){
        var obj = {recv: recv, url: url[0], ssh: ssh, jh: jh};
        $.ajax({
            url: "http://121.42.209.162:3031/api/sendmail",
            type: "post",
            data: JSON.stringify(obj)
        }).done(function (data) {
            if (data == "true") {
                alert("邮件已成功发送");
            }else{
                alert("发送失败");
            }
        }).fail(function () {
            alert("获取信息失败，请稍后再试");
        });
    }else{
        alert('您的电子邮件格式不正确');
        return false;
    }
}