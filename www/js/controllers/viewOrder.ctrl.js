(function () {
    angular.module('starter.controllers')
    .controller('viewOrderCtrl', ['$scope', '$stateParams', 'sql', '$sce', '$ionicLoading', 'sqlQueries', 'factory', '$filter', '$state', function ($scope, $stateParams, sql, $sce, $ionicLoading, sqlQueries, factory, $filter, $state) {

        $scope.$on("$ionicView.enter", function (event, data) {
            factory.menuDashboard=true;
            var resID = $stateParams.ResID;
            var DeliveryID = $stateParams.DeliveryID;
            

            $scope.btnText = factory.ordDtlbackbtn;

            

            $scope.isGoToOrderList = function () {
                $state.go(factory.state);
            };

            if (db === null) {
                

            } else {
                // $ionicLoading.show({ template: 'Please wait...' });
                // db.transaction(function (tx) {
                //     tx.executeSql(vsprintf(sqlQueries.getSingleOrderHeader, [resID, deliveryID]), [], function (tx, OrderHeader) {
                //         tx.executeSql(vsprintf(sqlQueries.getSingleItemDetail, [resID, deliveryID]), [], function (tx, OrderDetails) {
                //             $scope.$apply(function () {

                //                 factory.dbToJson(OrderDetails, function (OrderDetailsItem) {
                //                     factory.dbToJson(OrderHeader, function (orderHeaderItem) {
                //                         $scope.orderHeader = orderHeaderItem[0];
                //                         $scope.image = $scope.orderHeader.Confirmation;
                //                     });
                //                     $scope.itemDetails = $filter('orderBy')(OrderDetailsItem, 'OrderQuantity', true);
                //                 });

                //             });
                //         });
                //     });
                // });

                db.transaction(function (tx) {
                    tx.executeSql(vsprintf(sqlQueries.getSingleOrderHeader, [resID, DeliveryID]), [], function (tx, OrderHeader) {
                        
                        tx.executeSql(vsprintf(sqlQueries.getSingleItemDetail, [resID, DeliveryID]), [], function (tx, OrderDetails) {
                            $scope.$apply(function () {
                                factory.dbToJson(OrderHeader, function (orderHeaderItem) {
                                    $scope.orderHeaders = orderHeaderItem;
                                    $scope.orderHeader = $scope.orderHeaders[0];
                                    $scope.image = $scope.orderHeader.Confirmation;
                                  
                                });
                                factory.dbToJson(OrderDetails, function (OrderDetailsItem) {
                                    $scope.itemDetails = $filter('orderBy')(OrderDetailsItem, 'OrderQuantity', true);
                                    console.log("itemDetails", $scope.itemDetails);


                                });
                            });
                        });
                    });
                });


            }

        });


    }]);

})();