angular.module('monitoring.services', [])


  .factory('AlertService', ['$http', 'API_URL', function($http, API_URL) {

      function getAvailable(cb) {
        $http.get(API_URL + '/type/alert')
            .then(function(response) {
               cb(response.data);
            }
        );
      };

      function getActive(cb) {
        $http.get(API_URL + '/alert/active')
            .then(function(response) {
               cb(response.data);
            }
        );
      };

      return {
        getAvailable: getAvailable,
        getActive: getActive
      }
    }])
  .factory('NotificationService', [function() {
    function alert(message) {
      // ipc.send('alert-notification', 'test 123');
    };


    return {
      alert: alert
    }

  }])

  .factory('HistoryService', ['$http', 'API_URL', function($http, API_URL) {

    function get(alertId, cb) {
      $http.get(API_URL + '/alert/' + alertId + '/history')
        .then(function(response) {
          cb(response.data);
        });
    };

    function getLast(alertId, cb) {
      $http.get(API_URL + '/alert/' + alertId + '/last')
        .then(function(response) {
          cb(response.data);
        });
    };

    return {
      get: get,
      getLast: getLast
    }
  }])
  .factory('SchedulerService', ['$http', 'API_URL', function($http, API_URL) {

    function schedule(cron, cb) {
      $http.post(API_URL + '/alert', cron).then(function() {
        cb();
      });
    };

    function unschedule(alertId, cb) {
      $http.delete(API_URL + '/alert/' + alertId).then(function() {
        cb();
      });
    }

    function getScheduled(cb) {
      $http.get(API_URL + '/alert').then(function(response) {
        cb(response.data);
      });
    };

    return {
      schedule: schedule,
      getScheduled: getScheduled,
      unschedule: unschedule
    };

  }]);
