(function () {
    angular.module('starter.controllers')
.controller('creditCtrl', ['$scope', 'sql', '$ionicLoading', 'factory', 'sqlQueries', '$state', 'ionicToast', function ($scope, sql, $ionicLoading, factory, sqlQueries, $state, ionicToast) {
    $scope.$on("$ionicView.enter", function (event, data) {
        factory.menuDashboard=true;
        // $ionicLoading.show({ template: 'Please wait...' });
        if (!factory.isFacilityForOrders) {
            sql.executeSqlQuery('getCreditList', [], function (creditHeader) {
                if (creditHeader.length<=0) {
                    $state.go('app.dashboard');
                    ionicToast.show('Credit list is not found.', 'bottom', false, 3000);
                }
                else {
                    $scope.creditList = creditHeader;
                
                // 
                    localStorage.setItem('OrderWCredit', creditHeader);
                }
            });
        }
        else {
            $scope.creditList = factory.creditList;
            // if (factory.FacilityCode)
            //     db.transaction(function (tx) {
            //         tx.executeSql(vsprintf(sqlQueries.getCreditListByFacility, [factory.FacilityCode]), [], function (tx, results) {
            //             factory.dbToJson(results, function (creditList) {
            //                 $scope.creditList = creditList;
            //                 if ($scope.creditList.length <= 0) {
            //                     $state.go('app.dashboard');
            //                     ionicToast.show('Credit list is not found for selected facility.', 'bottom', false, 3000);
            //                 }
            //                 $ionicLoading.hide();
            //             });

            //         }, function (tx, error) {

            //         });
            //     });

        }
    });
}]);
})();