/**
 * Created by Hao on 2016.3.16.
 * 用来格式化索书号
 */

function formatssh(ssh){
    //      索书号预格式化
    var x = ssh;
    var reg;
    reg = /[?？][A-Z]*\d*/;
    x = x.replace(reg, "");
    reg = /[;；][A-Z]*\d*/;
    x = x.replace(reg, "");
    reg = /[:：][A-Z]*\d*/;
    x = x.replace(reg, "");
    reg = /\([A-Z]*\d*\)/;
    x = x.replace(reg, "");
    reg = /[（[A-Z]*\d*）/;
    x = x.replace(reg, "");
    reg = /[<[A-Z]*\d*>/;
    x = x.replace(reg, "");
    reg = /[“[A-Z]*\d*”/;
    x = x.replace(reg, "");
    reg = /["[A-Z]*\d*"/;
    x = x.replace(reg, "");


//      索书号格式化
    var y = "";
    var temp2, deng, zimu;

//      前后切割
    x = x.split("/");

//      等号
    temp = x[0].match(/=[A-Z]*\d*/);
    if (temp == null) {
        deng = "000";
    } else {
        x[0] = x[0].replace(temp[0], "");
        temp[0] = temp[0].substr(1);
        temp2 = temp[0] + "000";
        deng = temp2.substr(0, 3);
    }


//      两位字母（首位）
    temp = x[0].match(/[A-Z]+/);
    if (temp == null) {
        y = y + "@@";
    } else {
        temp2 = temp[temp.length - 1] + "@";
        temp2 = temp2.substr(0, 2);
        y = y + temp2;
        x[0] = x[0].substr(temp[0].length);
    }


//      两位字母(末尾)
    temp = x[0].match(/[A-Z]+/);
    if (temp == null) {
        zimu = "@@";
    } else {
        temp2 = temp[temp.length - 1] + "@";
        temp2 = temp2.substr(0, 2);
        zimu = temp2;
        x[0] = x[0].replace(temp[temp.length - 1], "");
    }

    var dot = x[0].split(".");
    var len = dot.length;
    var i;
    for (i = 0; i < len; i++) {
        temp = dot[i].match(/\d+/);
        if (temp == null) {
            temp2 = "000";
        } else {
            temp2 = temp[0] + "000";
        }
        temp2 = temp2.substr(0, 3);
        y = y + temp2;
        if (temp != null)dot[i] = dot[i].substr(temp[0].length);
        if (dot[i].charAt(0) == "-") {
            dot[i] = dot[i].substr(1);
            temp = dot[i].match(/\d+/);
            temp2 = temp[0] + "000";
            temp2 = temp2.substr(0, 3);
            y = y + temp2;
            if (temp != null)dot[i] = dot[i].substr(temp[0].length);
        } else {
            y = y + "000";
        }
    }
    if (len == 1)y = y + "000000000000";
    if (len == 2)y = y + "000000";


//      补上等号和最后两个字母
    y = y + deng;
    y = y + zimu;


//      下面是后半部分
//      两位字母
    temp = x[1].match(/[A-Z]+/);
    if (temp == null) {
        y = y + "@@";
    } else {
        temp2 = temp[0] + "@";
        temp2 = temp2.substr(0, 2);
        y = y + temp2;
        if (temp != null)x[1] = x[1].substr(temp[0].length);
    }

//      三位数字
    temp = x[1].match(/\d+/);
    if (temp == null) {
        y = y + "000";
    } else {
        temp2 = temp[0] + "000";
        temp2 = temp2.substr(0, 3);
        y = y + temp2;
        if (temp != null)x[1] = x[1].substr(temp[0].length);
    }


//      剩余的数字
    if (x[1].charAt(0) == ".") {
        x[1] = x[1].substr(1);
        temp = x[1].match(/\d+/);
        if (temp == null) {
            temp2 = "000";
        } else {
            temp2 = temp[0] + "000";
        }
        temp2 = temp2.substr(0, 3);
        y = y + temp2;
        if (temp != null)x[1] = x[1].substr(temp[0].length);
        if (x[1].charAt(0) == "-") {
            x[1] = x[1].substr(1);
            temp = x[1].match(/\d+/);
            if (temp == null) {
                temp2 = "000";
            } else {
                temp2 = temp[0] + "000";
            }
            temp2 = temp2.substr(0, 3);
            y = y + temp2;
            if (temp != null)x[1] = x[1].substr(temp[0].length);
        }
    } else if (x[1].charAt(0) == "-") {
        y = y + "000";
        x[1] = x[1].substr(1);
        temp = x[1].match(/\d+/);
        if (temp == null) {
            temp2 = "000";
        } else {
            temp2 = temp[0] + "000";
        }
        temp2 = temp2.substr(0, 3);
        y = y + temp2;
        if (temp != null)x[1] = x[1].substr(temp[0].length);
    } else {
        y = y + "000000";
    }

    return y;
}