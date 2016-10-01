angular.module('argassistant.services', [])

  .service('element', function ($rootScope,$http,http_handle) {
    this.invoke=function ($scope,element_identity) {

      $http.post(GAME_BASE_URL + 'element/invoke', {
        err:null,
        payload:{
          "element": element_identity
        }
      }).then(function (response) {
        if (response.data.err) {
          alert(response.data.err.message);
          return;
        }
        http_handle.value_merge(response.data.updated_values);
        http_handle.operate(response.data.operations,$scope);
        console.log(response.data);
      }, function () {
        alert("请求失败");
      });
    };
  })


  .service('http_handle', function($rootScope,$ionicPopup,$ionicModal) {

    this.value_merge = function (updated_values) {
      // console.log('before:');
      // console.log($rootScope.values);
      angular.forEach(updated_values, function(value, key) {
        // console.log(key+':'+value);
        $rootScope.values[key]=value;
      });
      // console.log('after:');
      // console.log($rootScope.values);
      console.log('merged!');
    };


    this.operate= function (operations,$scope) {
      angular.forEach(operations, function(operation,i,array) {
        switch (operation.operation){
          case 'appearance_update':
            if (operation.info.action=='set') {
              eval('$rootScope.'+operation.info.object)[operation.info.field]=operation.info.value;
            }else if (operation.info.action == 'delete') {
              delete eval('$rootScope.'+operation.info.object)[operation.info.field];
            }
            break;
          case 'interaction':
            //todo operation -- interaction
            $ionicModal.fromTemplateUrl('templates/modal-select-target.html', {
              scope: $scope,
              animation: 'slide-in-up'
            }).then(function(modal) {
              $scope.modal = modal;
            });
            break;
        }
      });
    };


    this.test=function ($scope) {
      $scope.test_text='lalala';
      $ionicPopup.show({
        template: '<input type="number" ng-model="buy.slot" style="padding-left: 10px" >',
        title: '购买模板槽位',
        subTitle: '请输入你要购买的目标槽位数量',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>购买</b>',
            type: 'button-positive',
            onTap: function(e) {
              console.log($scope.test_text+'abc');
            }
          }
        ]
      }).then(function(res) {
        console.log('Tapped!', res);
      });
    };


  })






  .factory('Chats', function() {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function() {
        return chats;
      },
      remove: function(chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function(chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  });
