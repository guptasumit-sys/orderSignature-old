(function () {
    angular.module('starter.controllers')
    .controller('residentSignCtrl', ['$scope', '$stateParams', '$rootScope', 'ionicPopups', '$state', 'sqlQueries', 'ionicToast', 'factory', 'sql', '$q', function ($scope, $stateParams, $rootScope, ionicPopups, $state, sqlQueries, ionicToast, factory, sql, $q) {



        var wrapper = document.getElementById("signature-pad"),
            canvas = wrapper.querySelector("canvas");
        // var heightWidthRation = 1.8;
        // var offsetWidth = canvas.offsetWidth - 50;
        // var offsetHeight = canvas.offsetHeight - (heightWidthRation * 50)
        var signaturePad;
        $scope.signPad = function (color) {
            signaturePad = new SignaturePad(canvas, {
                minWidth: 2.5,
                maxWidth: 4.0,
                penColor: color
            });
            $scope.pencilColor = color;
        };
        $scope.signPad('rgb(0, 0, 0)');

        var flag = true;

        function resizeCanvas() {
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            var heignt = canvas.offsetHeight * ratio;
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = heignt;
            canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.clear(); // otherwise isEmpty() might return incorrect value 
        }

        function ratioHeightWidth(height, width, flag) {
            if (height > width) {
                return (height / width) * flag;
            } else
                return (width / height) * flag;
        }

        window.onresize = resizeCanvas;
        resizeCanvas();

        $scope.clearCanvas = function () {
            signaturePad.clear();
        };

        $rootScope.$on("$stateChangeSuccess", function () {
            signaturePad.clear();
        });


        function imageToDataUri(img, width, height) {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');
            // canvas.width = width;
            // canvas.height = height;OrderID
            ctx.drawImage(img, 0, 0);


        }
        var data = {};

        $scope.ResID = $stateParams.ResID;
        $scope.DeliveryID = $stateParams.DeliveryID;
        $scope.sumRedelivery = $stateParams.sumRedelivery;
        $scope.sumCredit = $stateParams.sumCredit;
        $scope.orderReceipt = $stateParams.orderReceipt;

        $scope.saveSignatures = function () {

            function resizebase64Img() {
                var deferred = $q.defer();
                var originalSignature = signaturePad.toDataURL(); //.split(',')[1];
                var img = new Image();
                img.src = originalSignature;
                img.onload = function () {
                    var wrapper = document.getElementById("signature-pad");
                    var canvasOrg = wrapper.querySelector("canvas");
                    var canvasNew = document.createElement('canvas');
                    var ctx = canvasNew.getContext('2d');
                    canvasNew.width = ratioHeightWidth(canvasOrg.offsetHeight, canvasOrg.width, 120);
                    canvasNew.height = 120;
                    ctx.drawImage(img, 0, 0, canvasNew.width, 120);
                    var url = canvasNew.toDataURL();
                    var blankCanvas = document.getElementById("blank");
                    blankCanvas.width = ratioHeightWidth(canvasOrg.offsetHeight, canvasOrg.width, 120);
                    blankCanvas.height = 120;
                    var urlBlank = blankCanvas.toDataURL();

                    if (url == urlBlank) {
                        ionicToast.show('Please sign first!', 'bottom', false, 3000);
                    } else {
                        console.log(url);
                        deferred.resolve(url);
                    }
                };
                return deferred.promise;
            }

            if (db === null) {
                console.log('Browser');
                resizebase64Img().then(function (resizedImg) {
                    var d = resizedImg;
                });
            } else {
                setCredit();
                setRedelivery();
                var isZeroCredit = 0;
                var isZeroRedelivery = 0;
                var isOrderRedelivered;
                var isOrdered;
                var isCredit;
                var isCreditOnce;
                var isRedeliver;

                for (var i = 0; i < ionicPopups.creditList.length; i++) {
                    isZeroCredit = isZeroCredit + Number(ionicPopups.creditList[i].credit);
                }

                for (var j = 0; j < ionicPopups.redeliveryList.length; j++) {
                    isZeroRedelivery = isZeroRedelivery + Number(ionicPopups.redeliveryList[j].redelivery);
                    //ionicToast.show('Please sign first!'+isZeroRedelivery+' '+ionicPopups.redeliveryList[j].deliveryID, 'bottom', false, 3000);
                }


                if (isZeroCredit > 0) {
                    //isOrdered = ionicPopups.creditList.length > 0 ? 2 : 1;

                    isCreditOnce = 1;
                    // isOrdered = 2;
                }
                // else{
                //     // isOrdered = 2;
                //     isOrdered = 1;
                // }

                console.log("sumRedelivery", $scope.sumRedelivery);

                //var isOrderRedelivered  = ionicPopups.redeliveryList.length > 0 ? 1 : 0;
                if (isZeroRedelivery > 0) {
                    isOrderRedelivered = ionicPopups.redeliveryList.length > 0 ? 2 : 1;
                } else {
                    isOrderRedelivered = 1;
                }

                if ($scope.sumRedelivery > 0) {
                    isRedeliver = 1;
                } else {
                    isRedeliver = 0;
                }

                if ($scope.sumCredit > 0) {
                    isCredit = 1;
                    isOrdered = 2;
                } else {
                    isCredit = 0;
                    isOrdered = 1;
                }

                factory.creditListCancelSignature = [];
                factory.popupsCredit = [];
                var Confirmation = '';
                resizebase64Img().then(function (resizedImg) {
                    Confirmation = resizedImg.split(',')[1];
                    db.transaction(function (tx) {
                        if (!isCreditOnce) {
                            tx.executeSql(vsprintf(sqlQueries.updateOrders, [Confirmation, isOrdered, isOrderRedelivered, isRedeliver, isCredit, $scope.ResID, $scope.DeliveryID]), [], function (tx, results) {
                                ionicToast.show('Order processed.', 'bottom', false, 3000);
                                checkOrderForFacility(factory.state);
                                //$state.go("appSign.residentSign", null, {reload:true});
                                // $state.go(factory.state);
                            }, function (tx, error) {
                                ionicToast.show('Order processing failed!. Please retry.', 'bottom', false, 3000);
                            });
                        } else {
                            tx.executeSql(vsprintf(sqlQueries.updateOrdersWithOnceCredit, [Confirmation, isOrdered, isOrderRedelivered, isRedeliver, isCredit, isCreditOnce, $scope.ResID, $scope.DeliveryID]), [], function (tx, results) {
                                ionicToast.show('Order processed.', 'bottom', false, 3000);
                                checkOrderForFacility(factory.state);
                                //$state.go("appSign.residentSign", null, {reload:true});
                                // $state.go(factory.state);
                            }, function (tx, error) {
                                ionicToast.show('Order processing failed!. Please retry.', 'bottom', false, 3000);
                            });
                        }

                    });
                });

            }
        };




        function setCredit() {
            if (db !== null) {
                db.transaction(function (tx) {
                    for (var j = 0; j < ionicPopups.creditList.length; j++) {
                        tx.executeSql(vsprintf(sqlQueries.updateCredit, [ionicPopups.creditList[j].credit, ionicPopups.creditList[j].resID, ionicPopups.creditList[j].deliveryID, ionicPopups.creditList[j].itemNumber]), [], function (tx, results) {
                            // if (results.rowsAffected > 0)
                            //     ionicToast.show('Credit updated successfully.', 'bottom', false, 3000);
                            // else
                            //     ionicToast.show('Credit updated failed!. Please retry.', 'bottom', false, 3000);
                        }, function (tx, error) {
                            //  ionicToast.show('Credit updated failed!. Please retry.', 'bottom', false, 3000);
                        });
                    }
                });


            }
        }


        function setRedelivery() {
            if (db !== null) {
                db.transaction(function (tx) {
                    for (var j = 0; j < ionicPopups.redeliveryList.length; j++) {
                        tx.executeSql(vsprintf(sqlQueries.updateRedelivery, [ionicPopups.redeliveryList[j].redelivery, ionicPopups.redeliveryList[j].resID, ionicPopups.redeliveryList[j].deliveryID, ionicPopups.redeliveryList[j].itemNumber]), [], function (tx, results) {
                            // if (results.rowsAffected > 0)
                            //     ionicToast.show('Credit updated successfully.', 'bottom', false, 3000);
                            // else
                            //     ionicToast.show('Credit updated failed!. Please retry.', 'bottom', false, 3000);
                        }, function (tx, error) {
                            //  ionicToast.show('Credit updated failed!. Please retry.', 'bottom', false, 3000);
                        });
                    }
                });
            }
        }



        function checkOrderForFacility(state) {
            if (factory.isFacilityForOrders) {
                if (factory.FacilityCode) {
                    db.transaction(function (tx) {
                        tx.executeSql(vsprintf(sqlQueries.getOrderHeadersByFacility, [factory.FacilityCode]), [], function (tx, results) {
                            factory.dbToJson(results, function (orders) {
                                if (orders.length <= 0) {
                                    ionicToast.show('Orders is not found for selected facility.', 'bottom', false, 3000);
                                    return;
                                } else {
                                    factory.ordersByFacility = orders;
                                    $state.go(state);
                                }

                            });
                        }, function (tx, error) {

                        });
                    });
                } else
                    $state.go(state);
            } else
                $state.go(state);
        }

        $scope.goToOrderDetails = function (ResID, DeliveryID) {
            $state.go('app.orderDetails', {
                'ResID': ResID,
                'DeliveryID': DeliveryID
            }, {
                inherit: false
            });
        };

        $scope.$on("$ionicView.enter", function (event, data) {
            factory.menuDashboard=true;
        });

    }]);
})();