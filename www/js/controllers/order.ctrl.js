(function () {
    angular.module('starter.controllers')
    .controller('orderCtrl', ['$scope', 'Constant', '$state', '$ionicLoading', '$ionicPlatform', 'sql', 'factory', 'ionicToast', '$timeout', function ($scope, Constant, $state, $ionicLoading, $ionicPlatform, sql, factory, ionicToast, $timeout) {
        $scope.defaultOrderList = [];

        function getOrderHeaders() {
            $ionicLoading.show({
                template: 'Please wait...'
            });
            sql.executeSqlQuery('getOrderHeaders', [], function (ordersHeader) {
                $scope.$apply(function () {
                    $ionicLoading.hide();
                    ionicToast.show('' + ordersHeader.length + ' Orders found!', 'bottom', false, 2000);
                    $scope.orderList = ordersHeader;
                    $scope.defaultOrderList = ordersHeader;
                    if (factory.orderListSelect == '') {
                        $scope.filterOrderList('All');
                    } else {
                        $scope.filterOrderList(factory.orderListSelect);
                    }
                });
            });
        }


        $scope.filterOrderList = function (str) {
            factory.orderListSelect = str;
            if (str == 'All') {
                $scope.orderList = $scope.defaultOrderList;
            } else {
                $scope.orderList = $scope.defaultOrderList.filter(function (arr) {
                    if (str.length < 2) {
                        if (arr.Location.length < 6)
                            return arr.Location.substring(0, 1) == str;
                    } else {
                        return arr.Location.substring(0, 6) == str;
                    }
                });
            }
        };

        function ordersGroup() {
            sql.executeSqlQuery('getOrderGroup1', [], function (ordersGroup1) {
                sql.executeSqlQuery('getOrderGroup2', [], function (ordersGroup2) {
                    if (ordersGroup2.length > 0)
                        $scope.location = ordersGroup1.concat(ordersGroup2);
                    else
                        $scope.location = ordersGroup1;


                    if (factory.orderListSelect == '') {
                        $scope.locationGroup = 'All';
                        // $scope.filterOrderList('All');
                    } else {
                        $scope.locationGroup = factory.orderListSelect;
                        // $scope.filterOrderList(factory.orderListSelect);
                    }
                });
            });
        }
        
        $scope.$on("$ionicView.enter", function (event, data) {
            factory.menuDashboard=true;
            $scope.locationGroup = 'All';
            if (!factory.isFacilityForOrders) {
                getOrderHeaders();
                ordersGroup();
            } else {
                $scope.$apply(function () {
                    $scope.orderList = factory.ordersByFacility;
                    ordersGroup();
                });
            }
        });

        $("ul.list-unstyled").on("click", ".init", function () {
            $(this).closest("ul.list-unstyled").children('li:not(.init)').toggle();
        });

       
        $("ul.list-unstyled").on("click", "li:not(.init)", function () {
            var allOptions = $("ul.list-unstyled").children('li:not(.init)');
            allOptions.removeClass('selected');
            $(this).addClass('selected');
            $("ul.list-unstyled").children('.init').html($(this).html());
            allOptions.toggle();
        });

        $scope.goToOrderDetails = function (ResID, DeliveryID) {
            console.log(DeliveryID);
            factory.state = 'app.orderList';
            factory.ordDtlbackbtn = 'Order List';
            $state.go('app.orderDetails', {
                'ResID': ResID,
                'DeliveryID': DeliveryID,
                'state': "Order"
            });
        };

        $scope.goToViewOrders = function (ResID, DeliveryID) {
            factory.state = 'app.orderList';
            factory.ordDtlbackbtn = 'Order List';
            $state.go('app.viewOrderDetail', {
                'ResID': ResID,
                'DeliveryID': DeliveryID,
                'state': "Order"
            });
        };

    }]);
})();