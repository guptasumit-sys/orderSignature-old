(function () {
    angular.module('starter.controllers')
    .controller('creditDetailCtrl', ['$scope', '$stateParams', 'sql', '$sce', '$ionicLoading', 'sqlQueries', 'factory', function ($scope, $stateParams, sql, $sce, $ionicLoading, sqlQueries, factory) {

        $scope.$on("$ionicView.enter", function (event, data) {
            factory.menuDashboard=true;
            var resID = $stateParams.ResID;
            var deliveryID = $stateParams.DeliveryID;
            if (db === null) {
                var downlaodData = angular.fromJson(localStorage.getItem('OrderWCredit'));
                $scope.OrderWCredit = $.grep(downlaodData, function (item, key) {
                    return resID == item.ResID;
                })[0];
            } else {
                // $ionicLoading.show({ template: 'Please wait...' });

                db.transaction(function (tx) {
                    tx.executeSql(vsprintf(sqlQueries.getSingleOrderHeader, [resID, deliveryID]), [], function (tx, OrderHeader) {
                        tx.executeSql(vsprintf(sqlQueries.getSingleItemDetail, [resID, deliveryID]), [], function (tx, OrderDetails) {
                            $scope.$apply(function () {
                                factory.dbToJson(OrderHeader, function (orderHeaderItem) {
                                    $scope.orderHeader = orderHeaderItem[0];
                                    $scope.image = $scope.orderHeader.Confirmation;
                                });
                                factory.dbToJson(OrderDetails, function (OrderDetailsItem) {
                                    $scope.itemDetails = OrderDetailsItem;
                                });

                            });
                        });
                    });
                });
            }

        });


    }]);
})();