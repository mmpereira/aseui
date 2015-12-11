'use strict';

angular.module('monitoring.controllers', ['monitoring.services'])
    .constant("API_URL", "http://localhost:9200/_ase")
    .controller('MontoringController', ['$scope', function($scope) {

    }])

    .controller('AlertsController', ['$scope', '$interval', 'AlertService', 'SchedulerService', 'HistoryService',
      function($scope, $interval, AlertService, SchedulerService, HistoryService) {

        $scope.alert = {};
        $scope.alert.selected = undefined;
        $scope.cron = {};

        var currentTime = new Date();

        $scope.cron.time = new Date(currentTime.getTime() + 60000);
        $scope.cron.frequency = "0/5 * * * * ?";
        $scope.cron.cronType = undefined;

        $scope.hstep = 1;
        $scope.mstep = 1;

        AlertService.getAvailable(function(data) {
          $scope.alerts = data;
        });

        refreshScheduledAlerts();
        $interval(function () {
          refreshScheduledAlerts();
        }, 15000);

        $scope.selectCron = function(cron) {
            $scope.cron.cronType = cron;

            if(cron === 'TIME') {
                $scope.showCron = cron;
            } else {
                $scope.showCron = cron;
            }
        }

        $scope.addCron = function() {

          var newCron = {};
          newCron.alertName = $scope.alert.name;
          newCron.alertJob = $scope.alert.selected;

          if($scope.cron.cronType == 'FREQUENCY') {
            newCron.cronType = 'FREQUENCY';
            newCron = _.omit(newCron, 'time');
            newCron.cronValue = $scope.cron.frequency;
          } else {
            newCron.cronType = 'TIME';
            newCron = _.omit(newCron, 'frequency');
            newCron.cronValue = $scope.cron.time.getTime();
          }


          SchedulerService.schedule(newCron, function() {
                refreshScheduledAlerts();
          });
        }

        $scope.removeCron = function(alertId) {

          SchedulerService.unschedule(alertId, function() {

          });
        }

        function refreshScheduledAlerts() {
          SchedulerService.getScheduled(function(data) {
              $scope.scheduledAlerts = data;

              _.each(data, function(d, index) {

                HistoryService.getLast(d.id, function(report) {
                  $scope.scheduledAlerts[index]['success'] = report.success;
                  $scope.scheduledAlerts[index]['nextFireTime'] = report.nextFireTime;
                });

              });
          });
        }
    }])

    .controller('HistoryController', ['$scope', '$stateParams', 'HistoryService',
      function($scope, $stateParams, HistoryService) {

          HistoryService.get($stateParams.alertId, function(data) {
            $scope.history = data;
          });

      }])

    .controller('LastController', ['$scope', '$stateParams', 'HistoryService',
      function($scope, $stateParams, HistoryService) {

          HistoryService.getLast($stateParams.alertId, function(data) {
            $scope.report = data;
          });

      }])


    .controller('OrdersController', ['$scope', '$http', 'API_URL', 'NotificationService',
      function($scope, $http, API_URL, NotificationService) {

        $http.get(API_URL + '/alert/active')
            .then(function(response) {
                $scope.activeAlerts = response.data;
            });

        $scope.execute = function(alertId) {
            $http.get(API_URL + '/alert/' + alertId)
                .then(function(response) {

                    var executedAlertIdx = _.findIndex($scope.activeAlerts, { 'id': alertId });

                    $scope.activeAlerts[executedAlertIdx]['lastResult'] = response.data.success;
                    $scope.activeAlerts[executedAlertIdx]['lastExecution'] = response.data.lastExecution;
                });
        };

        NotificationService.alert("Order Transmission Failed");
    }])

    .controller('ResultController', ['$scope', '$http', '$stateParams', 'API_URL', function($scope, $http, $stateParams, API_URL) {

        $http.get(API_URL + '/alert/' + $stateParams.alertId + '/result')
            .then(function(response) {

                $scope.alertId = $stateParams.alertId;
                $scope.results = response.data.result;
                $scope.columns = _.keys($scope.results[0].resultElement);
                $scope.columns = _.remove($scope.columns, function(e) {
                    return e !== "TAGS";
                });

            });

    }])

    .controller('DetailsController', ['$scope', '$http', '$stateParams', 'API_URL', function($scope, $http, $stateParams, API_URL) {
      console.log('details controller');
        $scope.orderId = $stateParams.orderId;

        $http.get(API_URL + '/alert/' + $stateParams.alertId + '/result')
            .then(function(response) {

                $scope.order = _.findWhere(response.data.result, function(e) {
                    return e.resultElement["NAME"] === $stateParams.orderId;
                }).resultElement;

                  var path = require('path');
                  var filePath = path.join(__dirname, 'config', 'fixTags.json');
                  var tagsJson = require(filePath);
                var fixTagData;
                // $.getJSON("../config/fixTags.json", function(json) {
                    // fixTagData = json;
                    fixTagData = tagsJson;

                    $scope.fields = [];

                    _.forEach(_.keys($scope.order.TAGS), function(tag) {
                        var newTag = fixTagData[tag];

                        if( newTag !== undefined) {
                            newTag.id = tag;
                            $scope.fields.push(newTag);
                        }
                    });

                    // $scope.$digest();

                //  });
            });

    }])

    .filter("resultFilter", function($filter) {
        return function(input) {
            if( _.isNumber(input) ) {
                return $filter('date')(new Date(input), 'dd-MM-yyyy HH:mm:ss');
            } else return input;
        }
    })
    .filter("alertNameFilter", function($filter) {
      return function(input) {
        var index = input.lastIndexOf('.');
        return input.substring(index+1, input.length);
      }
    });
