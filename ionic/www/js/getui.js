function callback(type, data) {
  if(type == 'cid') {
    //TODO data = clientid
  } else if(type == 'pid') {
    //TODO data = 进程pid
  } else if(type == 'payload') {
    //TODO data=透传数据
  } else if(type == 'online') {
    if(data == 'true') {
      //TODO 已上线
      $('#clientid').text(clientid);
    } else {
      //TODO 已离线
    }
  }
};

GeTuiSdkPlugin.callback_init(callback);
GeTuiSdkPlugin.initialize();
