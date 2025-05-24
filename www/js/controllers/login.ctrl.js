(function () {
    angular.module('starter.controllers')
    .controller('LoginCtrl', ['$scope', '$state', 'service', 'Constant', 'ionicPopups', '$rootScope', 'getServiceUrl', 'sql', 'Idle', 'ionicToast', 'factory', 'configConst', '$ionicLoading', '$ionicPlatform', 'EnvConfig', '$timeout',
    function ($scope, $state, service, Constant, ionicPopups, $rootScope, getServiceUrl, sql, Idle, ionicToast, factory, configConst, $ionicLoading, $ionicPlatform, EnvConfig, $timeout) {
        function sharedDataFetch() {
            $ionicPlatform.ready(function () {
                EnvConfig.getCustConfig().then(function (data) {
                   // alert("getCustConfig");
                   // alert(JSON.stringify(data));
                    if (data.order_signature_server_url === "") {
                        EnvConfig.getEnvConfig().then(function (data) {
                            console.log("getEnvConfig", data);
                            //alert("getEnvConfig");
                            //alert(JSON.stringify(data));
                            if (!data.order_signature_server_url || data.order_signature_server_url === "") {
                                ionicToast.show(' 13 Unable to determine app configuration. Please contact your administrator', 'bottom', false, 3000);
                            } else {
                                if (data.username !== undefined && data.username !== '' && data.password !== undefined && data.password !== '') {
                                    factory.username = data.username;
                                    factory.password = data.password;
                                }

                               // alert("service url==>"+data.order_signature_server_url);
                                if (data.includecommissary != "false") {
                                    factory.includeCommissary = '1';
                                }
                                if (data.includemcp != "false") {
                                    factory.includeMCP = '1';
                                }
                                if (data.includetto != "false") {
                                    factory.includeTTO = '1';
                                }
                                if (data.includefacretail != "false") {
                                    factory.includeFacRetail = '1';
                                }
                               
                                if (data.center_code !== undefined && data.center_code !== '') {
                                    factory.center_code = data.center_code;
                                }

                                if (data.order_signature_server_url !== undefined && data.order_signature_server_url !== "") {
                                    factory.serviceUrl = data.order_signature_server_url;

                                    localStorage.setItem("ApiUrl", data.order_signature_server_url);
                                    // alert(data.order_signature_server_url);
                                } else
                                    ionicToast.show(' 44 Unable to determine Service URL. Please contact your administrator', 'bottom', false, 3000);
                            }
                        },function (error) { 
                            //alert("50");
                            //alert(JSON.stringify(error));
                            ionicToast.show(SON.stringify(error));
                         });

                    } else {
                        if (data.username !== undefined && data.username !== '' && data.password !== undefined && data.password !== '') {
                            factory.username = data.username;
                            factory.password = data.password;
                        }
                        if (data.center_code !== undefined && data.center_code !== '') {
                            factory.center_code = data.center_code;
                        }

                        if (data.includecommissary != "false") {
                            factory.includeCommissary = 1;
                        }
                        if (data.includemcp != "false") {
                            factory.includeMCP = 1;
                        }
                        if (data.includetto != "false") {
                            factory.includeTTO = 1;
                        }
                        if (data.includefacretail != "false") {
                            factory.includeFacRetail = 1;
                        }
                       // alert("service url 70==>"+data.order_signature_server_url);
                        if (data.order_signature_server_url !== undefined && data.order_signature_server_url !== "") {
                            factory.serviceUrl = data.order_signature_server_url;

                            // alert(data.order_signature_server_url);
                            localStorage.setItem("ApiUrl", data.order_signature_server_url);
                        } else
                            ionicToast.show(' 76 Unable to determine Service URL. Please contact your administrator', 'bottom', false, 3000);
                    }

                },function (error) { 
                    //alert("85");
                    //alert(JSON.stringify(error));
                    ionicToast.show(SON.stringify(error));
                 });

            });
        }
      sharedDataFetch();

  
        $scope.$on('$ionicView.beforeEnter', function (ev, info) {
            $scope.loginObj = {};
            $scope.loginObj.username = "cjgraf"; // "ifsanchez";
            $scope.loginObj.password = "123456";
            // $scope.loginObj.ApiUrl = factory.serviceUrl ;//'https://fusion1.tsgsoft.com/TabTesterAPI/api/CommTabletDelivery/';     
            $scope.loginObj.ApiUrl = factory.serviceUrl  = 'https://fusion1.tsgsoft.com/TabTesterAPI/api/CommTabletDelivery/';     

            //    factory.username = 'test';
            //    factory.password = 'test1';


        });


        // $scope.$watch(function () {
        //         return $scope.loginObj.ApiUrl;
        //     },
        //     function (newVal, oldVal) {
        //         if (newVal !== oldVal) {
        //             localStorage.setItem("ApiUrl", $scope.loginObj.ApiUrl);
        //             console.log(localStorage.getItem("ApiUrl"));
        //         }
        //     });

        // if (!ionicPopups.isOnline) {
        //     ionicToast.show('No Internet Connectivity!', 'bottom', false, 3000); 
        //    }

        $scope.login = function (user) {
            factory.adminlogin = false;
            factory.isAuthenticated = false;
            // ionicPopups.isOnline = true;
            // $state.go('app.dashboard');
            if (db !== null) {
                if (!ionicPopups.isOnline) {
                    ionicToast.show('No Internet Connectivity! Trying local login.', 'bottom', false, 3000);
                    if (user.username == factory.username && user.password == factory.password && user.username !== '' && user.password !== '') {
                        factory.adminlogin = true;
                        factory.isAuthenticated = true;
                        $state.go('app.dashboard');

                    } else {
                        ionicToast.show('Invalid local username or password.', 'bottom', false, 3000);
                        return true;
                    }
                } else {
                    if (!user) {
                        ionicToast.show('Enter username and password.', 'bottom', false, 3000);
                        return;
                    }
                    if (!user.username) {
                        ionicToast.show('Enter username.', 'bottom', false, 3000);
                        return;
                    }
                    if (!user.password) {
                        ionicToast.show('Enter password.', 'bottom', false, 3000);
                        return;
                    }
                   // alert(factory.serviceUrl);
                    if (!factory.serviceUrl) {
                        ionicToast.show('Unable to determine Service URL. Please contact your administrator', 'bottom', false, 3000);
                    }

                    $ionicLoading.show({
                        template: 'Please wait...'
                    });
                    service.login(user).then(function (res) {



                        // var res = {};
                        // res.status = 200;
                        // res.data = Constant.ServiceCenters;

                        // $state.go('app.dashboard');

                        if (res.status == 404) {
                            $ionicLoading.hide();
                            ionicToast.show('Server error.  Please verify the URL is correct.', 'bottom', false, 3000);
                            return;
                        }

                        if (res.status == 400 || res.status !== 200) {
                            $ionicLoading.hide();
                            ionicToast.show('Invalid username or password.', 'bottom', false, 3000);
                            return;
                        } else {
                            localStorage.setItem('LoginDetails', user.username);
                            factory.isSync = true;
                            localStorage.setItem("loginRespons", angular.toJson(res.data));
                            var serviceCenters = res.data.ServiceCenters;
                            //var serviceCenters = res.data;
                            Idle.watch();
                            sql.executeSqlQuery('truncateServiceCenters', [], function () {
                                for (var i = 0; i < serviceCenters.length; i++) {
                                    sql.executeSqlQuery('storeServiceCenters', [serviceCenters[i].CenterCode, serviceCenters[i].CenterName], function (signatures) {});
                                }

                                var facilitiesList = [];
                                sql.executeSqlQuery('truncateFacilities', [], function (signatures) {
                                    for (var k = 0; k < res.data.ServiceCenters.length; k++) {
                                        var facilities = res.data.ServiceCenters[k].Facilities;
                                        // for (var k = 0; k < res.data.length; k++) {
                                        //var facilities = res.data[k].Facilities;
                                        for (var j = 0; j < facilities.length; j++) {
                                            sql.executeSqlQuery('storeFacilities', [facilities[j].FacilityCode, facilities[j].FacilityName, facilities[j].ServiceCenter, facilities[j].IncludePhones, 0], function (signatures) {});
                                            facilitiesList.push(facilities[j]);
                                        }
                                    }
                                    factory.facilitiesAll = facilitiesList;
                                });
                                if (user.password.toLowerCase() == configConst.DefaultPassword.toLowerCase()) {
                                    $ionicLoading.hide();
                                    $state.go('appSign.changePassword');
                                } else {
                                    $ionicLoading.hide();
                                    $state.go('app.dashboard');
                                }

                            });
                        }
                    });
                }


            } else {
                service.login(user).then(function (res) {
                    if (res.status !== 200) {
                        ionicToast.show('Invalid username or password.', 'bottom', false, 3000);
                        return;
                    } else {
                        localStorage.setItem("loginRespons", angular.toJson(res.data));
                        localStorage.setItem('LoginDetails', user.username);
                        if (user.password == configConst.DefaultPassword.toLowerCase()) {
                            $ionicLoading.hide();
                            $state.go('appSign.changePassword');
                        } else {
                            $ionicLoading.hide();
                            $state.go('app.dashboard');
                        }
                    }
                });
            }
        };

    }
]);
})();