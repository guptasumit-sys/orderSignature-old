
(function () {
    angular.module('application.Services', [])
        .service('service', ['$http', 'factory', 'ionicPopups', '$q', function ($http, factory, ionicPopups, $q) {

            this.login = function (user) {
              //  factory.serviceUrl = user.ApiUrl;
                return $http({
                    method: "GET",
                     url: factory.serviceUrl + "Login?userName=" + user.username + "&password=" + user.password,
                   // url: user.ApiUrl + "Login?userName=" + user.username + "&password=" + user.password,
                    crossDomain: true
                })
                    .success(function (response) {
                        factory.isAuthenticated = true;
                        //console.log(response);
                    })
                    .error(function (error) {
                        factory.isAuthenticated = false;
                        ionicPopups.ionicPopup("API URL, User or Password is wrong!");
                        console.log(error);
                    });
            };

            var canceller = $q.defer();

            this.cancel = function () {
                canceller.resolve("user cancelled");
            };

            // this.downloadOrders = function (data) {

            this.downloadOrders = function (data) {
                //    return $http.post(factory.serviceUrl + "DownloadOrders", data, { timeout: canceller.promise })
                //         .then(function (response) {
                //            // alert();
                //             //$scope.movie = response.data;
                //         });

                return $http({
                    method: "POST",
                    url: factory.serviceUrl + "DownloadOrders",
                    data: data,
                    headers: { 'Content-Type': 'application/json' },
                    crossDomain: true,
                    // timeout: canceller.promise
                })
                    .success(function (response) {
                        //  console.log('download', response);
                    })
                    .error(function (error) {
                        console.log(error);
                    });
            };

            this.deliverySignatures = function (data) {
                console.log('signatureRequest', angular.toJson(data));
                return $http({
                    method: "POST",
                    url: factory.serviceUrl + "StoreDeliverySignatures",
                    data: data,
                    headers: { 'Content-Type': 'application/json' },
                    crossDomain: true
                })
                    .success(function (response) {
                        console.log('signatureResponse', angular.toJson(response));
                    })
                    .error(function (error) {
                        console.log(error);
                    });
            };

            this.storeDeliveryCredits = function (data) {
                console.log('CreditsRequest', angular.toJson(data));
                return $http({
                    method: "POST",
                    url: factory.serviceUrl + "StoreDeliveryCredits",
                    data: data,
                    headers: { 'Content-Type': 'application/json' },
                    crossDomain: true
                })
                    .success(function (response) {
                        console.log('CreditsReponse', angular.toJson(response));
                    })
                    .error(function (error) {
                        console.log(error);
                    });
            };


            this.storeDeliveryRedelivers = function (data) {
                console.log('RedeliversRequest', angular.toJson(data));
                return $http({
                    method: "POST",
                    url: factory.serviceUrl + "StoreDeliveryRedelivers",
                    data: data,
                    headers: { 'Content-Type': 'application/json' },
                    crossDomain: true
                })
                    .success(function (response) {
                        console.log('CreditsReponse', angular.toJson(response));
                    })
                    .error(function (error) {
                        console.log(error);
                    });
            };


            this.changePassword = function (data) {
                return $http({
                    method: "POST",
                    url: factory.serviceUrl + "ChangePassword",
                    data: data,
                    headers: { 'Content-Type': 'application/json' },
                    crossDomain: true
                })
                    .success(function (response) {
                        console.log('CreditsReponse', angular.toJson(response));
                    })
                    .error(function (error) {
                        console.log(error);
                    });
            };
        }]);
})();