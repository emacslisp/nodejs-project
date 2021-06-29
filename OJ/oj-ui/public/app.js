var app = angular.module('app', []);

app.controller('MainCtrl', function($scope, $interval, $http) {
  $scope.arr = [];
  var stop = $interval(function() {
    $http.get('http://localhost:6000/posts')
          .then(function(res) {
        $scope.arr = res.data.posts;
      }, function(e) {
        console.error(e);
      });
  }, 3000);
});
