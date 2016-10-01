angular.module('argassistant.controllers', [])

  .controller('MapCtrl', function($scope,$http,$rootScope) {
    $scope.full_panel=false;
    $scope.toggle_full_panel=function () {
      $scope.full_panel=!$scope.full_panel;
    };
    $http.get(BASE_URL + 'user/'+$rootScope.login_name+'/basic_info',{}).then(function (response) {
      if (response.data.err) {
        alert(response.data.err.message);
        return;
      }
      $rootScope.basic_info=response.data.payload;
      console.log($rootScope.basic_info);
    }, function () {
      alert("获取用户基本信息失败");
    });

  })

  .controller('ItemsCtrl', function($scope) {})

  // .controller('SkillGroupCtrl', function($scope) {})
  .controller('SkillListCtrl', function($scope,$stateParams,element) {
    $scope.group_id=$stateParams.group_id;
    $scope.use_skill= function () {
      element.invoke($scope,this.skill.identity);
    }
  })


  .controller('SkillDetailCtrl', function($scope,$stateParams,$ionicModal,$rootScope,$http,http_handle,element) {
    $scope.skill_id=$stateParams.skill_id;
    if ($rootScope.appearance.skills_panel_description.skills[$scope.skill_id].detail_article_id) { //如果有article
      $http.get(GAME_BASE_URL+'article/'+$rootScope.appearance.skills_panel_description.skills[$scope.skill_id].detail_article_id, {}).then(function (response) {
        $rootScope.appearance.skills_panel_description.skills[$scope.skill_id].article=response.data;
      }, function () {
        alert("请求失败");
      });
    }else{ //如果没有article
      $rootScope.appearance.skills_panel_description.skills[$scope.skill_id].article='';
    }


    $scope.use_skill = function() {
      element.invoke($scope,$scope.skill_id);
    };
    $scope.checkbox_value=false;
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  })


  // .controller('ItemGroupCtrl', function($scope) {})
  .controller('ItemListCtrl', function($scope,$rootScope,$stateParams,element) {
    $scope.group_id=$stateParams.group_id;
    $scope.use_item= function () {
      this.item.invoking=!this.item.invoking;
      // this.item.invoking=true;
      // delay_to_false(this.item.invoking,2000);
      // var abc=123; 'console.log(abc);console.log(this.item.invoking);this.item.invoking=false'
      // var item_id = this.item.identity;
      //obj.invoking = false;
      // console.log(obj);
      // console.log(this.item);
      // console.log('xxxx ffffffffffffff');
      // setTimeout(function() {
        // console.log('xxxxxxxxxxxxxxxx'); $rootScope.appearance.items_panel_description.items[item_id].invoking=false },2000);
      // setTimeout(to_false)
      element.invoke($scope,this.item.identity);
    }
  })
  .controller('ItemDetailCtrl', function($scope,$stateParams,$ionicModal,$http,$rootScope,http_handle,element) {
    $scope.item_id=$stateParams.item_id;
    if ($rootScope.appearance.items_panel_description.items[$scope.item_id].detail_article_id) { //如果有article
      $http.get(GAME_BASE_URL+'article/'+$rootScope.appearance.items_panel_description.items[$scope.item_id].detail_article_id, {}).then(function (response) {
        $rootScope.appearance.items_panel_description.items[$scope.item_id].article=response.data;
      }, function () {
        alert("请求失败");
      });
    }else{ //如果没有article
      $rootScope.appearance.items_panel_description.items[$scope.item_id].article='';
    }


    $ionicModal.fromTemplateUrl('templates/modal-select-target.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.use_item = function() {
      element.invoke($scope,$scope.item_id);
    };
    $scope.checkbox_value=false;
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  })




  .controller('MissionCtrl', function($scope) {})

  // .controller('ItemsCtrl', function($scope, Chats) {
  //   // With the new view caching in Ionic, Controllers are only called
  //   // when they are recreated or on app start, instead of every page change.
  //   // To listen for when this page is active (for example, to refresh data),
  //   // listen for the $ionicView.enter event:
  //   //
  //   //$scope.$on('$ionicView.enter', function(e) {
  //   //});
  //
  //   $scope.chats = Chats.all();
  //   $scope.remove = function(chat) {
  //     Chats.remove(chat);
  //   };
  // })

  // .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  //   $scope.chat = Chats.get($stateParams.chatId);
  // })

  .controller('AccountCtrl', function($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
