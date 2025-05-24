/* global angular, document, window */
(function () {
    'use strict';
    angular.module('starter.controllers', [])
        .controller('AppCtrl', ['$scope', 'service', 'ionicPopups', '$state', '$ionicPopup', 'sql', 'Idle', '$timeout', '$window', '$ionicHistory', 'ionicToast', '$ionicModal', 'factory', '$q', 'sqlQueries', '$filter', '$ionicLoading', function ($scope, service, ionicPopups, $state, $ionicPopup, sql, Idle, $timeout, $window, $ionicHistory, ionicToast, $ionicModal, factory, $q, sqlQueries, $filter, $ionicLoading) {

            $scope.$on("$ionicView.enter", function (event, data) {
                $scope.showMenuItems = factory.menuDashboard;
            });
            $scope.syncDisabled = factory.adminlogin;
            var responseArray = [];
            var responseCreditArray = [];
            var responseRedeliverArray = [];

            var loginRes = angular.fromJson(localStorage.getItem("loginRespons"));

            function syncIsCreditsRedeliver(SignaturesCred) {
                var deferred = $q.defer();
                var totalCredits = {};
                var errors = {};
                customLoop(SignaturesCred, 1).then(function (params) {
                    console.log('responseCreditArray', responseCreditArray);
                    var reaspCreditData = {};
                    reaspCreditData.totalOrderCredits = 0;
                    responseCreditArray.forEach(function (item, index) {
                        if (item.data.ResultMessage === "Success")
                            reaspCreditData.totalOrderCredits = reaspCreditData.totalOrderCredits + item.data.CreditList.length;
                    });

                    totalCredits.credits = reaspCreditData.totalOrderCredits;

                    customLoop(SignaturesCred, 2).then(function (params) {
                        console.log('responseRedeliverArray', responseRedeliverArray);
                        var reaspRedeliverData = {};
                        reaspRedeliverData.totalOrderRedelivers = 0;
                        responseRedeliverArray.forEach(function (item, index) {
                            if (item.data.ResultMessage === "Success")
                                reaspRedeliverData.totalOrderRedelivers = reaspRedeliverData.totalOrderRedelivers + item.data.RedeliverList.length;
                        });
                        totalCredits.redeliver = reaspRedeliverData.totalOrderRedelivers;
                        deferred.resolve(totalCredits);
                        //$scope.syncData(TCredits, TRedeliver, SignaturesCred); 
                    }, function (err) {
                        errors.redeliverErr = err;
                        deferred.reject(errors);
                    });

                }, function (err) {
                    errors.creditsErr = err;
                    deferred.reject(errors);
                });



                return deferred.promise;
            }


            

            function syncIsCredits(SignaturesCred) {
                var deferred = $q.defer();
                var totalCredits = {};
                var errors = {};
                customLoop(SignaturesCred, 1).then(function (params) {
                    console.log('responseCreditArray', responseCreditArray);
                    var reaspCreditData = {};
                    reaspCreditData.totalOrderCredits = 0;
                    responseCreditArray.forEach(function (item, index) {

                        if(item.data.CreditList==null){
                            ionicToast.show("Error occured while storing credits!", 'bottom', false, 4000);
                            totalCredits.CreditList = null;
                            $ionicLoading.hide();
                            deferred.reject("Error occured while storing credits!");
                           
                        } else {
                        if ((item.data.ResultMessage === "Success") || (item.data.ResultMessage === "Errors were encountered on one or more items"))
                            reaspCreditData.totalOrderCredits = reaspCreditData.totalOrderCredits + item.data.CreditList.length;

                        totalCredits.ResultMessage = item.data.ResultMessage;
                        totalCredits.CreditList = item.data.CreditList;

                        }
                    });
                    totalCredits.credits = reaspCreditData.totalOrderCredits;
                    deferred.resolve(totalCredits);
                }, function (err) {
                    errors.creditsErr = err;
                    deferred.reject(errors);
                });
                return deferred.promise;
            }


            function syncIsRedeliver(SignaturesCred) {
                var deferred = $q.defer();
                var totalCredits = {};
                var errors = {};

                customLoop(SignaturesCred, 2).then(function (params) {
                    console.log('responseRedeliverArray', responseRedeliverArray);
                    var reaspRedeliverData = {};
                    reaspRedeliverData.totalOrderRedelivers = 0;
                    responseRedeliverArray.forEach(function (item, index) {
                        if (item.data.ResultMessage === "Success")
                            reaspRedeliverData.totalOrderRedelivers = reaspRedeliverData.totalOrderRedelivers + item.data.RedeliverList.length;
                    });
                    totalCredits.redeliver = reaspRedeliverData.totalOrderRedelivers;
                    deferred.resolve(totalCredits);
                }, function (err) {
                    errors.redeliverErr = err;
                    deferred.reject(errors);
                });

                return deferred.promise;
            }

            $scope.gotoChangePassword = function () {
                if (factory.adminlogin) {
                    ionicToast.show("Change password is disabled!", 'bottom', false, 4000);
                } else {
                    if (factory.menuDashboard) {
                        ionicToast.show("Change password is disabled!", 'bottom', false, 4000);
                    } else {
                        $state.go("app.changePassword");
                    }
                }
            };
            $scope.gotoHelp = function () {
                if (factory.adminlogin) {
                    ionicToast.show("Help is disabled!", 'bottom', false, 4000);
                } else {
                    if (factory.menuDashboard) {
                        ionicToast.show("Help is disabled!", 'bottom', false, 4000);
                    } else {
                        $state.go("app.help");
                    }
                }
            };

            $scope.goToLog = function () {
                $state.go('app.log');
            };


            var errorStack="";

            $scope.syncCredits = function () {
                if (factory.adminlogin) {
                    ionicToast.show("Sync is disabled!", 'bottom', false, 4000);
                } else {
                    if (factory.menuDashboard) {
                        ionicToast.show("Sync is disabled!", 'bottom', false, 4000);

                    } else {
                        confirmSynch();
                    }
                }

            };

            function confirmSynch() {
                errorStack="";
                var ConfirmSynchPopup = $ionicPopup.show({
                    title: '<i class="fa fa-exclamation-circle fa-lg" style="color: red !important" aria-hidden="true"></i>',
                    template: 'Syncing uploads and removes all orders from the tablet. Are you sure you want to Sync the orders?',
                    scope: $scope,
                    cssClass: 'val-popup',
                    buttons: [{
                        text: "Yes",
                        onTap: function () {
                            return true;
                        }
                    }, {
                        text: "No",
                        onTap: function (e) {
                            return false;
                        }
                    }, ]
                });


                ConfirmSynchPopup.then(function (res) {
                    if (res) {
                        sql.executeSqlQuery('getIsSync', [], function (isSync) {
                            if (isSync[0].isSync == '1') {
                                sql.executeSqlQuery('syncSignatureMetadata', [], function (SignaturesCred) {
                                    responseCreditArray = [];
                                    responseRedeliverArray = [];
                                    if (SignaturesCred.length > 0) {
                                        $scope.signaturesCredit = SignaturesCred;

                                        sql.executeSqlQuery('getCreditsCount#' + "'" + factory.FacilityCode + "'", [], function (creditChk) {
                                            console.log("a", creditChk[0].numberOfResID);
                                            var a = creditChk[0].numberOfResID;
                                            sql.executeSqlQuery('getRedeliverCount#' + "'" + factory.FacilityCode + "'", [], function (redeliverChk) {
                                                console.log("b", redeliverChk[0].numberOfResID);
                                                var b = redeliverChk[0].numberOfResID;

                                                if (a > 0 && b > 0) {
                                                    syncIsCreditsRedeliver(SignaturesCred).then(function (totalCredits) {
                                                        $scope.syncData(totalCredits.credits, totalCredits.redeliver, SignaturesCred);
                                                    });
                                                } else if (a > 0) {
                                                    syncIsCredits(SignaturesCred).then(function (totalCredits) {
                                                        $scope.CreditResultMessage = totalCredits.ResultMessage;
                                                        $scope.syncData(totalCredits.CreditList!=null ? totalCredits.credits:0, 0, SignaturesCred);
                                                      
                                                    },function(error){
                                                        $scope.syncData(0,0, SignaturesCred);
                                                    });
                                                } else if (b > 0) {
                                                    syncIsRedeliver(SignaturesCred).then(function (totalCredits) {
                                                        $scope.syncData(totalCredits.credits, totalCredits.redeliver, SignaturesCred);
                                                    });
                                                } else if (a == 0 && b == 0) {
                                                    $scope.syncData(0, 0, SignaturesCred);
                                                }
                                            });
                                        });

                                    } else
                                        ionicToast.show('No order to sync', 'bottom', false, 3000);
                                });
                            } else
                                ionicToast.show("Please download orders. Your existing signatures will remain!", 'bottom', false, 4000);
                        });
                    } else {}
                });

            }

            function postCreditByDownloadSeq(k, seqObj) {
              
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    tx.executeSql(vsprintf(sqlQueries.getCredits, [seqObj.FacilityCode]), [], function (tx11, results) {
                        factory.dbToJson(results, function (credits) {
                            var creditsResID = [];

                            function uniqueValue(array) {
                                var unique = {};
                                for (var i in array) {
                                    if (typeof (unique[array[i].ResID]) == "undefined") {
                                        creditsResID.push(array[i].ResID);
                                    }
                                    unique[array[i].ResID] = 0;
                                }
                            }

                            function setCreditForItems(credits, ResID) {
                                var creditObj = {};
                                creditObj.ResID = ResID;
                                creditObj.ItemList = [];
                                var creditedItemsObj = $filter('filter')(credits, function (credit) {
                                    return credit.ResID == ResID;
                                });
                                for (var k = 0; k < creditedItemsObj.length; k++) {
                                    var creditItem = {};
                                    creditItem.ItemNumber = creditedItemsObj[k].ItemNumber;
                                    creditItem.CreditQuantity = creditedItemsObj[k].CreditQuantity;
                                    creditItem.IsPAK = creditedItemsObj[k].IsPAK;
                                    creditItem.InReceipts = creditedItemsObj[k].InReceipts;
                                    creditObj.ItemList.push(creditItem);
                                }
                                return creditObj;
                            }
                            if (credits.length > 0) {
                                var data = {};
                                data.DownloadSeq = credits[0].DownloadSeq;
                                data.FacilityCode = credits[0].FacilityCode;
                                data.Token = loginRes.Token;
                                data.CreditList = [];
                                uniqueValue(credits);
                                for (var i = 0; i < creditsResID.length; i++) {
                                    data.CreditList.push(setCreditForItems(credits, creditsResID[i]));
                                }
                                var requestTime = new Date();
                                var requestSec = requestTime.getSeconds();
                                $ionicLoading.show({
                                    template: 'Please wait...'
                                });
                                service.storeDeliveryCredits(data).then(function (response) {
                                     let errorResponse =[];

                                     if (response.status !== 200) {
                                        ionicToast.show(response.data, 'bottom', false, 3000);
                                        errorStack += response.data +" | ";
                                        saveDBErrorResponse('StoreDeliveryCredits',data,response,requestSec).then(function(res){
                                            errorStack += "Log created Credits | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000); 
                                            deferred.reject("error");
                                        }, function (error) {
                                            errorStack += "Log error Credits | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000); 
                                            deferred.reject(error);
                                        })
                                    } else {


                                        if(response && response.data && response.data.CreditList){
                                            response.data.CreditList.forEach(element => {
                                                let elm ={
                                                    ItemList:[],
                                                    ResID: element.ResID
                                                };
                                                element.ItemList.forEach(item => {
                                                    if(item.ItemResultMessage != ""){
                                                        elm.ItemList.push(item);
                                                    }
                                                })
                                                if(elm.ItemList.length > 0){
                                                    errorResponse.push(elm);
                                                }
                                            });
                                        }
                                        let responseObj = {
                                            CreditList: errorResponse,
                                            DownloadSeq: response.data.DownloadSeq,
                                            FacilityCode: response.data.FacilityCode,
                                            ResultMessage: response.data.ResultMessage
                                        }
                                          errorStack += "Credit sync | ";
                                          saveDBErrorResponse('StoreDeliveryCredits',data,responseObj,requestSec).then(function(res){
                                              errorStack += "Log created Credits | ";
                                              ionicToast.show(errorStack, 'bottom', false, 8000); 
                                              deferred.resolve(response);
                                          }, function (error) {
                                              errorStack += "Log error Credits | ";
                                              ionicToast.show(errorStack, 'bottom', false, 8000); 
                                              deferred.reject(error);
                                          })
                                    }
                                }, function (error) {
                                    var requestTime = new Date();
                                    var responseTime = requestTime.getSeconds() - requestSec;
                                    responseTime = (responseTime > 0) ? responseTime : 60 + responseTime;

                                    tx.executeSql(sqlQueries.log, ['StoreDeliveryCredits', requestSec, data.FacilityCode, data.DownloadSeq,angular.toJson(data), angular.toJson(error), responseTime], function (txx, result) {
                                        deferred.resolve(response);
                                    });
                                    deferred.reject(error);
                                });

                            } else {
                                // if ($scope.signaturesCredit.length > 0)
                                //     $scope.syncData(0, 0, $scope.signaturesCredit);
                                deferred.reject("error");
                            }

                        });
                    }, function (tx, error) {
                        deferred.reject(error);
                    });
                });
                return deferred.promise;
            }

         

            function postRedeliverByDownloadSeq(k, seqObj) {
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    tx.executeSql(vsprintf(sqlQueries.getRedeliver, [seqObj.FacilityCode]), [], function (tx11, results) {
                        factory.dbToJson(results, function (redelivers) {
                            var redeliversResID = [];

                            function uniqueValue(array) {
                                var unique = {};
                                for (var i in array) {
                                    if (typeof (unique[array[i].ResID]) == "undefined") {
                                        redeliversResID.push(array[i].ResID);
                                    }
                                    unique[array[i].ResID] = 0;
                                }
                            }

                            function setRedeliverForItems(redelivers, ResID) {
                                var redeliverObj = {};
                                redeliverObj.ResID = ResID;
                                redeliverObj.ItemList = [];
                                var redeliveredItemsObj = $filter('filter')(redelivers, function (redeliver) {
                                    return redeliver.ResID == ResID;
                                });
                                for (var k = 0; k < redeliveredItemsObj.length; k++) {
                                    var redeliverItem = {};
                                    redeliverItem.ItemNumber = redeliveredItemsObj[k].ItemNumber;
                                    redeliverItem.RedeliverQuantity = redeliveredItemsObj[k].RedeliverQuantity;
                                    redeliverItem.IsPAK = redeliveredItemsObj[k].IsPAK;
                                    redeliverItem.InReceipts = redeliveredItemsObj[k].InReceipts;
                                    redeliverObj.ItemList.push(redeliverItem);
                                }
                                return redeliverObj;
                            }
                            if (redelivers.length > 0) {
                                var data = {};
                                data.DownloadSeq = redelivers[0].DownloadSeq;
                                data.FacilityCode = redelivers[0].FacilityCode;
                                data.Token = loginRes.Token;
                                data.RedeliverList = [];
                                uniqueValue(redelivers);
                                for (var i = 0; i < redeliversResID.length; i++) {
                                    // setCreditForItems(sqlQueries, ResID);
                                    data.RedeliverList.push(setRedeliverForItems(redelivers, redeliversResID[i]));
                                }
                                var requestTime = new Date();
                                var requestSec = requestTime.getSeconds();
                                $ionicLoading.show({
                                    template: 'Please wait processing...'
                                });
                                service.storeDeliveryRedelivers(data).then(function (response) {
                                    if (response.status !== 200) {
                                        ionicToast.show(response.data, 'bottom', false, 3000);
                                        errorStack += response.data +" | ";
                                        saveDBErrorResponse('StoreDeliveryRedelivers',data,response,requestSec).then(function(res){
                                            errorStack += "Log created Redelivers | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000);
                                            deferred.reject("error");
                                        }, function (error) {
                                            errorStack += "Log error Redelivers | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000); 
                                            deferred.reject(error);
                                        })
                                       
                                    } else {
                                            errorStack += "Redilivery Sync | ";
                                            saveDBErrorResponse('StoreDeliveryRedelivers',data,response.data,requestSec).then(function(res){
                                                errorStack += "Log created Redelivers | ";
                                                ionicToast.show(errorStack, 'bottom', false, 8000);
                                                deferred.resolve(response);
                                            }, function (error) {
                                                errorStack += "Log error Redelivers | ";
                                                ionicToast.show(errorStack, 'bottom', false, 8000); 
                                                deferred.reject(error);
                                            })
                                       
                                    }
                                    
                                }, function (error) {
                                    console.log(error);
                                    deferred.reject(error);
                                });

                                // }, function (tx21, error) {
                                //     console.log(tx21, error);
                                //     deferred.reject(error);
                                // });
                            } else {
                                if ($scope.signaturesCredit.length > 0)
                                    $scope.syncData(0, 0, $scope.signaturesCredit);
                            }

                        });
                    }, function (tx, error) {
                        deferred.reject(error);
                    });
                });
                return deferred.promise;
            }
          



            function confirmRetrySignatureSync() {
                var ConfirmSynchPopupSignatureSync = $ionicPopup.show({
                    title: '<i class="fa fa-exclamation-circle fa-lg" style="color: red !important" aria-hidden="true"></i>',
                    template: 'There were issues in storing the signatures, try again?',
                    scope: $scope,
                    cssClass: 'val-popup',
                    buttons: [{
                        text: "Yes",
                        onTap: function () {
                            return true;
                        }
                    }, {
                        text: "No",
                        onTap: function (e) {
                            return false;
                        }
                    }, ]
                });


                ConfirmSynchPopupSignatureSync.then(function (res) {
                    if (res) {
                        if ($scope.signaturesCredit.length > 0) {
                            ionicToast.show('Retrying..', 'bottom', false, 3000);
                            $scope.syncData(0, 0, $scope.signaturesCredit);
                        } else {
                            ionicToast.show('No signatures found!!', 'bottom', false, 3000);
                        }
                    } else {
                        ionicToast.show('Retry cancelled!!', 'bottom', false, 3000);
                    }
                });

            }

            var isSuccessMsg = 'Successfully';
            var signaturChk = 0;



            //$scope.syncData = function (SignaturesCred) {
            $scope.syncData = function (TotalCredits, TotalRedelivers, SignaturesCred) {
                //$scope.syncData = function (TotalCredits,SignaturesCred) {
                // ionicPopups.isOnline = true;

                if (factory.isOrderExist <= 0) {
                    $ionicLoading.hide();
                    ionicToast.show('No local data to sync.', 'bottom', false, 3000);
                    return;
                }

                if (db !== null)
                    if (!ionicPopups.isOnline) {
                        $ionicLoading.hide();
                        ionicToast.show('No Internet Connectivity!', 'bottom', false, 3000);
                        return true;
                    }


                var data = {};
                // sql.executeSqlQuery('syncSignatureMetadata', [], function (SignaturesCred) {

                responseArray = [];
                if (SignaturesCred.length > 0)
                    customLoop(SignaturesCred, 0).then(function (params) {
                        var reaspData = {};
                        reaspData.TotalReceived = 0;
                        reaspData.TotalReceivedValid = 0;
                        reaspData.TotalSignatures = 0;
                        reaspData.facilities = "";
                        reaspData.resID = "";
                        signaturChk = 0;
                        var prop = ['TotalReceived', 'TotalCredits', 'CreditMessage', 'SignMessage'];
                        var propDislay = ['Total Orders', 'Total Credits', ' Credit Message', 'Sign Message'];

                        // var prop = ['TotalReceived', 'TotalSignatures'];
                        // var propDislay = ['Total Orders', 'Total Signatures'];

                        responseArray.forEach(function (item, index) {
                            if (item.data.TotalReceived) {
                                reaspData.TotalReceived = reaspData.TotalReceived + item.data.TotalReceived;
                                reaspData.TotalReceivedValid = reaspData.TotalReceivedValid + item.data.TotalReceivedValid;
                                reaspData.TotalSignatures = reaspData.TotalSignatures + item.data.TotalSignatures;
                                // reaspData.facilities = reaspData.facilities + reaspData.facilities === '' ? ', ' : '' + item.data.FacilityCode;
                                console.log(item.data);
                                //  if (item.data.ResultMessage === "Success")
                                //             {
                                //              reaspCreditData.totalOrderCredits = reaspCreditData.totalOrderCredits + item.data.CreditList.length;
                                //              reaspRedeliverData.totalOrderRedelivers = reaspRedeliverData.totalOrderRedelivers + item.data.RedeliverList.length;
                                //             }

                                reaspData.TotalCredits = TotalCredits ? TotalCredits : 0;

                                //reaspData.TotalRedelivers = TotalRedelivers ? TotalRedelivers : 0;

                                if (item.data.TotalSignatures > 0) {
                                    item.data.ResidentResults.forEach(function (resID, index) {
                                        if ((resID.Message == "Signature Stored") || (resID.Message == "")) {
                                            reaspData.resID = reaspData.resID + (reaspData.resID === "" ? "'" : "', '") + resID.ResID;
                                        }
                                    });
                                }
                            }
                            if (reaspData.TotalReceived == 0) {
                                isSuccessMsg = "Failed";
                            }
                        });
                        db.transaction(function (tx) {
                            if ((reaspData.TotalReceived == reaspData.TotalReceivedValid)&& (reaspData.TotalReceivedValid >0)) {
                                tx.executeSql(vsprintf(sqlQueries.deleteOrderHeader, [reaspData.resID + "'"]), [], function (tx1, resultsOrderHeader) {
                                    tx.executeSql(vsprintf(sqlQueries.deleteItemDetails, [reaspData.resID + "'"]), [], function (tx2, resultsItemDetails) {
                                        tx.executeSql(sqlQueries.deleteUnProcessedItems, [], function (results) {
                                            tx.executeSql(sqlQueries.truncateOrderHeader, [], function (results) {
                                                tx.executeSql(sqlQueries.deleteServiceCentre, [], function (tx3, resultsdeleteService) {
                                                    tx.executeSql(sqlQueries.updateNoSync, [], function (isSync) {
                                                        // console.log(isSync);
                                                    }, function (isSync) {
                                                        // console.log(isSync);
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            } else {
                                isSuccessMsg = "Failed" + reaspData.TotalReceived + reaspData.TotalReceivedValid;
                                signaturChk = 1;
                            }
                        });

                        var template = '';
                        reaspData.CreditMessage = $scope.CreditResultMessage;
                        reaspData.SignMessage= "Not successful";
                        for (var i = 0; i < prop.length; i++) {

                            if (reaspData[prop[i]] == undefined)
                                reaspData[prop[i]] = 0;
                            if ((i == 0 || i == 1) && signaturChk == 0)
                                template += '<tr style="border: 1px solid #949494;"><td>' + propDislay[i] + '</td><td style="padding-left:5px" > ' + reaspData[prop[i]] + '</td></tr>';
                            if (i == 2)
                                template += '<tr style="border: 1px solid #949494;"><td>' + propDislay[i] + '</td><td style="padding-left:5px" > ' + reaspData[prop[i]] + '</td></tr>';
                            if (i == 3 && signaturChk == 1)
                                template += '<tr style="border: 1px solid #949494;"><td>' + propDislay[i] + '</td><td style="padding-left:5px" > ' + reaspData[prop[i]] + '</td></tr>';

                        }
                        $ionicLoading.hide();
                        if (signaturChk == 1) {
                            isSuccessMsg += ": Storage not complete, please try again.";
                        }
                        var alertPopup = $ionicPopup.alert({
                            title: 'Order Synced ' + isSuccessMsg,
                            template: '<table style="margin: auto;"><thead style="color: white;background-color: #9cb0c4;border: 1px solid #949494;"><tr style="border: 1px solid #949494;"><th>Option</th><th>Value</th></tr></thead><tbody>' + template + '  </tbody> </table>',
                        });

                        factory.isSync = true;
                        $scope.$broadcast('updateFacility');
                        factory.ordersHeader = [];
                        alertPopup.then(function (res) {
                            if (signaturChk == 1) {
                                confirmRetrySignatureSync();

                            } else {
                                $state.go('app.dashboard');
                            }
                        });
                        $timeout(function () {
                            alertPopup.close();
                        }, 60000);




                    });
                // });
            };

            function customLoop(SignaturesCred, functionIndex) {

                var currentRequest = 0;
                var deferred = $q.defer();

                function makeNextRequest() {
                    if (functionIndex == 1) {
                        postCreditByDownloadSeq(currentRequest, SignaturesCred[currentRequest])
                            .then(function (responseData) {
                                    var response = angular.copy(responseData);
                                    responseCreditArray.push(response);
                                    deferred.resolve('ok');
                                },
                                function (error) {
                                    deferred.reject(error);
                                });
                    } else if (functionIndex == 2) {
                        postRedeliverByDownloadSeq(currentRequest, SignaturesCred[currentRequest])
                            .then(function (responseData) {
                                    var response = angular.copy(responseData);
                                    responseRedeliverArray.push(response);
                                    deferred.resolve('ok');
                                },
                                function (error) {
                                    deferred.reject(error);
                                });
                    } else if (functionIndex == 0) {
                        postDataByDownloadSeq(currentRequest, SignaturesCred[currentRequest])
                            .then(function (responseData) {
                                    var response = angular.copy(responseData);
                                    responseArray.push(response);
                                    deferred.resolve('ok');
                                },
                                function (error) {
                                    deferred.reject(error);
                                });
                    }

                }
                makeNextRequest();

                return deferred.promise;
            }

           
            function postDataByDownloadSeq(k, seqObj) {
                var data = {};
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    tx.executeSql(vsprintf(sqlQueries.syncOrderHeader, [seqObj.FacilityCode]), [], function (tx2, results) {
                        factory.dbToJson(results, function (signatures) {
                            if (signatures.length > 0) {
                                // data = angular.copy(seqObj);

                                data.DownloadSeq = signatures[0].DownloadSeq;
                                data.FacilityCode = seqObj.FacilityCode;
                                data.Token = loginRes.Token;

                                data.ResidentConfirmList = [];
                                for (var i = 0; i < signatures.length; i++) {
                                    if (signatures[i].Confirmation == "*** Undelivered") {
                                        delete signatures[i].DeliveryID;
                                    }
                                    delete signatures[i].mergedata;
                                    delete signatures[i].DownloadSeq;
                                    data.ResidentConfirmList.push(signatures[i]);
                                }
                                // console.log(data);
                                var requestTime = new Date();
                                var requestSec = requestTime.getSeconds();
                                
                                $ionicLoading.show({
                                    template: 'Please wait...'
                                });
                                service.deliverySignatures(data).then(function (response) {
                                    if (response.status !== 200) {
                                        ionicToast.show(response.data, 'bottom', false, 3000);
                                        errorStack += response.data +" | ";
                                        saveDBErrorResponse('StoreDeliverySignatures',data,response,requestSec).then(function(res){
                                            errorStack += "Log created Signature | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000); 
                                            deferred.reject("error");
                                        }, function (error) {
                                            errorStack += "Log error Signature | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000); 
                                            deferred.reject(error);
                                        })
                                     
                                      
                                    } else {

                                        db.transaction(function (tx) {
                                            var requestTime = new Date();
                                            var responseTime = requestTime.getSeconds() - requestSec;
                                            responseTime = (responseTime > 0) ? responseTime : 60 + responseTime;
                                            let errorData= JSON.parse(JSON.stringify(response.data));
                                            errorData.ResidentResults =[];
                                            if(response.data && response.data.ResidentResults){
                                                response.data.ResidentResults.forEach(element => {
                                                    //if(element.Message != "Signature Stored"){
                                                        errorData.ResidentResults.push(element);
                                                   // }
                                                });
                                            }
                                        saveDBErrorResponse('StoreDeliverySignatures',data,errorData,requestSec).then(function(res){
                                            errorStack += "Log created Signature | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000); 
                                            deferred.resolve(response);
                                        }, function (error) {
                                            errorStack += "Log error Signature | ";
                                            ionicToast.show(errorStack, 'bottom', false, 8000); 
                                            deferred.reject(error);
                                        })
                                        }, function (error) {
                                            
                                            deferred.reject(error);
                                        });
                                    }
                                }, function (error) { 
                                    db.transaction(function (tx) {
                                        var requestTime = new Date();
                                        var responseTime = requestTime.getSeconds() - requestSec;
                                        responseTime = (responseTime > 0) ? responseTime : 60 + responseTime;
                                        tx.executeSql(sqlQueries.log, ['StoreDeliverySignatures', requestSec, data.FacilityCode, data.DownloadSeq,angular.toJson(data), angular.toJson(error), responseTime], function (txx, result) {
                                            deferred.resolve(response);
                                        });
                                    }, function (error) {
                                        
                                        deferred.reject(error);
                                    });
                                 });
                            }
                        });
                    }, function (tx, error) {
                        deferred.reject(error);
                    });
                });
                $ionicLoading.hide();
                return deferred.promise;
            }

            function saveDBErrorResponse(api,data,response,requestSec){
                var deferred = $q.defer(); 

                if(db != null && db.transaction !== undefined){
                    db.transaction(function (tx) {
                        var requestTime = new Date();
                        var responseTime = requestTime.getSeconds() - requestSec;
                        responseTime = (responseTime > 0) ? responseTime : 60 + responseTime;
                        if(data.request !== undefined){
                            if(data.request.Token !== undefined){
                               data.request.Token ="";
                            }
                           
                        }

                        if(data.Token !== undefined){
                            data.Token ="";
                           
                         }
                         if(response.config !== undefined){
                            response.config="";
                         }
                         if(data.ResidentConfirmList !== undefined)
                         {
                             data.ResidentConfirmList.forEach(element => {
                                 element.Confirmation ="Signature captured!";
                             });
                         }

                        tx.executeSql(sqlQueries.log, [api, requestSec, data.FacilityCode, data.DownloadSeq,angular.toJson(data), angular.toJson(response), responseTime], function (tx) {
                            ionicToast.show('Please check log for more details!', 'bottom', false, 3000);
                            deferred.resolve(response);
                        }, function (tx){
                            errorStack += "executeSql error insert | ";
                            tx.executeSql("CREATE TABLE IF NOT EXISTS log(API,RequestTime,FacilityCode, DownloadSeq, Request, Response, ResponseTime)",[], function (tx) {
                                errorStack += "executeSql create success | ";
                                saveDBErrorResponse(api,data,response,requestSec).then(function(res){
                                    errorStack += "inner saveDBErrorResponse success | ";
                                    deferred.reject("error");
                                }, function (error) {
                                    errorStack += "inner saveDBErrorResponse error | ";
                                    deferred.reject(error);
                                })
                            },function (tx) {
                                errorStack += "executeSql creating table error | ";
                                ionicToast.show('Error in creating table', 'bottom', false, 3000);
                                deferred.reject("error");
                            });
                            //ionicToast.show(JSON.stringify(tx), 'bottom', false, 3000);
                            //ionicToast.show(JSON.stringify(tx) + '                  Execute querry error! Signatures', 'bottom', false, 3000);
                            deferred.reject(tx);
                        });
                    }, function (tx, error) {
                        ionicToast.show(JSON.stringify(tx) + '                  Db transaction is not defined! Signatures', 'bottom', false, 3000);
                        deferred.reject(tx);
                    });
                  }  else{
                    ionicToast.show('Db is not defined! Signatures', 'bottom', false, 3000);
                        deferred.reject(error);
                    }

                return deferred.promise;

            }
            $scope.logout = function () {
                if (factory.menuDashboard) {
                    ionicToast.show("Logout is disabled!", 'bottom', false, 4000);
                } else {
                    factory.isAuthenticated = false;
                    factory.isSync = false;
                    factory.user = undefined;
                    factory.authToken = undefined;
                    factory.isOrderExist = 0;
                    factory.isCreditExist = 0;
                    factory.isSyncOrderExist = 0;
                    factory.adminlogin = false;
                    factory.rD = 0;
                    $window.localStorage.removeItem('loginRespons');
                    $ionicHistory.clearCache();
                    $ionicHistory.clearHistory();
                    Idle.unwatch();
                    $state.go('login');
                }
            };

            //===========Idle==============
            function changeState() {
                var confirmPopup = $ionicPopup.show({
                    template: '<center><h4>Application is about to close.<br> Select I am here to continue.</h4></center>',
                    scope: $scope,
                    cssClass: 'val-popup',
                    buttons: [{
                        text: "Close",
                        onTap: function () {
                            return false;
                        }
                    }, {
                        text: "I am here",
                        onTap: function (e) {
                            return true;
                        }
                    }, ]
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        $scope.$on('IdleStart', function () {});
                        Idle.watch();
                    } else {
                        $scope.logout();
                    }
                });

                $timeout(function () {
                    confirmPopup.close();
                }, 120000);
            }

            $scope.$on('IdleTimeout', function () {
                changeState();
            });


            $scope.imageSrc = 'img/enableScanner.png';
            $ionicModal.fromTemplateUrl('image-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.closeModal = function () {
                $scope.modal.hide();
                configureScanner();
            };


        }])
        .controller('LoginCtrl', ['$scope', '$state', 'service', 'Constant', 'ionicPopups', '$rootScope', 'getServiceUrl', 'sql', 'Idle', 'ionicToast', 'factory', 'configConst', '$ionicLoading', '$ionicPlatform', 'EnvConfig', '$timeout',
            function ($scope, $state, service, Constant, ionicPopups, $rootScope, getServiceUrl, sql, Idle, ionicToast, factory, configConst, $ionicLoading, $ionicPlatform, EnvConfig, $timeout) {

                function sharedDataFetch() {
                    $ionicPlatform.ready(function () {
                        EnvConfig.getCustConfig().then(function (data) {
                            console.log("getCustConfig", data);
                            if (data.order_signature_server_url === "") {
                                EnvConfig.getEnvConfig().then(function (data) {
                                    console.log("getEnvConfig", data);
                                    if (!data.order_signature_server_url || data.order_signature_server_url === "") {
                                        ionicToast.show('Unable to determine app configuration. Please contact your administrator', 'bottom', false, 3000);
                                    } else {
                                        if (data.username !== undefined && data.username !== '' && data.password !== undefined && data.password !== '') {
                                            factory.username = data.username;
                                            factory.password = data.password;
                                        }
                                        if (data.center_code !== undefined && data.center_code !== '') {
                                            factory.center_code = data.center_code;
                                        }

                                        if (data.order_signature_server_url !== undefined && data.order_signature_server_url !== "") {
                                            factory.serviceUrl = data.order_signature_server_url;

                                            localStorage.setItem("ApiUrl", data.order_signature_server_url);
                                            // alert(data.order_signature_server_url);
                                        } else
                                            ionicToast.show('Unable to determine Service URL. Please contact your administrator', 'bottom', false, 3000);
                                    }
                                });

                            } else {
                                if (data.username !== undefined && data.username !== '' && data.password !== undefined && data.password !== '') {
                                    factory.username = data.username;
                                    factory.password = data.password;
                                }
                                if (data.center_code !== undefined && data.center_code !== '') {
                                    factory.center_code = data.center_code;
                                }

                                if (data.order_signature_server_url !== undefined && data.order_signature_server_url !== "") {
                                    factory.serviceUrl = data.order_signature_server_url;

                                    // alert(data.order_signature_server_url);
                                    localStorage.setItem("ApiUrl", data.order_signature_server_url);
                                } else
                                    ionicToast.show('Unable to determine Service URL. Please contact your administrator', 'bottom', false, 3000);
                            }

                        });

                    });
                }

               sharedDataFetch();
                $scope.$on("$ionicView.enter", function (event, data) {
                    factory.menuDashboard = true;
                });

                $scope.$on('$ionicView.beforeEnter', function (ev, info) {
                    $scope.loginObj = {};
                    $scope.loginObj.username = ""; //"cjgraf"; // "ifsanchez";
                    $scope.loginObj.password = ""; // "123456";
                    $scope.loginObj.ApiUrl = factory.serviceUrl ;//'https://fusion1.tsgsoft.com/TabTesterAPI/api/CommTabletDelivery/';     
                });


               
                $scope.login = function (user) {
                    factory.adminlogin = false;
                    factory.isAuthenticated = false;
                   
                    if (db !== null) {
                        if (!ionicPopups.isOnline) {
                            ionicToast.show('No Internet Connectivity! Trying local login.', 'bottom', false, 3000);
                            if (user.username == factory.username && user.password == factory.password && user.username !== '' && user.password !== '') {
                                factory.adminlogin = true;
                                factory.isAuthenticated = true;
                                $state.go('app.dashboard');

                            } else {
                                ionicToast.show('Invalid local username or password.', 'bottom', false, 3000);
                                return true;
                            }
                        } else {
                            if (!user) {
                                ionicToast.show('Enter username and password.', 'bottom', false, 3000);
                                return;
                            }
                            if (!user.username) {
                                ionicToast.show('Enter username.', 'bottom', false, 3000);
                                return;
                            }
                            if (!user.password) {
                                ionicToast.show('Enter password.', 'bottom', false, 3000);
                                return;
                            }
                            if (!factory.serviceUrl) {
                                ionicToast.show('Unable to determine Service URL. Please contact your administrator', 'bottom', false, 3000);
                            }

                            $ionicLoading.show({
                                template: 'Please wait...'
                            });
                            service.login(user).then(function (res) {



                                

                                if (res.status == 404) {
                                    $ionicLoading.hide();
                                    ionicToast.show('Server error.  Please verify the URL is correct.', 'bottom', false, 3000);
                                    return;
                                }

                                if (res.status == 400 || res.status !== 200) {
                                    $ionicLoading.hide();
                                    ionicToast.show('Invalid username or password.', 'bottom', false, 3000);
                                    return;
                                } else {
                                    localStorage.setItem('LoginDetails', user.username);
                                    factory.isSync = true;
                                    localStorage.setItem("loginRespons", angular.toJson(res.data));
                                    var serviceCenters = res.data.ServiceCenters;
                                    //var serviceCenters = res.data;
                                    Idle.watch();
                                    sql.executeSqlQuery('truncateServiceCenters', [], function () {
                                        for (var i = 0; i < serviceCenters.length; i++) {
                                            sql.executeSqlQuery('storeServiceCenters', [serviceCenters[i].CenterCode, serviceCenters[i].CenterName], function (signatures) {});
                                        }

                                        var facilitiesList = [];
                                        sql.executeSqlQuery('truncateFacilities', [], function (signatures) {
                                            for (var k = 0; k < res.data.ServiceCenters.length; k++) {
                                                var facilities = res.data.ServiceCenters[k].Facilities;
                                                // for (var k = 0; k < res.data.length; k++) {
                                                //var facilities = res.data[k].Facilities;
                                                for (var j = 0; j < facilities.length; j++) {
                                                    sql.executeSqlQuery('storeFacilities', [facilities[j].FacilityCode, facilities[j].FacilityName, facilities[j].ServiceCenter, facilities[j].IncludePhones, 0], function (signatures) {});
                                                    facilitiesList.push(facilities[j]);
                                                }
                                            }
                                            factory.facilitiesAll = facilitiesList;
                                        });
                                        if (user.password.toLowerCase() == configConst.DefaultPassword.toLowerCase()) {
                                            $ionicLoading.hide();
                                            $state.go('appSign.changePassword');
                                        } else {
                                            $ionicLoading.hide();
                                            $state.go('app.dashboard');
                                        }

                                    });
                                }
                            });
                        }


                    } else {
                        service.login(user).then(function (res) {
                            if (res.status !== 200) {
                                ionicToast.show('Invalid username or password.', 'bottom', false, 3000);
                                return;
                            } else {
                                localStorage.setItem("loginRespons", angular.toJson(res.data));
                                localStorage.setItem('LoginDetails', user.username);
                                if (user.password == configConst.DefaultPassword.toLowerCase()) {
                                    $ionicLoading.hide();
                                    $state.go('appSign.changePassword');
                                } else {
                                    $ionicLoading.hide();
                                    $state.go('app.dashboard');
                                }
                            }
                        });
                    }
                };

            }
        ])

        .controller('creditCtrl', ['$scope', 'sql', '$ionicLoading', 'factory', 'sqlQueries', '$state', 'ionicToast', function ($scope, sql, $ionicLoading, factory, sqlQueries, $state, ionicToast) {
            $scope.$on("$ionicView.enter", function (event, data) {
                factory.menuDashboard = true;
                // $ionicLoading.show({ template: 'Please wait...' });
                if (!factory.isFacilityForOrders) {
                    sql.executeSqlQuery('getCreditList', [], function (creditList) {
                        $scope.creditList = creditList;
                        if ($scope.creditList.length <= 0) {
                            $state.go('app.dashboard');
                            ionicToast.show('Credit list is not found.', 'bottom', false, 3000);
                        }
                        // 
                        localStorage.setItem('OrderWCredit', creditList);
                    });
                } else {
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
        }])

        .controller('creditDetailCtrl', ['$scope', '$stateParams', 'sql', '$sce', '$ionicLoading', 'sqlQueries', 'factory', function ($scope, $stateParams, sql, $sce, $ionicLoading, sqlQueries, factory) {

            $scope.$on("$ionicView.enter", function (event, data) {
                factory.menuDashboard = true;
                var resID = $stateParams.ResID;
                var orderID = $stateParams.OrderID;
                if (db === null) {
                    var downlaodData = angular.fromJson(localStorage.getItem('OrderWCredit'));
                    $scope.OrderWCredit = $.grep(downlaodData, function (item, key) {
                        return resID == item.ResID;
                    })[0];
                } else {
                    // $ionicLoading.show({ template: 'Please wait...' });

                    db.transaction(function (tx) {
                        tx.executeSql(vsprintf(sqlQueries.getSingleOrderHeader, [resID, orderID]), [], function (tx, OrderHeader) {
                            tx.executeSql(vsprintf(sqlQueries.getSingleCreditDetail, [resID, orderID]), [], function (tx, OrderDetails) {
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


        }])

        .controller('viewOrderCtrl', ['$scope', '$stateParams', 'sql', '$sce', '$ionicLoading', 'sqlQueries', 'factory', '$filter', '$state', function ($scope, $stateParams, sql, $sce, $ionicLoading, sqlQueries, factory, $filter, $state) {

            $scope.$on("$ionicView.enter", function (event, data) {
                factory.menuDashboard = true;
                var resID = $stateParams.ResID;
                var deliveryID = $stateParams.DeliveryID;

                $scope.btnText = factory.ordDtlbackbtn;

                $scope.isGoToOrderList = function () {
                    $state.go(factory.state);
                };

                if (db === null) {

                } else {
                    // $ionicLoading.show({ template: 'Please wait...' });
                    db.transaction(function (tx) {
                        tx.executeSql(vsprintf(sqlQueries.getSingleOrderHeader, [resID, deliveryID]), [], function (tx, OrderHeader) {
                            tx.executeSql(vsprintf(sqlQueries.getSingleItemDetail, [resID, deliveryID]), [], function (tx, OrderDetails) {
                                $scope.$apply(function () {

                                    factory.dbToJson(OrderDetails, function (OrderDetailsItem) {
                                        factory.dbToJson(OrderHeader, function (orderHeaderItem) {
                                            $scope.orderHeader = orderHeaderItem[0];
                                            $scope.image = $scope.orderHeader.Confirmation;
                                        });
                                        $scope.itemDetails = $filter('orderBy')(OrderDetailsItem, 'OrderQuantity', true);
                                    });

                                });
                            });
                        });
                    });




                }

            });


        }])


        .controller('helpCtrl', ['$scope', '$state', 'factory', function ($scope, $state, factory) {

            $scope.$on("$ionicView.enter", function (event, data) {
                factory.menuDashboard = true;
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
                    // 'img/help/redeliver-list.PNG',
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


        }])
      
        .controller('changePasswordCtrl', ['$scope', 'Constant', '$state', '$ionicLoading', 'factory', 'ionicToast', 'service', function ($scope, Constant, $state, $ionicLoading, factory, ionicToast, service) {
            $scope.$on("$ionicView.enter", function (event, data) {
                factory.menuDashboard = true;
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