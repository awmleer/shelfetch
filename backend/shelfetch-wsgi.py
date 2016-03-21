#!/usr/bin/python
# coding:utf-8
import os
import json
import urllib
import MySQLdb
import datetime
import xml.etree.ElementTree as Etree
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImageu
import smtplib
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

#DEBUG声明
ONDEBUG = True

#—————————————————————CGI Query 解析器
def cgiparser(query):
	query = urllib.unquote(query)
	result = {}
	keyset = query.split('&')
	for keystr in keyset:
		key = keystr.split('=')
		try:
			result[key[0]] = key[1]
		except IndexError:
			pass
	return result

#————————————————————————cookie解析器
def cookieparser(cookie):
	if cookie == None:return {}
	lst = cookie.split('; ')
	result = {}
	for keystr in lst:
		key = keystr.split('=')
		try:
			result[key[0]] = key[1]
		except IndexError:
			pass
	return result


#——————————————————————————————————————程序入口——————————————————————————————————————#
def application(env, start_response):
	
	#创建数据库长连接
	try:
		conn = MySQLdb.connect(host='localhost',user='shelfetch',passwd='shelfetch_fuck@cracker',db='shelfetch',port=3306)
		cur = conn.cursor()
	except MySQLdb.Error,e:
		print '在数据库连接过程中出现错误：' + "Mysql Error %d: %s" % (e.args[0], e.args[1])
	
	#书籍位置查询
	if env['PATH_INFO'] == '/api/zju/locate':
		#计查询次数
		try:
			cur.execute('update _counters set search = search + 1 where dt = 0000-00-00')
			cur.execute('update _counters set search = search + 1 where dt = curdate()')
		except MySQLdb.Error,e:
			print '在使用查询次数计数器过程中出现错误：' + "Mysql Error %d: %s" % (e.args[0], e.args[1])
		
		#解析输入
		try:
			recv = cgiparser(env['QUERY_STRING'])
			xx = 'zju'
			fg = recv['fg']
			ssh = recv['ssh']
		except KeyError:
			print '发现下面一个请求是可疑请求，如果存在，其POST的数据为：\n' + repr(env['wsgi.input'].read())
			start_response('400 Bad Request', [('Content-Type','text/plain;charset=utf-8')])
			return 'Parament Error.'
		
		#进行书位查询
		try:
			cur.execute('select startid from %s_%s;' %(xx,fg))
			startids=cur.fetchall()
			for yzstartid in startids:
				startid = yzstartid[0]
				i = 0
				while (ssh[i] == startid[i]):
					i += 1
				if (ssh[i] < startid[i]):
					cur.execute('select shelfid from %s_%s where startid = \'%s\';' %(xx,fg,startid))
					yzshelfid = cur.fetchall()
					shelfid = yzshelfid[0][0] - 1
					break
			cur.execute('select roomid from %s_%s where shelfid = %d;' %(xx,fg,shelfid))
			yzroomid = cur.fetchall()
			roomid = yzroomid[0][0]
			cur.execute('select fsid from %s_%s where shelfid = %d;' %(xx,fg,shelfid))
			yzfsid = cur.fetchall()
			fsid = yzfsid[0][0]
		except MySQLdb.Error,e:
			print '在查询书位过程中出现错误：' + "Mysql Error %d: %s" % (e.args[0], e.args[1])
		
		#返回结果
		start_response('200 OK', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
		return '%d&%d' % (roomid,fsid)
	
	#与浙江大学图书馆后端服务器进行通信并在其数据库中查找相应的图书和索书号
	if env['PATH_INFO'] == '/api/zju/search':
		
		#接受输入
		try:
			recv = cgiparser(env['QUERY_STRING'])
			kword = recv['keyword']
			page = int(recv['page'])
		except KeyError:
			print '发现下面一个请求是可疑请求，如果存在，其POST的数据为：\n' + repr(env['wsgi.input'].read())
			start_response('400 Bad Request', [('Content-Type','text/plain;charset=utf-8')])
			return 'Parament Error.'
		except ValueError:
			print 'page不是数……'
			start_response('400 Bad Request', [('Content-Type','text/plain;charset=utf-8')])
			return 'Page must be an int.'
		
		#解析cookie
		cookie = cookieparser(env.get('COOKIE'))
		
		#判断是否为新查询并根据页数计算起始指针
		NEWQUERY = True if cookie.get('keyword') != kword else False
		start_point = 10 * (page - 1) + 1
		
		#向网关发起查询
		try:
			#获取查询集合编号
			if cookie.get('set_number') == None or cookie.get('set_number') == '' or NEWQUERY == True:
				response = urllib.urlopen('http://webpac.zju.edu.cn/X?op=find&code=wrd&request=%s&base=ZJU01' %kword).read()
				rptree = Etree.fromstring(response)
				if rptree.find('error') != None:
					start_response('502 Bad Gateway', [('Content-Type','text/plain;charset=utf-8')])
					return rptree.find('error').text
				set_number = rptree.find('set_number').text
				no_records = rptree.find('no_records').text
			else:
				set_number = cookie['set_number']
				no_records = cookie['no_records']
			queryset = urllib.urlopen('http://webpac.zju.edu.cn/X?op=ill-get-set&set_number=%s&start_point=%4d&no_documents=0010' %(set_number,start_point)).read()
			
			#解析并遍历整理查询集合
			content = []
			settree = Etree.fromstring(queryset)
			for doc_number in settree.iter(tag = 'doc-number'):
				docxml = urllib.urlopen('http://webpac.zju.edu.cn/X?op=find-doc&doc_num=%s&base=ZJU01' %doc_number.text).read()
				print '查询出版信息得到的结果：\n' + docxml
				doctree = Etree.fromstring(docxml)
				docdic = {}
				for varfield in doctree.iter(tag = 'varfield'):
					for subfield in varfield.iter(tag = 'subfield'):
						if varfield.attrib['id'] == '200' and subfield.attrib['label'] == 'a':
							docdic['name'] = subfield.text
						#elif varfield.attrib['id'] == '200' and subfield.attrib['label'] == 'd':
							#docdic['engname'] = subfield.text
						elif varfield.attrib['id'] == '200' and subfield.attrib['label'] == 'f':
							docdic['author'] = subfield.text
						#elif varfield.attrib['id'] == '210' and subfield.attrib['label'] == 'a':
							#docdic['pressloc'] = subfield.text
						elif varfield.attrib['id'] == '210' and subfield.attrib['label'] == 'c':
							docdic['press'] = subfield.text
						elif varfield.attrib['id'] == '210' and subfield.attrib['label'] == 'd':
							docdic['year'] = subfield.text
						#elif varfield.attrib['id'] == '215' and subfield.attrib['label'] == 'a':
							#docdic['pages'] = subfield.text
						#elif varfield.attrib['id'] == '225' and subfield.attrib['label'] == 'a':
							#docdic['series'] = subfield.text
						#elif varfield.attrib['id'] == '330' and subfield.attrib['label'] == 'a':
							#docdic['description'] = subfield.text
						else:
							pass
				#itemidx = 0
				itemsxml = urllib.urlopen('http://webpac.zju.edu.cn/X?op=item-data&doc_number=%s&base=ZJU01' %doc_number.text).read()
				print '查询副本得到的结果：\n' + itemsxml
				itemstree = Etree.fromstring(itemsxml)
				itemdic = {}
				docdic['item'] = []
				for item in itemstree.iter(tag = 'item'):
					#itemdic['item%d_sub-library' %itemidx] = item.find('sub-library').text
					#itemdic['item%d_status' %itemidx] = item.find('item-status').text
					#itemdic['item%d_ssh' %itemidx] = item.find('call-no-1').text
					if itemdic.get('fg') == item.find('sub-library').text:
						itemdic['total'] += 1
						if item.find('requested').text == 'Y' or item.find('expected').text == 'Y' or item.find('on-hold').text == 'Y':itemdic['borrowed'] += 1
					else:
						if not (itemdic in docdic['item']):docdic['item'].append(itemdic)
						itemdic['fg'] = item.find('sub-library').text
						docdic['ssh'] = item.find('call-no-1').text
						itemdic['total'] = 1
						itemdic['borrowed'] = 1 if item.find('requested').text == 'Y' or item.find('expected').text == 'Y' or item.find('on-hold').text == 'Y' else 0
					#itemidx = 0
					#docdic['item'].append(itemdic)
					#itemidx += 1
				content.append(docdic)
		except Exception,e:
			print '有异常发生：' + repr(e)
			start_response('500 Internal Server Error', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
			return repr(e)
		
		#以JSON返回查询结果并设置cookie
		start_response('200 OK', [('Content-Type','text/json;charset=utf-8'),('Access-Control-Allow-Origin','*'),('Set-Cookie','keyword=%s' %kword),('Set-Cookie','set_number=%s' %set_number),('Set-Cookie','no_records=%s' %no_records)])
		return json.dumps({'pages':no_records / 10 + 1,'content':content})
	
	#报错
	if env['PATH_INFO'] == '/api/zju/error':
		recv = json.loads(env['wsgi.input'].read())
		print '[POST LOG]POST得到的信息如下：\n'+repr(recv)
		try:
			url = recv['url']
			ssh = recv['ssh']
			shelfid = recv['jh']
			cur.execute('insert into _error (url,ssh,shelfid,submittime) values (\'%s\',\'%s\',%s,now())' %(url,ssh,shelfid))
			conn.commit()
		except Exception:
			print '遇到可疑请求'
			start_response('400 Bad Request', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
			return ''
		start_response('200 OK', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
		return 'ok'
	
	#反馈
	if env['PATH_INFO'] == '/api/feedback':
		recv = json.loads(env['wsgi.input'].read())
		print '[POST LOG]POST得到的信息如下：\n'+repr(recv)
		try:
			score = recv.get('score')
			content = recv.get('content')
			tel = recv.get('tel')
			name = recv.get('name')
			school = recv.get('school')
			cur.execute('insert into _feedbacks (score,content,tel,name,school,submittime) values (%s,\'%s\',%s,\'%s\',\'%s\',now());' %(score,content,tel,name,school))
			conn.commit()
			row = cur.lastrowid
		except Exception:
			print '遇到可疑请求'
			start_response('400 Bad Request', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
			return ''
		start_response('200 OK', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
		return str(row)
	
	#发邮件
	if env['PATH_INFO'] == '/api/sendmail':
		recv = json.loads(env['wsgi.input'].read())
		print '[POST LOG]POST得到的信息如下：\n'+repr(recv)
		address = recv.get('recv')
		url = recv.get('url')
		ssh = recv.get('ssh')
		jh = recv.get('jh')
		resulturl = url + '?ssh=' + ssh + '&jh=' + jh
		html = """\
		<!DOCTYPE html>
		<html>
		<head lang="en">
		    <title>shelfetch</title>
		
		    <style>
		        body{
		            font-family: "Microsoft YaHei",微软雅黑,"MicrosoftJhengHei",华文细黑,STHeiti,MingLiu;
		        }
		        .btn-primary{
		            -webkit-appearance: none;
		            -webkit-user-select: none;
		            align-items: flex-start;
		            background-color: rgb(51, 122, 183);
		            background-image: none;
		            border-bottom-color: rgb(46, 109, 164);
		            border-bottom-left-radius: 4px;
		            border-bottom-right-radius: 4px;
		            border-bottom-style: solid;
		            border-bottom-width: 1px;
		            border-image-outset: 0px;
		            border-image-repeat: stretch;
		            border-image-slice: 100%;
		            border-image-source: none;
		            border-image-width: 1;
		            border-left-color: rgb(46, 109, 164);
		            border-left-style: solid;
		            border-left-width: 1px;
		            border-right-color: rgb(46, 109, 164);
		            border-right-style: solid;
		            border-right-width: 1px;
		            border-top-color: rgb(46, 109, 164);
		            border-top-left-radius: 4px;
		            border-top-right-radius: 4px;
		            border-top-style: solid;
		            border-top-width: 1px;
		            box-sizing: border-box;
		            color: rgb(255, 255, 255);
		            cursor: pointer;
		            display: block;
		            font-size: 20px;
		            height: 50px;
		            letter-spacing: normal;
		            line-height: 20px;
		            margin-bottom: 0px;
		            margin-left: 38.7031px;
		            margin-right: 38.7031px;
		            margin-top: 0px;
		            overflow-x: visible;
		            overflow-y: visible;
		            padding-bottom: 6px;
		            padding-left: 12px;
		            padding-right: 12px;
		            padding-top: 6px;
		            text-align: center;
		            text-indent: 0px;
		            text-rendering: auto;
		            text-shadow: none;
		            text-transform: none;
		            touch-action: manipulation;
		            vertical-align: middle;
		            white-space: nowrap;
		            width: 180.594px;
		            word-spacing: 0px;
		            writing-mode: lr-tb;
		            -webkit-writing-mode: horizontal-tb;
		        }
		    </style>
		</head>
		<body>
		<div style="background-color: #eeeeee;padding: 20px;">
		    <h1 style="text-align: center;font-size: 50px">Shelfetch</h1>
		    <div style="background-color: #FFFFFF;padding: 30px;border: solid 1px #DDDDDD;">
		        <div>
		            <img src="http://121.42.209.162/shelfetch/pic/mail/book.png" height="100px" style="float: left;height: 100px;display: block;">
		            <p style="display: block;font-size: 20px;padding-top: 16px">我们已经帮您确定好了这本书的位置：<br>
		                <span style="font-size: 35px">索书号 sshsshssh</span><br><br>
		            </p>
		        </div>
		        <hr color="#dddddd" style="color: #DDDDDD;">
		        <a href="http://121.42.209.162/shelfetch/urlurlurl"><button class="btn-primary" style="width: 40%;margin: auto;">查看图书的位置</button></a>
		    </div>
		    <p style="font-size: 10px;color: #aaaaaa;text-align: center">如果您在使用中有任何的疑问或者建议，欢迎反馈意见至我们的邮件：support@sparker.cc</p>
		</div>
		
		
		</body>
		</html>
		"""
		html = html.replace('sshsshssh',ssh)
		html = html.replace('urlurlurl',resulturl)
		sender = 'shelfetch@sparker.xyz'
		receiver = address
		subject = '您在Shelfetch上的查询结果'
		smtpserver = 'smtp.sparker.xyz'
		username = 'shelfetch@sparker.xyz'
		password = '86.corrode'
		# Create message container - the correct MIME type is multipart/alternative.
		msg = MIMEMultipart('alternative')
		msg['From'] = sender
		msg['To'] = receiver
		msg['Subject'] = subject
		# Create the body of the message (a plain-text and an HTML version).
		#text = 'Text'
		# Record the MIME types of both parts - text/plain and text/html.
		#part1 = MIMEText(text,'plain')
		part2 = MIMEText(html, 'html','utf-8')
		#把各部分内容放到消息容器里
		# According to RFC 2046, the last part of a multipart message, in this case
		# the HTML message, is best and preferred.
		#msg.attach(part1)
		msg.attach(part2)
		#发邮件
		try:
			smtp = smtplib.SMTP()
			smtp.connect('smtp.sparker.xyz')
			smtp.login(username, password)
			smtp.sendmail(sender, receiver, msg.as_string())
			smtp.quit()
			start_response('200 OK', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
			return 'true'
		except Exception,e:
			start_response('200 OK', [('Content-Type','text/plain;charset=utf-8'),('Access-Control-Allow-Origin','*')])
			return 'false'
	
	#关闭数据库连接
	try:
		cur.close()
		conn.close()
	except MySQLdb.Error,e:
		print "在关闭数据库连接的过程中发生错误：Mysql Error %d: %s" % (e.args[0], e.args[1])