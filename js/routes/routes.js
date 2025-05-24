(function () {
        angular.module('router', []).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
                $stateProvider
                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'menu.html',
                        controller: 'AppCtrl'
                    })
                    .state('login', {
                        url: '/login',
                        templateUrl: 'login.html',
                        controller: 'LoginCtrl'
                    })
                    .state('app.dashboard', {
                        url: '/dashboard',
                        views: {
                            'menuContent': {
                                // templateUrl: 'templates/dashboard.html',
                                templateUrl: 'dashboard.html',
                                controller: 'dashboardCtrl',
                                cache: false
                            },

                        }
                    })
                    .state('app.download', {
                        url: '/download',
                        views: {
                            'menuContent': {
                                templateUrl: 'download.html',
                                controller: 'downloadCtrl',
                                cache: false
                            },

                        }
                    })
                    .state('app.deliveryScan', {
                        url: '/deliveryScan',
                        views: {
                            'menuContent': {
                                templateUrl: 'deliveryScan.html',
                                controller: 'scanCtrl',
                                cache: false
                            },

                        }
                    })
                    .state('app.orderList', {
                        url: '/orderList',
                        views: {
                            'menuContent': {
                                templateUrl: 'orderList.html',
                                controller: 'orderCtrl',
                                cache: false
                            },
                        }
                    })
                    .state('app.reliveryOrderList', {
                        url: '/reliveryOrderList',
                        views: {
                            'menuContent': {
                                templateUrl: 'redeliveryOrderList.html',
                                controller: 'reliveryOrderCtrl',
                                cache: false
                            },
                        }
                    })
                    .state('app.orderDetails', {
                        url: '/orderDetails/:ResID/:DeliveryID/:ScanID',
                        views: {
                            'menuContent': {
                                templateUrl: 'orderDetails.html',
                                controller: 'orderDetailsCtrl',
                                cache: false
                            },
                        }
                    })
                    
                    .state('app.creditList', {
                        url: '/creditList',
                        views: {
                            'menuContent': {
                                templateUrl: 'creditList.html',
                                controller: 'creditCtrl',
                                cache: false
                            },

                        }
                    })

                    

                    .state('app.creditDetail', {
                        url: '/creditDetail/:ResID/:DeliveryID',
                        views: {
                            'menuContent': {
                                templateUrl: 'OrderDetailWCredit.html',
                                controller: 'creditDetailCtrl',
                                cache: false
                            },

                        }
                    })

                    .state('app.viewOrderDetail', {
                        url: '/viewOrderDetail/:ResID/:DeliveryID',
                        views: {
                            'menuContent': {
                                templateUrl: 'viewOrder.html',
                                controller: 'viewOrderCtrl',
                                cache: false
                            },

                        }
                    })

                    .state('app.help', {
                        url: '/help',
                        views: {
                            'menuContent': {
                                templateUrl: 'help.html',
                                controller: 'helpCtrl',
                                cache: false
                            },

                        }
                    })
                    .state('app.log', {
                        url: '/log',
                        views: {
                            'menuContent': {
                                templateUrl: 'log.html',
                                controller: 'logCtrl',
                                cache: false
                            },

                        }
                    })
                    .state('app.changePassword', {
                        url: '/changePassword',
                        views: {
                            'menuContent': {
                                templateUrl: 'changePassword.html',
                                controller: 'changePasswordCtrl',
                                cache: false
                            },

                        }
                    })



                    .state('appSign.tour', {
                        url: 'tour',
                        templateUrl: 'tour.html',
                        controller: 'helpCtrl',
                        cache: false


                    })

                    .state('appSign', {
                        url: '/',
                        abstract: true,
                        template: ' <ion-nav-view id="main-content-app"></ion-nav-view>'
                    })
                    .state('appSign.residentSign', {
                        url: 'residentSign/:ResID/:DeliveryID/:sumRedelivery/:sumCredit/:orderReceipt',
                        templateUrl: 'residentSignature.html',
                        controller: 'residentSignCtrl',
                        cache: false
                    }).state('appSign.changePassword', {
                            url: 'changePassword',
                            templateUrl: 'changePassword.html',
                            controller: 'changePasswordCtrl',
                            cache: false                        
                    });

            $urlRouterProvider.otherwise('/login');





        }]);

})();