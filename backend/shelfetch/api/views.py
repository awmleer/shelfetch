from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate #用户登录认证
from django.contrib.auth.decorators import login_required,permission_required
import json
import logging
from django.shortcuts import redirect
import urllib

# Get an instance of a logger
logger = logging.getLogger('django')
# Create your views here.




def test(request):
    res={
        "test":'ok'
    }
    return HttpResponse(json.dumps(res), content_type="application/json")






def search(request):
    # 接受输入
    # todo 输入不要用cgiparser了，django会自动解析的。参考这个：https://docs.djangoproject.com/en/1.10/ref/request-response/#django.http.HttpRequest.GET
    try:
        recv = cgiparser(env['QUERY_STRING'])
        kword = recv['keyword']
        page = int(recv['page'])
    #     todo 要是想把错误信息输出到日志里的话，请使用logger.info() 或 logger.error()，参考本页12-13行以及https://docs.djangoproject.com/en/1.10/topics/logging/
    # except KeyError:
    #     print
    #     '发现下面一个请求是可疑请求，如果存在，其POST的数据为：\n' + repr(env['wsgi.input'].read())
    #     start_response('400 Bad Request', [('Content-Type', 'text/plain;charset=utf-8')])
    #     return 'Parament Error.'
    # except ValueError:
    #     print
    #     'page不是数……'
    #     start_response('400 Bad Request', [('Content-Type', 'text/plain;charset=utf-8')])
    #     return 'Page must be an int.'


    # todo 当时为啥要用cookie来着？？？
    # 解析cookie
    cookie = cookieparser(env.get('COOKIE'))

    # 判断是否为新查询并根据页数计算起始指针
    NEWQUERY = True if cookie.get('keyword') != kword else False
    start_point = 10 * (page - 1) + 1

    # 向网关发起查询
    try:
        # 获取查询集合编号
        if cookie.get('set_number') == None or cookie.get('set_number') == '' or NEWQUERY == True:
            # todo urllib似乎不能 用？
            response = urllib.urlopen(
                'http://webpac.zju.edu.cn/X?op=find&code=wrd&request=%s&base=ZJU01' % kword).read()
            rptree = Etree.fromstring(response)
            if rptree.find('error') != None:
                start_response('502 Bad Gateway', [('Content-Type', 'text/plain;charset=utf-8')])
                return rptree.find('error').text
            set_number = rptree.find('set_number').text
            no_records = rptree.find('no_records').text
        else:
            set_number = cookie['set_number']
            no_records = cookie['no_records']
        queryset = urllib.urlopen(
            'http://webpac.zju.edu.cn/X?op=ill-get-set&set_number=%s&start_point=%4d&no_documents=0010' % (
                set_number, start_point)).read()

        # 解析并遍历整理查询集合
        content = []
        settree = Etree.fromstring(queryset)
        for doc_number in settree.iter(tag='doc-number'):
            docxml = urllib.urlopen(
                'http://webpac.zju.edu.cn/X?op=find-doc&doc_num=%s&base=ZJU01' % doc_number.text).read()
            print
            '查询出版信息得到的结果：\n' + docxml
            doctree = Etree.fromstring(docxml)
            docdic = {}
            for varfield in doctree.iter(tag='varfield'):
                for subfield in varfield.iter(tag='subfield'):
                    if varfield.attrib['id'] == '200' and subfield.attrib['label'] == 'a':
                        docdic['name'] = subfield.text
                    # elif varfield.attrib['id'] == '200' and subfield.attrib['label'] == 'd':
                    # docdic['engname'] = subfield.text
                    elif varfield.attrib['id'] == '200' and subfield.attrib['label'] == 'f':
                        docdic['author'] = subfield.text
                    # elif varfield.attrib['id'] == '210' and subfield.attrib['label'] == 'a':
                    # docdic['pressloc'] = subfield.text
                    elif varfield.attrib['id'] == '210' and subfield.attrib['label'] == 'c':
                        docdic['press'] = subfield.text
                    elif varfield.attrib['id'] == '210' and subfield.attrib['label'] == 'd':
                        docdic['year'] = subfield.text
                    # elif varfield.attrib['id'] == '215' and subfield.attrib['label'] == 'a':
                    # docdic['pages'] = subfield.text
                    # elif varfield.attrib['id'] == '225' and subfield.attrib['label'] == 'a':
                    # docdic['series'] = subfield.text
                    # elif varfield.attrib['id'] == '330' and subfield.attrib['label'] == 'a':
                    # docdic['description'] = subfield.text
                    else:
                        pass
            # itemidx = 0
            itemsxml = urllib.urlopen(
                'http://webpac.zju.edu.cn/X?op=item-data&doc_number=%s&base=ZJU01' % doc_number.text).read()
            print
            '查询副本得到的结果：\n' + itemsxml
            itemstree = Etree.fromstring(itemsxml)
            itemdic = {}
            docdic['item'] = []
            for item in itemstree.iter(tag='item'):
                # itemdic['item%d_sub-library' %itemidx] = item.find('sub-library').text
                # itemdic['item%d_status' %itemidx] = item.find('item-status').text
                # itemdic['item%d_ssh' %itemidx] = item.find('call-no-1').text
                if itemdic.get('fg') == item.find('sub-library').text:
                    itemdic['total'] += 1
                    if item.find('requested').text == 'Y' or item.find('expected').text == 'Y' or item.find(
                            'on-hold').text == 'Y': itemdic['borrowed'] += 1
                else:
                    if not (itemdic in docdic['item']): docdic['item'].append(itemdic)
                    itemdic['fg'] = item.find('sub-library').text
                    docdic['ssh'] = item.find('call-no-1').text
                    itemdic['total'] = 1
                    itemdic['borrowed'] = 1 if item.find('requested').text == 'Y' or item.find(
                        'expected').text == 'Y' or item.find('on-hold').text == 'Y' else 0
                    # itemidx = 0
                    # docdic['item'].append(itemdic)
                    # itemidx += 1
            content.append(docdic)
            # except Exception, e:
            #     print
            #     '有异常发生：' + repr(e)
            #   todo 出现错误django会自动给500的，不用写这些东西
            #     start_response('500 Internal Server Error',
            #                    [('Content-Type', 'text/plain;charset=utf-8'), ('Access-Control-Allow-Origin', '*')])
            #     return repr(e)

            # 以JSON返回查询结果并设置cookie
            # start_response('200 OK', [('Content-Type', 'text/json;charset=utf-8'), ('Access-Control-Allow-Origin', '*'),
            #                           ('Set-Cookie', 'keyword=%s' % kword), ('Set-Cookie', 'set_number=%s' % set_number),
            #                           ('Set-Cookie', 'no_records=%s' % no_records)])
            # return json.dumps({'pages': no_records / 10 + 1, 'content': content})
    #         todo 做http响应的话直接用下面这个语句，把值赋给res这个字典就好了
    return HttpResponse(json.dumps(res), content_type="application/json")