angular.module('argassistant', ['ionic', 'argassistant.controllers', 'argassistant.services'])
  .run(function($ionicPlatform,$rootScope,$http,http_handle) {
    $rootScope.login_name=store.get('login_name');
    $rootScope.device_password=store.get('device_password');

    $rootScope.isIOS = ionic.Platform.isIOS();
    $rootScope.isAndroid = ionic.Platform.isAndroid();

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
    $rootScope.BASE_URL=BASE_URL;
    $rootScope.GAME_BASE_URL=GAME_BASE_URL;
    $rootScope.session_id=store.get('session_id');

    $http.get(GAME_BASE_URL+'game_session/'+$rootScope.session_id+'/initialization', {}).then(function (response) {
      if (response.data.err) {
        alert(response.data.err.message);
        return;
      }

      $rootScope.appearance=response.data.payload.appearance;
      $rootScope.values={};

      //value value_merge & operate
      http_handle.value_merge(response.data.updated_values);
      http_handle.operate(response.data.operations,$rootScope);

      $http.get(GAME_BASE_URL+'game_session/'+$rootScope.session_id+'/values', {}).then(function (response) {
        if (response.data.err) {
          alert(response.data.err.message);
          return;
        }
        $rootScope.values=response.data.payload;
      }, function () {
        alert("请求失败");
      });

    }, function () {
      alert("游戏初始化失败");
    });


  })

  .config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.map', {
        url: '/map',
        views: {
          'tab-map': {
            templateUrl: 'templates/tab-map.html',
            controller: 'MapCtrl'
          }
        }
      })

      // .state('tab.skills-group', {
      //   url: '/skills/group',
      //   views: {
      //     'tab-skills': {
      //       templateUrl: 'templates/tab-skills-group.html',
      //       controller: 'SkillGroupCtrl'
      //     }
      //   }
      // })
      .state('tab.skills-list', {
        url: '/skills/list/',
        // url: '/skills/list/:group_id',
        views: {
          'tab-skills': {
            templateUrl: 'templates/tab-skills-list.html',
            controller: 'SkillListCtrl'
          }
        }
      })
      .state('tab.skills-detail', {
        url: '/skills/detail/:skill_id',
        views: {
          'tab-skills': {
            templateUrl: 'templates/tab-skills-detail.html',
            controller: 'SkillDetailCtrl'
          }
        }
      })


      // .state('tab.items-group', {
      //   url: '/items/group',
      //   views: {
      //     'tab-items': {
      //       templateUrl: 'templates/tab-items-group.html',
      //       controller: 'ItemGroupCtrl'
      //     }
      //   }
      // })
      .state('tab.items-list', {
        url: '/items/list/',
        // url: '/items/list/:group_id',
        views: {
          'tab-items': {
            templateUrl: 'templates/tab-items-list.html',
            controller: 'ItemListCtrl'
          }
        }
      })
      .state('tab.items-detail', {
        url: '/items/detail/:item_id',
        views: {
          'tab-items': {
            templateUrl: 'templates/tab-items-detail.html',
            controller: 'ItemDetailCtrl'
          }
        }
      })

      .state('tab.missions', {
        url: '/missions',
        views: {
          'tab-missions': {
            templateUrl: 'templates/tab-missions.html',
            controller: 'MissionCtrl'
          }
        }
      })

      // .state('tab.chat-detail', {
      //   url: '/chats/:chatId',
      //   views: {
      //     'tab-chats': {
      //       templateUrl: 'templates/chat-detail.html',
      //       controller: 'ChatDetailCtrl'
      //     }
      //   }
      // })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/map');

  });
