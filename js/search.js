var appsearch = angular.module("search", []);
appsearch.controller("ctrlsearch", function ($scope, $http) {
    //            获取搜索的书名
    urldata = location.search;
    urldata = urldata.replace("?", "");
    urldata = urldata.replace("#", "");
    var urltemp = urldata.split("&");
    keyword = decodeURI(urltemp[0]);
    page = urltemp[1];


    $http({
        url: 'http://121.42.209.162:3031/api/zju/search',
        method: 'get',
        params: {
            keyword: keyword,
            page: page
        }
    }).success(function (data) {
        $scope.books=data;
        var obj = eval(data);
        if (obj.length == 0) {
            $("#div-waiting").hide();
            $("#div-noresult").show();
            return false;
        }

        var i;
        var tablehtml;

        //var tablehtml1 = "<div class='panel panel-info'>" +
        //    "<div class='panel-heading'>" +
        //    "<h3 class='panel-title'>shumingshuming</h3>" +
        //    "</div>" +
        //    "<div class='panel-body'>" +
        //    "<p>索书号：suoshuhaosuoshuhao<br>作者：zuozhezuozhe<br>年份：nianfennianfen<br>出版社：chubanshechubanshe</p>" +
        //    "<table width='100%' class='table table-condensed'> " +
        //    "<colgroup><col width='46%'><col width='27%'><col width='27%'></colgroup> " +
        //    "<thead>" +
        //    "<tr><th>馆藏位置</th><th>册数/借出</th><th>查看架位</th></tr>" +
        //    "</thead>" +
        //    "<tbody>";
        //var tablehtml2 = "<tr><td class='c'>gcwzgcwz</td><td>csjccsjc</td><td><button onclick=\"btnclick('fgfg','suoshuhaosuoshuhao')\" class='btn btn-primary'>查看</button></td></tr>";
        //var tablehtml3 = "</tbody></table></div></div>";


        //          初始化标头信息
        $("#keyword").text("搜索词：" + keyword);

        var total = obj.length;
        $("#page").text("第" + page + "页/共" + total + "页");

//                      初始化分页模块
        if (total < 5) {
            var iii;
            for (iii = total + 1; iii <= 5; iii++) {
                $("#page" + iii).hide();
            }
        }


        if (page < 3) {
            j = 1;
        } else if (page > total - 2) {
            j = total - 4;
        } else {
            j = page - 2;
        }
        var iii;
        for (iii = 1; iii <= 5; iii++) {
            $("#page" + iii + " a").text(j);
            if (j != page)$("#page" + iii + " a").attr("href", "search.html?" + keyword + "&" + j);
            if (j == page)$("#page" + iii).addClass("active");
            j++;
        }

        for (i = 2; i < obj.length; i++) {
            tablehtml = tablehtml1.replace("shumingshuming", obj[i].chnname);
            tablehtml = tablehtml.replace("zuozhezuozhe", obj[i].author);
            tablehtml = tablehtml.replace("nianfennianfen", obj[i].year);
            tablehtml = tablehtml.replace("chubanshechubanshe", obj[i].press);

//                          解析ssh

            if (obj[i].item1_ssh == null) {
                tabletemp = tabletemp.replace("gcwzgcwz", "正在购进中");
                tablehtml = tablehtml.replace("suoshuhaosuoshuhao", "无");
                tabletemp = tabletemp.replace("suoshuhaosuoshuhao", "无");
                tabletemp = tabletemp.replace("csjccsjc", "无");
                tablehtml = tablehtml + tabletemp;
                break;
            }

            var temp, reg;

            temp = obj[i].item1_ssh.match(/ */);
            obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");

            for (var ii = 0; ii < 3; ii++) {
                var tabletemp = tablehtml2;

                temp = obj[i].item1_ssh.match(/.+?[A-Z]/);
                reg = /[A-Z]/;
                temp[0] = temp[0].replace(reg, "");
                tabletemp = tabletemp.replace("gcwzgcwz", temp[0]);
                if (temp[0] == "紫金港基础流通书库") {
                    tabletemp = tabletemp.replace("fgfg", "zjgjc");
                } else {
                    tabletemp = tabletemp.replace("fgfg", "else");
                }

                obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");
                temp = obj[i].item1_ssh.match(/.+? /);
                if (temp) {
                    temp[0] = temp[0].replaceA(" ", "");
                    tablehtml = tablehtml.replace("suoshuhaosuoshuhao", temp[0]);
                    tabletemp = tabletemp.replace("suoshuhaosuoshuhao", temp[0]);
                    obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");
                }

                temp = obj[i].item1_ssh.match(/ +\d\/ +\d/);
                if (temp == null)break;
                obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");
                temp[0] = temp[0].replaceA(" ", "");
                tabletemp = tabletemp.replace("csjccsjc", temp[0]);

                tablehtml = tablehtml + tabletemp;
            }


            tablehtml = tablehtml + tablehtml3;
            //$("#bottom").before(tablehtml);
        }
        $("#div-waiting").hide();
        $(".container").show();
    }).error(function () {
        alert("获取信息失败，请稍后再试");
    });
    $.ajax({
        url: "http://121.42.209.162:3031/api/zju/search",
        type: "get",
        data: {
            keyword: keyword,
            page: page
        }
    }).done(function (data) {
        var obj = eval(data);
        if (obj.length == "0") {
            $("#div-waiting").hide();
            $("#div-noresult").show();
            return false;
        }

        var i;
        var tablehtml;

        var tablehtml1 = "<div class='panel panel-info'>" +
            "<div class='panel-heading'>" +
            "<h3 class='panel-title'>shumingshuming</h3>" +
            "</div>" +
            "<div class='panel-body'>" +
            "<p>索书号：suoshuhaosuoshuhao<br>作者：zuozhezuozhe<br>年份：nianfennianfen<br>出版社：chubanshechubanshe</p>" +
            "<table width='100%' class='table table-condensed'> " +
            "<colgroup><col width='46%'><col width='27%'><col width='27%'></colgroup> " +
            "<thead>" +
            "<tr><th>馆藏位置</th><th>册数/借出</th><th>查看架位</th></tr>" +
            "</thead>" +
            "<tbody>";
        var tablehtml2 = "<tr><td class='c'>gcwzgcwz</td><td>csjccsjc</td><td><button onclick=\"btnclick('fgfg','suoshuhaosuoshuhao')\" class='btn btn-primary'>查看</button></td></tr>";
        var tablehtml3 = "</tbody></table></div></div>";

        //          初始化标头信息
        $("#keyword").text("搜索词：" + keyword);

        var total = obj.length;
        $("#page").text("第" + page + "页/共" + total + "页");

//                      初始化分页模块
        if (total < 5) {
            var iii;
            for (iii = total + 1; iii <= 5; iii++) {
                $("#page" + iii).hide();
            }
        }


        if (page < 3) {
            j = 1;
        } else if (page > total - 2) {
            j = total - 4;
        } else {
            j = page - 2;
        }
        var iii;
        for (iii = 1; iii <= 5; iii++) {
            $("#page" + iii + " a").text(j);
            if (j != page)$("#page" + iii + " a").attr("href", "search.html?" + keyword + "&" + j);
            if (j == page)$("#page" + iii).addClass("active");
            j++;
        }

        for (i = 2; i < obj.length; i++) {
            tablehtml = tablehtml1.replace("shumingshuming", obj[i].chnname);
            tablehtml = tablehtml.replace("zuozhezuozhe", obj[i].author);
            tablehtml = tablehtml.replace("nianfennianfen", obj[i].year);
            tablehtml = tablehtml.replace("chubanshechubanshe", obj[i].press);

//                          解析ssh

            if (obj[i].item1_ssh == null) {
                tabletemp = tabletemp.replace("gcwzgcwz", "正在购进中");
                tablehtml = tablehtml.replace("suoshuhaosuoshuhao", "无");
                tabletemp = tabletemp.replace("suoshuhaosuoshuhao", "无");
                tabletemp = tabletemp.replace("csjccsjc", "无");
                tablehtml = tablehtml + tabletemp;
                break;
            }

            var temp, reg;

            temp = obj[i].item1_ssh.match(/ */);
            obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");

            for (var ii = 0; ii < 3; ii++) {
                var tabletemp = tablehtml2;

                temp = obj[i].item1_ssh.match(/.+?[A-Z]/);
                reg = /[A-Z]/;
                temp[0] = temp[0].replace(reg, "");
                tabletemp = tabletemp.replace("gcwzgcwz", temp[0]);
                if (temp[0] == "紫金港基础流通书库") {
                    tabletemp = tabletemp.replace("fgfg", "zjgjc");
                } else {
                    tabletemp = tabletemp.replace("fgfg", "else");
                }

                obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");
                temp = obj[i].item1_ssh.match(/.+? /);
                if (temp) {
                    temp[0] = temp[0].replaceA(" ", "");
                    tablehtml = tablehtml.replace("suoshuhaosuoshuhao", temp[0]);
                    tabletemp = tabletemp.replace("suoshuhaosuoshuhao", temp[0]);
                    obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");
                }

                temp = obj[i].item1_ssh.match(/ +\d\/ +\d/);
                if (temp == null)break;
                obj[i].item1_ssh = obj[i].item1_ssh.replace(temp[0], "");
                temp[0] = temp[0].replaceA(" ", "");
                tabletemp = tabletemp.replace("csjccsjc", temp[0]);

                tablehtml = tablehtml + tabletemp;
            }


            tablehtml = tablehtml + tablehtml3;
            $("#bottom").before(tablehtml);
        }
        $("#div-waiting").hide();
        $(".container").show();
    }).fail(function () {
        alert("获取信息失败，请稍后再试");
    });
});