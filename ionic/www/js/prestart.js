angular.module('prestart',['ngSanitize','ionic'])
  .controller('PrestartCtrl', function ($scope,$http,$rootScope,$ionicModal) {
    $scope.session_id=store.get('session_id');
    $scope.GAME_BASE_URL=GAME_BASE_URL;
    $http.get(GAME_BASE_URL + 'game_session/'+$scope.session_id+'/character_selection', {}).then(function (response) {
      if (response.data.err) {
        alert(response.data.err.message);
        return;
      }
      console.log(response.data);
      $scope.characters=response.data.payload.characters;
      $scope.choice=$scope.characters[0].character_id;
    }, function () {
      alert("请求失败");
    });
    $scope.choosed=null;

    $scope.character_choose= function () {
      if (!this.character.selectable) {
        alert("不能选择这个角色");
        return;
      }
      $scope.choosed=this.character.character_id;
      console.log($scope.choosed);
    };

    $scope.confirm_selection= function () {
      if (!$scope.choosed) {
        alert("请先选择角色");
        return;
      }
      $http.post(GAME_BASE_URL + 'game_session/'+$scope.session_id+'/character_selection', {
        err:null,
        payload:{
          select_character: $scope.choosed
        }
      }).then(function (response) {
        if (response.data.err) {
          alert(response.data.err.message);
          return;
        }
        alert("选择成功");
        $http.post(GAME_BASE_URL + 'game_session/'+$scope.session_id+'/login', {
          err:null,
          payload:{
            "client_version": VERSION.major+'.'+VERSION.minor,
            "getui_uuid": "alkjeoijfoaefawefq"//todo 个推UUID
          }
        }).then(function (response) {
          if (response.data.err) {
            if (response.data.err.message=='session not started') {
              $scope.modal_show();
            }else{
              alert(response.data.err.message);
            }
            return;
          }
          location.href='game.html';
        }, function () {
          alert("请求失败");
        });
      }, function () {
        alert("请求失败");
      });


    };

    $scope.modal_show= function () {
      $ionicModal.fromTemplateUrl('modal-not-begin.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

  });

