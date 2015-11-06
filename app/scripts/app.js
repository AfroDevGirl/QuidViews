'use strict';

/**
 * @ngdoc overview
 * @name quidditchVideoPlayerApp
 * @description
 * # quidditchVideoPlayerApp
 *
 * Main module of the application.
 */
var app = angular.module('quidditchVideoPlayerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ]);
app.config(function ($routeProvider, $httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
});

// Run

app.run(function () {
  var tag = document.createElement('script');
  tag.src = "http://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

// Service

app.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

  var service = this;

  var youtube = {
    ready: false,
    player: null,
    playerId: null,
    videoId: null,
    videoTitle: null,
    playerHeight: '480',
    playerWidth: '640',
    state: 'stopped'
  };
  var results = [];

  $window.onYouTubeIframeAPIReady = function () {
    youtube.ready = true;
    service.bindPlayer('player');
    service.loadPlayer();
    $rootScope.$apply();
  };

  function onYoutubeReady (event) {
    $log.info('YouTube Player is ready');
  }

  function onYoutubeStateChange (event) {
    if (event.data == YT.PlayerState.PLAYING) {
      youtube.state = 'playing';
    } else if (event.data == YT.PlayerState.PAUSED) {
      youtube.state = 'paused';
    }
    $rootScope.$apply();
  }

  this.bindPlayer = function (elementId) {   
    youtube.playerId = elementId;
  };

  this.createPlayer = function () {
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      playerVars: {
        rel: 0,
        showinfo: 0
      },
      events: {
        'onReady': onYoutubeReady,
        'onStateChange': onYoutubeStateChange
      }
    });
  };

  this.loadPlayer = function () {
    if (youtube.ready && youtube.playerId) {
      if (youtube.player) {
        youtube.player.destroy();
      }
      youtube.player = service.createPlayer();
    }
  };

  this.launchPlayer = function (id, title) {
    youtube.player.loadVideoById(id);
    youtube.videoId = id;
    youtube.videoTitle = title;
    return youtube;
  }

  this.listResults = function (data) {
    results.length = 0;
    for (var i = data.items.length - 1; i >= 0; i--) {
      results.push({
        id: data.items[i].id.videoId,
        title: data.items[i].snippet.title,
        description: data.items[i].snippet.description,
        thumbnail: data.items[i].snippet.thumbnails.default.url,
        author: data.items[i].snippet.channelTitle
      });
    }
    return results.reverse();
  }

  this.getYoutube = function () {
    return youtube;
  };

  this.getResults = function () {
    return results;
  };

}]);

// Controller

app.controller('VideosController', function ($scope, $http, $log, VideosService) {

  init();

  function init() {
    $scope.youtube = VideosService.getYoutube();
    $scope.results = VideosService.getResults();
  }

  $scope.launch = function (id, title) {
    VideosService.launchPlayer(id, title);
    
  };

  $scope.search = function (dateStart, dateEnd, narrowSearch) {
    $http.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: 'AIzaSyBgFw3Ca-KqsoAwTcjJhkvyeXQbhA4plVo',
        type: 'video',
        videoCategoryId: '17',
        order: 'relevance',
        publishedAfter: dateStart,
        publishedBefore: dateEnd,
        maxResults: '25',
        part: 'id,snippet',
        fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
        q: narrowSearch + ' quidditch'
      }
    })
    .success( function (data) {
      VideosService.listResults(data);
      
    })
    .error( function () {
      $log.info('Search error');
    });
  };
});
