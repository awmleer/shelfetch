var appsearch = angular.module("search", []);
appsearch.controller("ctrlsearch", function ($scope, $http) {
    /*获取搜索的书名*/
    urldata = location.search;
    urldata = urldata.replace("?", "");
    urldata = urldata.replace("#", "");
    var urltemp = urldata.split("&");
    $scope.keyword = decodeURI(urltemp[0]);
    $scope.page = urltemp[1];


    $http({
        url: 'http://121.42.209.162:3031/api/zju/search',
        method: 'get',
        params: {
            keyword: $scope.keyword,
            page: $scope.page
        }
    }).success(function (data) {
        $scope.books = data.content;
        console.log($scope.books.length);
        if ($scope.books.length == 0) {
            $("#div-waiting").hide();
            $("#div-noresult").show();
            return false;
        }



        /*标头信息*/
        $scope.total = $scope.books.length;


        /*分页模块*/
        if ($scope.total < 5) {
            var i;
            for (i = $scope.total + 1; i <= 5; i++) {
                $("#page" + i).hide();
            }
        }

        if ($scope.page < 3) {
            j = 1;
        } else if ($scope.page > $scope.total - 2) {
            j = $scope.total - 4;
        } else {
            j = $scope.page - 2;
        }
        var iii;
        for (iii = 1; iii <= 5; iii++) {
            $("#page" + iii + " a").text(j);
            if (j != $scope.page)$("#page" + iii + " a").attr("href", "search.html?" + $scope.keyword + "&" + j);
            if (j == $scope.page)$("#page" + iii).addClass("active");
            j++;
        }


//                          解析ssh
//        if (obj[i].item1_ssh == null) {
//            tabletemp = tabletemp.replace("gcwzgcwz", "正在购进中");
//            tablehtml = tablehtml.replace("suoshuhaosuoshuhao", "无");
//            tabletemp = tabletemp.replace("suoshuhaosuoshuhao", "无");
//            tabletemp = tabletemp.replace("csjccsjc", "无");
//            tablehtml = tablehtml + tabletemp;
//        }


        $("#div-waiting").hide();
        $(".container").show();
    }).error(function () {
        alert("获取信息失败，请稍后再试");
    });


    $scope.locate= function () {
        var xx="zju";//TODO 临时的xx固定是zju
        var fg=this.i.fg;
        var ssh=this.book.ssh;

        if (ssh == "无") {
            alert("抱歉，没有索书号，无法查询");
            return false;
        }
        if (fg == "else") {
            alert("抱歉，暂时不支持该分馆的数据查询");
            return false;
        }

        $http({
            url: 'http://121.42.209.162:3031/api/'+xx+'/locate',
            method: 'get',
            params: {fg: fg, ssh: formatssh(ssh)}
        }).success(function (data) {
            var strs = data.split("&");
            var fjh = strs[0];
            var jh = strs[1];
            $("#div-main").show();
            $("#div-waiting").hide();
            location.href = "result-" + "zju" + "-" + fg + "-" + fjh + ".html?ssh==" + ssh + "&jh=" + jh;
        }).error(function () {
            alert("获取信息失败，请稍后再试");
        });
    }
});