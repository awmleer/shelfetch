angular.module('hall',['ionic'])
  .controller('HallCtrl', function ($scope,$http,$rootScope,$ionicModal) {
    $http.get(GAME_BASE_URL+'user/game_sessions', {}).then(function (response) {
      console.log(response.data);
      if (response.data.err) {
        alert(response.data.err.message);
        return;
      }
      $scope.games=[];
      angular.forEach(response.data.payload.game_session_ids, function(session_id,i,array) {
        $http.get(GAME_BASE_URL+'game_session/'+session_id+'/basic_info', {}).then(function (response) {
          if (response.data.err) {
            alert(response.data.err.message);
            return;
          }
          $scope.games.push(response.data.payload);
        }, function () {
          alert("请求失败");
        });
      });
    }, function () {
      alert("请求失败");
    });

    $ionicModal.fromTemplateUrl('templates/modal-game-detail.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.game_click= function () {
      console.log($scope.games);
      $scope.game_looking=this.game;
      $http.get(GAME_BASE_URL+'article/sample_game/introduction', {}).then(function (response) {
        $scope.game_looking.introduction=response.data;
      }, function () {
        alert("请求失败");
      });
      $scope.modal.show();
    };

    $scope.start_game= function () {
      store.set('session_id',$scope.game_looking.session_id);
      location.href='prestart.html'
    };
  });

