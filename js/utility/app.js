var db = null;
(function () {
    angular.module('starter', [
            'ionic',
            'starter.controllers',
            'ionMdInput',
            'router',
            'ngCordova',
            'factories',
            'ionic-datepicker',
            'ionic-material',
            'starter.constant',
            'application.Services',
            'starter.config',
            'starter.value',
            'ngIdle',
            'sprintf',
            'ionic-toast',
            'templates'
        ]) //'ionic-materia',
        .run(['$ionicPlatform', '$state', '$ionicLoading', 'ionicToast', 'ionicPopups', '$rootScope', 'sql','$ionicPopup', function ($ionicPlatform, $state, $ionicLoading, ionicToast, ionicPopups, $rootScope, sql,$ionicPopup) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
            document.addEventListener('deviceready', function () {

                cordova.getAppVersion.getVersionNumber().then(function (version) {
                    $rootScope.appVersion = version;
                    console.log(version);
                    checkDBHasTables(version);
                },function(error){
                    checkDBHasTables(false);
                });

                $ionicPlatform.registerBackButtonAction(function () {
                   // navigator.app.backHistory();
                    if ( $state.current.name == "app.download" || $state.current.name == "app.orderList" || $state.current.name == "app.reliveryOrderList" || $state.current.name == "app.deliveryScan") {
                        // do something for this state
                        $state.go('app.dashboard');
                    } else {
                        navigator.app.backHistory();
                    }
                }, 100);

                db = window.openDatabase("sqlite", "1.0", "OrderSignature", 2000);

                function checkDBHasTables(version){
                    if(db != null){

                        var applaunchCount = window.localStorage.getItem('isFirstInstallApp' + version);
                        if(version == false){
                            applaunchCount =false;
                        }
                        if (applaunchCount) {
                            //This is a second time launch, and count = applaunchCount
                        } else {
                            //Local storage is not set, hence first time launch. set the local storage item
                            window.localStorage.setItem('isFirstInstallApp' + version, 1);

                            //Do the other stuff related to first time launch
                            db.transaction(function (tx) {
                                tx.executeSql('SELECT * FROM Facilities', [], function (tx, results) { 
                                    var len = results.rows.length; 
                                    if(len > 0){
                                        myDB(version, false);
                                       // confirmDbCreateOrRestorefun(version)
                                    }
                                    else{
                                        myDB(version, false);
                                    }
                                    
                                
                                 }, function(error, t){
                                       console.log(error, t);
                                       myDB(version, false);
                                 }); 
    
                            })
                        }


                      
                    }
                }

                function confirmDbCreateOrRestorefun(version){
                   
                    

                    var confirmDbCreateOrRestore = $ionicPopup.show({
                        title: '<i class="fa fa-exclamation-circle fa-lg" style="color: red !important" aria-hidden="true"></i>',
                        template: 'Restore Previous Database?',
                        scope: $rootScope,
                        cssClass: 'val-popup',
                        buttons: [{
                            text: "Yes",
                            onTap: function () {
                                return true;
                            }
                        }, {
                            text: "No",
                            onTap: function (e) {
                                return false;
                            }
                        }, ]
                    });

                    confirmDbCreateOrRestore.then(function (res) {
                        myDB(version, res);
                    }); 
                }

                function myDB(version, res) {
                    if (db !== null)
                      {
                        db.transaction(function (tx) {
                             if(res == false){
                                tx.executeSql('DROP TABLE IF EXISTS Facilities');
                                tx.executeSql('DROP TABLE IF EXISTS ServiceCenters');
                                tx.executeSql('DROP TABLE IF EXISTS OrderHeader');
                                tx.executeSql('DROP TABLE IF EXISTS ItemDetail');
                                tx.executeSql('DROP TABLE IF EXISTS SignaturesCredential');
                                tx.executeSql('DROP TABLE IF EXISTS checkSync');
                                tx.executeSql('DROP TABLE IF EXISTS log');
                                
                             }

                            tx.executeSql('CREATE TABLE IF NOT EXISTS Facilities(FacilityCode , FacilityName , ServiceCenter, IncludePhones, IsRedeliver)');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS ServiceCenters(CenterCode , CenterName)');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS OrderHeader(DeliveryID ,ResID ,OrderReceipt, Confirmation,isOrdered,FacilityCode,DownloadSeq,isRedeliver,isOrderRedelivered,isCredit,isCreditOnce)');
                            tx.executeSql("CREATE TABLE IF NOT EXISTS ItemDetail(ResID, DeliveryID, FirstName, LastName, Location, OrderSource, ItemNumber , ItemName, OrderQuantity, IsPAK, InReceipts, itemCount, credit, redelivery)");
                            tx.executeSql("CREATE TABLE IF NOT EXISTS SignaturesCredential(FacilityCode)");
                            tx.executeSql("CREATE TABLE IF NOT EXISTS log(API,RequestTime,FacilityCode, DownloadSeq, Request, Response, ResponseTime)");
                            tx.executeSql("CREATE TABLE IF NOT EXISTS checkSync(isSync)");
                            
                            sql.executeSqlQuery('getIsSync', [], function (isSync) {
                                if (isSync.length <= 0)
                                  {
                                    db.transaction(function (tx) {
                                        tx.executeSql("INSERT INTO checkSync VALUES('0')");
                                    });
                                  }
                                  else{
                                    db.transaction(function (tx) {
                                        tx.executeSql("UPDATE checkSync set isSync ='0' ");
                                    });
                                  }
                            });
                        }, function (error) {}, function (res) {});
                      }
                }



            });
            document.addEventListener("offline", function () {
                $ionicLoading.hide();
                ionicPopups.isOnline = false;
                $rootScope.isOnline = ionicPopups.isOnline;
                ionicToast.show('No Internet Connectivity!', 'bottom', false, 3000);
            }, false);

            document.addEventListener("online", function () {
                ionicPopups.isOnline = true;
                $rootScope.isOnline = ionicPopups.isOnline;

            }, false);



        }])
        .run(["$rootScope", "$state", "factory", function ($rootScope, $state, factory) {

            $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
                if (!factory.isAuthenticated) {
                    if (next.name !== 'login') {
                        event.preventDefault();
                        $state.go('login');
                    }
                }

                $rootScope.$broadcast(next.url);
                var host = document.getElementById('main-content-app');
                if (host) {
                    var mainDiv = $("#main-content-app");
                    mainDiv.empty();
                    angular.element(host).empty();
                }
            });
        }])

        .run(["$rootScope", "$ionicLoading", "$timeout", "configConst", "$ionicPopup", function ($rootScope, $ionicLoading, $timeout, configConst, $ionicPopup) {
            var timer;

            $rootScope.$on('responseError', function () {
                $ionicLoading.hide();
                // $ionicPopup.alert({
                //     template: '',
                //     title: 'Request timeout. Please try again.'
                // });
            });
            $rootScope.$on('requestError', function () {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    template: '',
                    title: 'Feature is not accessible. Please contact your administrator.'
                });
            });
        }])

        .config(["$httpProvider", function ($httpProvider) {
            $httpProvider.useApplyAsync(true);
            $httpProvider.interceptors.push(["$rootScope", "$q", function ($rootScope, $q) {
                return {
                    responseError: function (response) {
                        $rootScope.$broadcast('responseError');
                        return response;
                    },
                    requestError: function (response) {
                        $rootScope.$broadcast('requestError');
                        return response;
                    }
                };
            }]);

        }])
        .config(["$compileProvider", function ($compileProvider) {
            var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
        }])

        //=======Timeout========
        .config(["IdleProvider", "KeepaliveProvider", function (IdleProvider, KeepaliveProvider) {
            // configure Idle settings
            IdleProvider.idle(2); // in seconds
            IdleProvider.timeout(1200); // in seconds
            KeepaliveProvider.interval(1); // in seconds
        }]);
})();