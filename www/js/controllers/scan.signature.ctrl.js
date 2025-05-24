(function () {
    angular.module('starter.controllers')
        .controller("scanCtrl", ['$scope','$state', '$timeout', 'Constant', '$rootScope', 'ionicPopups', 'sql', 'ionicToast', 'factory', '$ionicLoading', 'sqlQueries',
         function ($scope, $state, $timeout, Constant, $rootScope, ionicPopups, sql, ionicToast, factory, $ionicLoading, sqlQueries) {

            // $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //      $timeout(function () {
            //     //     if (angular.element(document.querySelectorAll('#orderScan'))[0])
            //     //         angular.element(document.querySelectorAll('#orderScan'))[0].focus();
            //     document.getElementById('orderScan').reset();
            //      }, 300);

            // });
            
            
            $scope.$on('$ionicView.enter', function(){

                $scope.setfocus();



                factory.menuDashboard=true;
            });
            $scope.$on('$ionicView.leave', function(){
                $scope.setfocus();
            });
           
            $scope.setfocus = function () {
               
                setTimeout(function(){ 
                    var elm =document.getElementById('orderScan');
                    elm.focus();
                }, 10);
               
                // angular.element(document.querySelectorAll('#orderScan'))[0].focus();
            };
            $scope.setfocus();
          
            $scope.getOrder = function ( IsCancel) { //cancel is flag, true->residentSign, false->app.orderDetails
                // deliveryId = deliveryId.toUpperCase();
                 delvrID = document.getElementById('orderScan').value;
                 delvrID = delvrID !=""? delvrID.toUpperCase():"";
                 if (IsCancel){
                    $state.go('app.dashboard');
                 }else if(delvrID==""){
                    $state.go('app.dashboard');
                 } else {
                     getOrdersScan(delvrID);
                 }
                  $scope.setfocus();
             };

            function getOrdersScan(deliveryId) {

                // if (deliveryId.length < 4) {
                //     // ionicToast.show('Please enter orderId.', 'bottom', false, 3000);
                //     return;
                // }

                if (!deliveryId) {
                    ionicToast.show('Please enter order Receipt.', 'bottom', false, 3000);
                    return;
                }
                if (deliveryId.length < 1) {
                    ionicToast.show('Order Receipt should be 5 digits.', 'bottom', false, 3000);
                    return;
                }
                
               deliveryId = deliveryId.replaceAll('.', '');

                if (db !== null) {
                    // $ionicLoading.show({ template: 'Please wait...' });
                    if (!factory.isFacilityForOrders) {

                        $ionicLoading.show({
                            template: 'Please wait...'
                        });

                        //NewChanginV2
                        db.transaction(function (tx) {
                            tx.executeSql(sqlQueries.singleOrdrHdrWithItemCountNew, [deliveryId], function (tx, ordersHeader) {
                                $scope.$apply(function () {
                                    factory.dbToJson(ordersHeader, function (orderHeaderItem) {
                                        if (orderHeaderItem.length > 0) {
                                            document.getElementById('orderScan').blur();
                                            $ionicLoading.hide();
                                            factory.state = 'app.deliveryScan';
                                            factory.ordDtlbackbtn = 'Scan';
                                            document.getElementById('orderScan').value = "";
                                            $timeout(function () {
                                                $state.go('app.orderDetails', {
                                                    ResID: orderHeaderItem[0].ResID,
                                                    DeliveryID: orderHeaderItem[0].DeliveryID,
                                                    ScanID: deliveryId
                                                });
                                            }, 300);

                                        } else {
                                            $ionicLoading.hide();
                                            ionicToast.show('Order not found.', 'bottom', false, 3000);
                                            $scope.orderId = null;
                                            document.getElementById('orderScan').value = "";
                                            document.getElementById('orderScan').focus();
                                        }
                                        // $ionicLoading.hide();
                                    });


                                });
                            });
                        });
                    } else {
                        if (factory.FacilityCode)
                            db.transaction(function (tx) {
                                tx.executeSql(vsprintf(sqlQueries.checkOrdrByFacility, [factory.FacilityCode, orderID]), [], function (tx, results) {
                                    factory.dbToJson(results, function (ordersHeader) {
                                        if (ordersHeader.length > 0) {
                                            factory.state = 'app.deliveryScan';
                                            $state.go('app.orderDetails', {
                                                ResID: ordersHeader[0].ResID
                                            });
                                        } else {
                                            ionicToast.show('Order not found for selected facility.', 'bottom', false, 3000);
                                        }

                                    });
                                    // $ionicLoading.hide();
                                }, function (tx, error) {
                                    // ionicToast.show('Order processing failed!. Please retry.', 'bottom', false, 3000);
                                });
                            });

                    }
                } else {
                    var downlaodData = angular.fromJson(localStorage.getItem('downloadOrder'));
                    if (downlaodData) {
                        var ordersHeader = downlaodData.OrderHeader.filter(function (e) {
                            return e.OrderID.toUpperCase() === orderID;
                        });
                        if (ordersHeader.length > 0) {
                            $state.go('app.orderDetails', {
                                ResID: ordersHeader[0].ResID
                            });
                        } else {
                            ionicToast.show('Order not found.', 'bottom', false, 3000);
                            return;
                        }
                    }

                }
            }



        }])
        .directive('myEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if(event.which === 13) {
                        scope.$apply(function (){
                            //alert("Return Key");
                            scope.$eval(attrs.myEnter);
                        });
        
                        event.preventDefault();
                    }
                });
            };
        });        
})();