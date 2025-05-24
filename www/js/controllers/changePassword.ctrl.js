(function () {
    angular.module('starter.controllers')

    .controller('changePasswordCtrl', ['$scope', 'Constant', '$state', '$ionicLoading', 'factory', 'ionicToast', 'service', function ($scope, Constant, $state, $ionicLoading, factory, ionicToast, service) {
        $scope.$on("$ionicView.enter", function (event, data) {
            factory.menuDashboard=true;
            $scope.changPssObj = {};
            //document.getElementById("passwordChangeForm").reset();
            //$scope.ChangePass_form.setPristine();
            var loginRes = angular.fromJson(localStorage.getItem("loginRespons"));
            $scope.username = localStorage.getItem('LoginDetails');
            $scope.updatePassword = function (data, username) {
                data.UserName = username;
                data.Token = loginRes.Token;
                if (!data.OldPassword) {
                    ionicToast.show('Enter old password.', 'bottom', false, 3000);
                    return;
                }
                if (!data.NewPassword) {
                    ionicToast.show('Enter new password.', 'bottom', false, 3000);
                    return;
                }
                if (!data.CnfPassword) {
                    ionicToast.show('Enter confirm password.', 'bottom', false, 3000);
                    return;
                }
                if (data.OldPassword === data.NewPassword) {
                    ionicToast.show('This is old password. Enter new password.', 'bottom', false, 3000);
                    return;
                }
                if (data.NewPassword.length < 6 || data.NewPassword.length > 15) {
                    ionicToast.show('Password must be between 6 to 15 Characters', 'bottom', false, 3000);
                    return;
                }

                if (data.NewPassword === data.CnfPassword) {
                    console.log(data);
                    service.changePassword(data).then(function (response) {
                        $ionicLoading.show({
                            template: 'Please wait...'
                        });

                        if (response.status == 200) {
                            $ionicLoading.hide();
                            setTimeout(function () {
                                $state.go("login");
                            }, 3000);
                            ionicToast.show("Password Changed Successfully.", 'bottom', false, 3000);
                            // $state.go("app.dashboard");
                            localStorage.removeItem("loginRespons");
                        } else {
                            $ionicLoading.hide();
                            setTimeout(function () {
                                $state.go("login");
                            }, 3000);
                            ionicToast.show(response.data, 'bottom', false, 3000);
                        }
                    });
                } else {
                    $ionicLoading.hide();
                    ionicToast.show('Confirm password did not match.', 'bottom', false, 3000);
                }
            };
        });

    }]);
})();