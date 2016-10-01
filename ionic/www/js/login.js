angular.module('login',['ionic'])
  .controller('LoginCtrl', function ($scope,$http,$rootScope) {
    $scope.login_name="xero";
    $scope.password="112358";
    var uuid='kojqoejfozp';

    $scope.login=function () {
      $http.post(BASE_URL+'user/login',{
        login_name:$scope.login_name,
        password:$scope.password,
        dev_uuid: uuid,
        getui_uuid: uuid,
        serve_mode: 'api_android'
      }).then(function (response) {
        if (response.data.err) {
          alert(response.data.err.message);
          return;
        }
        store.set('login_name',response.data.payload.login_name);
        store.set('device_password',response.data.payload.device_password);
        // location.href='hall.html';
      }, function () {
        alert("登录失败");
      });
    };

    //尝试使用device auto login
    var login_name=store.get('login_name');
    var device_password=store.get('device_password');
    console.log(login_name);
    if (device_password && login_name) {
      $http.post(BASE_URL + 'user/device_login', {
          "login_name": login_name,
          "dev_uuid": uuid,
          "device_password": device_password,
          "serve_mode":"api_phonegap"
          // "getui_uuid": "uuid of getui" // optional
      }).then(function (response) {
        if (!response.data.err) {
          store.set('device_password',response.data.payload.device_password);
          location.href='hall.html';
        }
      }, function () {
        alert("请求失败");
      });
    }
  });

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  console.log('device ready');
  console.log(device.cordova);
}
