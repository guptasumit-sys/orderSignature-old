(function () {
    angular.module('starter.controllers')
        .controller('orderDetailsCtrl', ['$scope', '$stateParams', '$rootScope', '$ionicPlatform', 'sql', 'sqlQueries', 'ionicPopups', 'ionicToast', 'factory', '$state', '$filter', '$ionicPopup', '$ionicHistory', function ($scope, $stateParams, $ionicPlatform, $rootScope, sql, sqlQueries, ionicPopups, ionicToast, factory, $state, $filter, $ionicPopup, $ionicHistory) {

            $scope.$on("$ionicView.beforeEnter", function (event, data) {
                // var resID = parseInt($stateParams.ResID); // ResID for particular order.
                $scope.btnText = factory.ordDtlbackbtn;
                $scope.flagPopup1 = false;
                $scope.flagPopup2 = false;
                $scope.sign = false;
                $scope.fl = 1;

                $scope.isGoToOrderList = function () {
                    $state.go(factory.state);
                };

                $scope.goToSignature = function (ResID, OrderID) {
                    $scope.sign = true;
                    $scope.flagPopup1 = true;
                    var sumRedelivery = 0;
                    var sumCredit = 0;

                    for (var j = 0; j < $scope.itemDetails.length; j++) {
                        sumRedelivery = sumRedelivery + Number($scope.itemDetails[j].redelivery);
                    }

                    for (var k = 0; k < $scope.itemDetails.length; k++) {
                        sumCredit = sumCredit + Number($scope.itemDetails[k].credit);
                    }

                    factory.creditListCancelSignature = $scope.itemDetails.slice();
                    factory.popupsCredit = ionicPopups.creditList.slice();

                    $state.go('appSign.residentSign', {
                        'ResID': ResID,
                        'DeliveryID': DeliveryID,
                        'sumRedelivery': sumRedelivery,
                        'sumCredit': sumCredit,
                        'orderReceipt': $scope.orderHeader.OrderReceipt
                    }, {
                        inherit: false
                    });

                };

                var resID = $stateParams.ResID;
                var DeliveryID = $stateParams.DeliveryID;
                var ScanID= $stateParams.ScanID;
                $scope.ScannedID=$stateParams.ScanID;

                $scope.isMultipleResiden = false;
                $scope.selecteOrderID = function (selectedOrder) {
                    $scope.orderHeader = $.grep($scope.orderHeaders, function (item, key) {
                        return selectedOrder == item.OrderID;
                    })[0];
                };
                if (db === null) {
                    var downlaodData = angular.fromJson(localStorage.getItem('downloadOrder'));
                    $scope.orderList = downlaodData.OrderHeader;

                    $scope.orderHeaders = $.grep(downlaodData.OrderHeader, function (item, key) {
                        return resID == item.ResID;
                    });
                    $scope.orderHeader = $scope.orderHeaders[0];
                    //$scope.isMultipleResiden = $scope.orderHeaders.length > 1 ? true : false;
                    $scope.itemDetails = $.grep(downlaodData.OrderDetails, function (item, key) {
                        return resID == item.ResID;
                    })[0].Items;

                } else {
                    db.transaction(function (tx) {
                        tx.executeSql(vsprintf(sqlQueries.getSingleOrderHeader, [resID, DeliveryID]), [], function (tx, OrderHeader) {
                            tx.executeSql(vsprintf(sqlQueries.getSingleItemDetail, [resID, DeliveryID]), [], function (tx, OrderDetails) {
                                $scope.$apply(function () {
                                    factory.dbToJson(OrderHeader, function (orderHeaderItem) {
                                        $scope.orderHeaders = orderHeaderItem;
                                        $scope.btnRedeliveryDisabled = false;
                                        $scope.orderHeader = $scope.orderHeaders[0];
                                        $scope.isOrderedCredit = $scope.orderHeaders[0].isOrdered;
                                        $scope.isOrderedRedeliver = $scope.orderHeaders[0].isOrderRedelivered;
                                        $scope.checkRedeliver = ($scope.isOrderedCredit == '0' && $scope.orderHeaders[0].isRedeliver == '1') ? true : false;
                                        $scope.isMultipleResiden = orderHeaderItem.length > 1 ? true : false;

                                        if ($scope.isOrderedCredit > 0 || $scope.isOrderedRedeliver == 2) {
                                            $scope.btnCreditDisabled = true;
                                            $scope.btnRedeliverDisabled = true;
                                            $scope.btnSignatureDisabled = true;
                                        } else {
                                            $scope.btnCreditDisabled = false;
                                            $scope.btnRedeliverDisabled = false;
                                            $scope.btnSignatureDisabled = false;
                                        }
                                    });
                                    factory.dbToJson(OrderDetails, function (OrderDetailsItem) {
                                        $scope.itemDetails = $filter('orderBy')(OrderDetailsItem, 'OrderQuantity', true);
                                        console.log("itemDetails", $scope.itemDetails);


                                        if ($scope.isOrderedCredit == 2) {
                                            for (var p = 0; p < $scope.itemDetails.length; p++) {
                                                if ($scope.itemDetails[p].credit == 0) {
                                                    $scope.itemDetails[p].creditDropdownDisable = true;
                                                } else if ($scope.itemDetails[p].OrderSource == 'MCP') {
                                                    $scope.itemDetails[p].creditDropdownDisable = true;
                                                    $scope.btnCreditDisabled = true;
                                                } else {
                                                    $scope.itemDetails[p].creditDropdownDisable = false;
                                                }
                                            }
                                        } else {
                                            if (factory.creditListCancelSignature.length > 0) {
                                                $scope.itemDetails = factory.creditListCancelSignature.slice();
                                            }
                                            var c = 0;
                                            for (var q = 0; q < $scope.itemDetails.length; q++) {
                                                if ($scope.itemDetails[q].ItemNumber == '7001' || $scope.itemDetails[q].ItemNumber == '7002' || $scope.itemDetails[q].ItemNumber == '7050' || ($scope.itemDetails[q].ItemNumber >= '9800' && $scope.itemDetails[q].ItemNumber <= '9899') || $scope.itemDetails[q].OrderSource == 'MCP') {
                                                    c++;
                                                    $scope.itemDetails[q].creditDropdownDisable = true;
                                                    if (c == $scope.itemDetails.length) {
                                                        $scope.btnCreditDisabled = true;
                                                    }
                                                } else {
                                                    $scope.itemDetails[q].creditDropdownDisable = false;
                                                }

                                            }
                                        }


                                        //NewChanginV2
                                        var rgfg = 0;
                                            for (var q2 = 0; q2 < $scope.itemDetails.length; q2++) {
                                                if ($scope.itemDetails[q2].ItemNumber == '7001' || $scope.itemDetails[q2].ItemNumber == '7002' || $scope.itemDetails[q2].ItemNumber == '7050') {
                                                    rgfg++;
                                                    $scope.itemDetails[q2].redeliveryDropdownDisable = true;
                                                    if (rgfg == $scope.itemDetails.length) {
                                                        $scope.btnRedeliveryDisabled = true;
                                                    }
                                                } else {
                                                    $scope.itemDetails[q2].redeliveryDropdownDisable = false;
                                                }

                                            }

                                    });
                                });
                            });
                        });
                    });
                }

                var ConfirmPopup;

                var confirmPopupFunction = function () {

                    ConfirmPopup = $ionicPopup.show({
                        title: '<i class="fa fa-exclamation-circle fa-lg" style="color: red !important" aria-hidden="true"></i>',
                        template: 'Credits will be lost if the resident’s signature is not obtained.',
                        scope: $scope,
                        cssClass: 'val-popup',
                        buttons: [{
                            text: "Ok",
                            onTap: function (e) {
                                return false;
                            }
                        }, {
                            text: "Cancel",
                            onTap: function (e) {
                                return true;
                            }
                        }, ]
                    });

                    ConfirmPopup.then(function (res) {
                        if (res) {
                            ConfirmPopup.close();
                            $scope.flagPopup1 = true;
                            $scope.goToSignature($stateParams.ResID, $stateParams.DeliveryID);
                        } else {
                            ConfirmPopup.close();
                            $scope.flagPopup1 = true;
                            factory.creditListCancelSignature = [];
                            factory.popupsCredit = [];
                            ionicPopups.creditList = [];
                            $scope.isGoToOrderList();
                        }
                    });
                };

                function creditCheck() {
                    var sumCredit = 0;
                    var ionicCreditBool = false;
                    console.log(ionicPopups.creditList);
                    for (var i = 0; i < ionicPopups.creditList.length; i++) {
                        sumCredit = sumCredit + ionicPopups.creditList[i].credit;
                    }
                    if (sumCredit > 0) {
                        ionicCreditBool = true;
                    }

                    return ionicCreditBool;
                }



                $scope.$on("$stateChangeStart", function (event) {
                    console.log("hello.....", event);
                    if(!$scope.btnSignatureDisabled){
                    var ionicCredit = creditCheck();
                    if (ionicCredit && $scope.flagPopup1 == false && $scope.sign == false) {
                        event.preventDefault();
                        console.log("hello. ConfirmPopup....");
                        if ($scope.fl == 1) {
                                confirmPopupFunction();
                            $scope.fl = 2;
                        }
                    }
                }
                });


                $scope.array = function (num, val) {
                    var numarr = []; //num = 10;
                    if (val == 0) {

                        for (var i = 0; i <= num; i++) {
                            numarr.push(i);
                        }

                    } else {
                        for (var j = 0; j <= (num - val); j++) {
                            numarr.push(j);
                        }
                    }
                    return numarr;
                };


                if (factory.popupsCredit.length > 0) {
                    ionicPopups.creditList = factory.popupsCredit.slice();
                } else {
                    ionicPopups.creditList = [];
                }

                ionicPopups.redeliveryList = [];
                var isCreditAll = false;
                var isRedelivery = false;

                function updateCredit(itemNumber) {
                    var creditObj = $filter('filter')(ionicPopups.creditList, function (creditItem) {
                        return creditItem.itemNumber == itemNumber;
                    });
                    return creditObj;
                }

                function pushCredit(credit, itemNumber, resID, deliveryID) {
                    ionicPopups.creditList.push({
                        'credit': credit,
                        'itemNumber': itemNumber,
                        'resID': resID,
                        'deliveryID': deliveryID
                    });
                }

                $scope.setCredit = function (credit, itemNumber, resID, deliveryID) {
                    var uC = updateCredit(itemNumber);
                    if (credit >= 0) {
                        if (isCreditAll && uC) {
                            uC[0].credit = credit;
                        } else {
                            if (ionicPopups.creditList.length > 0) {
                                if (uC.length > 0)
                                    uC[0].credit = credit;
                                else
                                    pushCredit(credit, itemNumber, resID, deliveryID);
                            } else {
                                pushCredit(credit, itemNumber, resID, deliveryID);
                            }
                        }
                    }
                };


                function updateRedelivery(itemNumber) {
                    var redeliveryObj = $filter('filter')(ionicPopups.redeliveryList, function (redeliveryItem) {
                        return redeliveryItem.itemNumber == itemNumber;
                    });
                    return redeliveryObj;
                }

                function pushRedelivery(redelivery, itemNumber, resID, deliveryID) {
                    ionicPopups.redeliveryList.push({
                        'redelivery': redelivery,
                        'itemNumber': itemNumber,
                        'resID': resID,
                        'deliveryID': deliveryID
                    });
                }

                $scope.setRedelivery = function (redelivery, itemNumber, resID, deliveryID) {
                    var uR = updateRedelivery(itemNumber);
                    if (redelivery >= 0) {
                        if (isRedelivery && uR) {
                            uR[0].redelivery = redelivery;
                        } else {
                            if (ionicPopups.redeliveryList.length > 0) {
                                if (uR.length > 0)
                                    uR[0].redelivery = redelivery;
                                else
                                    pushRedelivery(redelivery, itemNumber, resID, deliveryID);
                            } else {
                                pushRedelivery(redelivery, itemNumber, resID, deliveryID);
                                //ionicToast.show( ' Re-Deliver Orders found!'+redelivery+' '+itemNumber+' '+resID+' '+deliveryID, 'bottom', false, 2000);
                            }
                        }
                    }
                };



                function reset() {
                    db.transaction(function (tx) {
                        tx.executeSql(vsprintf(sqlQueries.getSingleItemDetail, [resID, deliveryID]), [], function (tx, OrderDetails) {
                            $scope.$apply(function () {
                                factory.dbToJson(OrderDetails, function (OrderDetailsItem) {
                                    $scope.itemDetails = $filter('orderBy')(OrderDetailsItem, 'OrderQuantity', true);
                                });
                            });
                        });
                    });
                }

                $scope.creditAll = function (resID, deliveryID) {
                    if (isRedelivery) {
                        for (var j = 0; j < $scope.itemDetails.length; j++) {
                            $scope.itemDetails[j].redelivery = 0;
                        }
                    }
                    ionicPopups.redeliveryList = [];
                    ionicPopups.creditList = [];
                    for (var i = 0; i < $scope.itemDetails.length; i++) {
                        if ($scope.itemDetails[i].ItemNumber == '7001' || $scope.itemDetails[i].ItemNumber == '7002' || $scope.itemDetails[i].ItemNumber == '7050' || ($scope.itemDetails[i].ItemNumber >= '9800' && $scope.itemDetails[i].ItemNumber <= '9899')) {
                        } else {
                            ionicPopups.creditList.push({
                                'credit': $scope.itemDetails[i].OrderQuantity,
                                'itemNumber': $scope.itemDetails[i].ItemNumber,
                                'resID': resID,
                                'deliveryID': deliveryID
                            });
                        }
                        
                        if ($scope.itemDetails[i].ItemNumber == '7001' || $scope.itemDetails[i].ItemNumber == '7002' || $scope.itemDetails[i].ItemNumber == '7050' || ($scope.itemDetails[i].ItemNumber >= '9800' && $scope.itemDetails[i].ItemNumber <= '9899')) {
                            $scope.itemDetails[i].credit = 0;
                        } else {
                            $scope.itemDetails[i].credit = $scope.itemDetails[i].OrderQuantity;
                        }

                        $scope.itemDetails[i].redelivery = 0;
                    }
                    isCreditAll = true;
                };

                $scope.redeliverAll = function (resID, deliveryID) {
                    if (isCreditAll) {
                        for (var j = 0; j < $scope.itemDetails.length; j++) {
                            $scope.itemDetails[j].credit = 0;
                        }
                    }
                    ionicPopups.creditList = [];
                    ionicPopups.redeliveryList = [];
                    for (var i = 0; i < $scope.itemDetails.length; i++) {
                        if ($scope.itemDetails[i].ItemNumber == '7001' || $scope.itemDetails[i].ItemNumber == '7002' || $scope.itemDetails[i].ItemNumber == '7050') {
                        } else {
                            ionicPopups.redeliveryList.push({
                                'redelivery': $scope.itemDetails[i].OrderQuantity,
                                'itemNumber': $scope.itemDetails[i].ItemNumber,
                                'resID': resID,
                                'deliveryID': deliveryID
                            });
                        }
                        if ($scope.itemDetails[i].ItemNumber == '7001' || $scope.itemDetails[i].ItemNumber == '7002' || $scope.itemDetails[i].ItemNumber == '7050') {
                            $scope.itemDetails[i].redelivery = 0;
                        } else {
                            $scope.itemDetails[i].redelivery = $scope.itemDetails[i].OrderQuantity;
                        }
                        //$scope.itemDetails[i].redelivery = $scope.itemDetails[i].OrderQuantity;
                        $scope.itemDetails[i].credit = 0;
                    }
                    isRedelivery = true;
                };

                $scope.notDelivered = function () {
                    reset();
                    ionicPopups.creditList = [];
                    ionicPopups.redeliveryList = [];
                };
                $scope.$on("$ionicView.enter", function (event, data) {
                    factory.menuDashboard=true;
                });

            });

        }]);
})();