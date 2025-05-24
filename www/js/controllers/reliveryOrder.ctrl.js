(function () {
    angular.module('starter.controllers')
    .controller('reliveryOrderCtrl', ['$scope', '$state', '$ionicLoading', '$ionicPlatform', 'sql', 'factory', 'ionicToast', '$timeout', function ($scope, $state, $ionicLoading, $ionicPlatform, sql, factory, ionicToast, $timeout) {

        function getOrderHeaders() {
            sql.executeSqlQuery('getRDOrderHeaders', [], function (ordersHeader) {
                $scope.$apply(function () {
                    ionicToast.show('' + ordersHeader.length + ' Re-Deliver Orders found!', 'bottom', false, 2000);
                    $scope.orderList = ordersHeader;
                    console.log("Data", $scope.orderList);
                });
            });
        }

        $scope.$on("$ionicView.enter", function (event, data) {
            // if (!factory.isFacilityForOrders) {
            getOrderHeaders();
            // } else {
            //     $scope.$apply(function () {
            //         $scope.orderList = factory.ordersByFacility;
            //     });
            // }
            factory.menuDashboard=true;
        });

        $scope.goToOrderDetails = function (ResID, DeliveryID) {
            factory.state = 'app.reliveryOrderList';
            factory.ordDtlbackbtn = 'Re-Deliver Order List';
            $state.go('app.orderDetails', {
                'ResID': ResID,
                'DeliveryID': DeliveryID,
                'prevState': "ReOrder"
            });
        };

        $scope.goToViewOrders = function (ResID, DeliveryID) {
            factory.state = 'app.reliveryOrderList';
            factory.ordDtlbackbtn = 'Re-Deliver Order List';
            $state.go('app.viewOrderDetail', {
                'ResID': ResID,
                'DeliveryID': DeliveryID,
                'prevState': "ReOrder"
            });
        };


    }]);
})();