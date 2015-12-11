'use strict';

var monitoringApp = angular.module('monitoringApp', [
    'ui.router',
    'ngSanitize',
    'ui.select',
    'ui.bootstrap',
    // 'monitoring.services',
    'monitoring.controllers'
    ]);

monitoringApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/alert");

    $stateProvider
        .state("alerts", {
            url: "/alert",
            templateUrl: "templates/alerts/alerts.html"
        })
        .state("history", {
          url: "/alert/:alertId/history",
          templateUrl: "templates/alerts/history.html"
        })
        .state("last", {
          url: "/alert/:alertId/last",
          templateUrl: "templates/alerts/last.html"
        })
        .state("orders", {
            url: "/orders",
            templateUrl: "templates/orders/orders.html"
        })
        .state("results", {
            url: "/results/:alertId",
            templateUrl: "templates/orders/results.html"
        })
        .state("details", {
            url: "/result/:alertId/details/:orderId",
            templateUrl: "templates/orders/details.html"
        });
});
