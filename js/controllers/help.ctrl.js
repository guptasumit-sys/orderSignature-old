(function () {
    angular.module('starter.controllers')
    .controller('helpCtrl', ['$scope', '$state', 'factory', function ($scope, $state, factory) {

        $scope.$on("$ionicView.enter", function (event, data) {
            factory.menuDashboard=true;
            var date = new Date();
            var index = 0;
            $scope.nextbtn = true;
            $scope.prevbtn = false;
            $scope.gotItbtn = false;
            $scope.currentYear = date.getFullYear();

            var tourImages = [
                'img/help/dashboard.png',
                'img/help/download.png',
                'img/help/deliveryScan.png',
                'img/help/order-list.png',
                // 'img/help/redeliver-list.png',
                // 'img/help/credit-list.png',
                'img/help/order-details.png',
                'img/help/resident-signature.png'
            ];
            $scope.image = tourImages[index];
            $scope.next = function () {
                index = index + 1;
                $scope.prevbtn = true;
                if (index < tourImages.length) {
                    $scope.image = tourImages[index];
                    if (index === tourImages.length - 1) {
                        $scope.nextbtn = false;
                        $scope.prevbtn = true;
                        $scope.gotItbtn = true;
                    }
                } else {
                    index = index - 1;
                }
            };
            $scope.prev = function () {
                index = index - 1;
                $scope.nextbtn = true;
                $scope.gotItbtn = false;
                if (index >= 0) {
                    $scope.image = tourImages[index];
                    if (index === 0) {
                        $scope.nextbtn = true;
                        $scope.prevbtn = false;
                        $scope.gotItbtn = false;
                    }
                } else {

                    index = index + 1;
                }
            };
            $scope.goToLog = function () {
                $state.go('app.log');
            };


        });


    }]);
})();