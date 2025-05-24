(function () {
    angular.module('starter.controllers')
        .controller("dashboardCtrl", ['$scope', '$state', '$rootScope', 'ionicPopups', 'sql', 'ionicToast', 'factory', 'sqlQueries', '$ionicLoading', function ($scope, $state, $rootScope, ionicPopups, sql, ionicToast, factory, sqlQueries, $ionicLoading) {
            $scope.downloadDisable = factory.adminlogin;
            // factory.menuDashboard=false;
            $scope.username = factory.user;
            $scope.creditHide = true;
            $scope.CreditOrders=false;
            $scope.selectedFac = "Facility Select...";

            $scope.$on("$ionicView.enter", function (event, data) {
                if(factory.rD<=4){
                    $state.go('app.dashboard', {}, {reload: true});
                    factory.rD++;
                }
                factory.isOrderExist = 0;
                factory.isCreditExist = 0;
                factory.isSyncOrderExist = 0;
                factory.FacilityCode='';
                factory.menuDashboard=false;
                if(factory.FacilityCode==''){
                factory.FacilityCode=localStorage.getItem('FacilityCode');
                }
                $scope.isShowDD = false;
                var facilityOfOrders;
                if (db !== null) {
                    sql.executeSqlQuery('checkExistingOrder', [], function (signCred) {
                        facilityOfOrders = signCred;
                        if (facilityOfOrders){
                            factory.isOrderExist = facilityOfOrders.length;
                        }
                        if (factory.isOrderExist > 0) {
                            $scope.facilities = facilityOfOrders;
                            factory.facilities = facilityOfOrders;
                            sql.executeSqlQuery('checkExistingCredit', [], function (checkCredit) {
                                factory.isCreditExist = checkCredit[0].numberOfCredit;
                                sql.executeSqlQuery('checkSyncExistingOrder', [], function (orders) {
                                    factory.isSyncOrderExist = orders[0].numberOfResID;
                                    $scope.$on('updateFacility', function (e) {
                                        console.log('broadcasted updateFacility', e);
                                        setFacility();
                                    });

                                    factory.selecteFacility = factory.selecteFacility ? factory.selecteFacility : 'Facility Select...';
                                    $scope.setAppdata(factory.selecteFacility);
                                });
                            });
                        } else {
                            factory.isSync = true;
                            setFacility();
                        }
                    });
                    sql.executeSqlQuery('getCreditList', [], function (creditHeader) {
                        if (creditHeader.length<=0) {
                            factory.isCreditExist = 0;
                        }
                        else {
                            $scope.CreditOrders=true;
                        }
                    });

                    if(factory.isCreditExist<=0){
                        $scope.CreditOrders=false;
                    }
                    else {
                        //$scope.CreditOrders=true;
                    }
                }
            });


            function setFacility() {
                $scope.facilities = factory.isSync ? factory.facilitiesAll : factory.facilities;
            }


            function checkOrderForFacility(state) {
                if (factory.FacilityCode) {
                    $ionicLoading.show({
                        template: 'Please wait...'
                    });


                    db.transaction(function (tx) {
                        tx.executeSql(vsprintf(sqlQueries.getOrderHeadersByFacility, [factory.FacilityCode]), [], function (tx, results) {
                            factory.dbToJson(results, function (orders) {
                                $ionicLoading.hide();
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
                }
            }



            $scope.gotoDownload = function () {
                if(factory.adminlogin){
                    ionicToast.show("Download is disabled!", 'bottom', false, 4000);
                }
                else{
                    if (db === null) {
                        $state.go('app.download');
                    }
                    $state.go('app.download');
                }
               
            };
            $scope.gotoScan = function () {
                if (db === null) {
                    $state.go('app.deliveryScan');
                    return;
                }
                sql.executeSqlQuery('checkExistingOrder', [], function (signCred) {
                    facilityOfOrders = signCred;
                    if (facilityOfOrders)
                        factory.isOrderExist = facilityOfOrders.length;
                    if (factory.isOrderExist <= 0) {
                        ionicToast.show('Orders are not available. Please download first.', 'bottom', false, 3000);
                        return;
                    } else if (factory.isFacilityForOrders) {
                        checkOrderForFacility('app.deliveryScan');
                    } else
                        $state.go('app.deliveryScan');

                });

            };

            $scope.gotoOrderList = function () {
                if (db === null) {
                    $state.go('app.orderList');
                    return;
                }

                sql.executeSqlQuery('checkExistingOrder', [], function (signCred) {
                    facilityOfOrders = signCred;
                    if (facilityOfOrders)
                        factory.isOrderExist = facilityOfOrders.length;
                    if (factory.isOrderExist <= 0) {
                        ionicToast.show('Orders are not available. Please download first.', 'bottom', false, 3000);
                        return;
                    }

                    else {
                        sql.executeSqlQuery('getOrderHeaders', [], function (ordersHeader) {
                            $scope.$apply(function () {
                                if (ordersHeader.length == 0) {
                                    ionicToast.show('No Orders found!', 'bottom', false, 3000);
                                    return;
                                } else {
                                    if (factory.isFacilityForOrders) {
                                        checkOrderForFacility('app.orderList');
                                    } else {
                                        $state.go('app.orderList');
                                    }
                                }
                            });
                        });
                    }

                });

            };

            $scope.gotoCreditList = function () {
                if (db === null) {
                    if($scope.CreditOrders){
                        $state.go('app.creditList');
                    }
                    else {
                        ionicToast.show('Credit Orders are not available!', 'bottom', false, 3000);
                    }
                        
                    return;
                }

                sql.executeSqlQuery('checkExistingCredit', [], function (checkCredit) {
                    //ionicToast.show('Please wait...', 'bottom', false, 1000);
                    factory.isCreditExist = checkCredit[0].numberOfCredit;
                });

                if (factory.isFacilityForOrders) {
                    if (factory.FacilityCode) {
                        db.transaction(function (tx) {
                            $ionicLoading.show({
                                template: 'Please wait...'
                            });
                            tx.executeSql(vsprintf(sqlQueries.getCreditListByFacility, [factory.FacilityCode]), [], function (tx, results) {
                                $ionicLoading.hide();
                                factory.dbToJson(results, function (creditsList) {
                                    factory.creditList = creditsList;
                                    if (factory.creditList.length <= 0) {
                                        ionicToast.show('Credit list is not found for selected facility.', 'bottom', false, 3000);
                                    } else {
                                        ionicToast.show('' + factory.isCreditExist + 'Credit' + (factory.isCreditExist > 2 ? 's' : '') + ' found!', 'bottom', false, 3000);
                                        if($scope.CreditOrders){
                                        $state.go('app.creditList');
                                        }
                                        else {
                                            ionicToast.show('Credit Orders are not available!', 'bottom', false, 3000);
                                        }
                                    }

                                });

                            }, function (tx, error) {

                            });
                        });
                    }
                } else
                if($scope.CreditOrders){
                    $state.go('app.creditList');
                    }
                    else {
                        ionicToast.show('Credit Orders are not available!', 'bottom', false, 3000);
                    }
            };

            $scope.delivery = function () {

                if (db === null) {
                    $state.go('app.reliveryOrderList');
                    return;
                }
                sql.executeSqlQuery('checkExistingOrder', [], function (signCred) {
                    facilityOfOrders = signCred;
                    
                    if (facilityOfOrders)
                        factory.isOrderExist = facilityOfOrders.length;
                    if (factory.isOrderExist <= 0) {

                        ionicToast.show('Re-Deliver Orders are not available. Please download first.', 'bottom', false, 3000);
                        return;
                    } else {
                        sql.executeSqlQuery('getRDOrderHeaders', [], function (ordersHeader) {
                            $scope.$apply(function () {
                                if (ordersHeader.length == 0) {
                                    ionicToast.show('No Re-Deliver Orders found!', 'bottom', false, 3000);
                                    return;
                                } else {
                                    if (factory.isFacilityForOrders) {
                                        checkOrderForFacility('app.reliveryOrderList');
                                    } else {
                                        $state.go('app.reliveryOrderList');
                                    }
                                }
                            });
                        });
                    }
                });
            };
            factory.isFacilityForOrders = false;
            $scope.setAppdata = function (facility) {
                console.log("facility", facility);

                sql.executeSqlQuery('checkisRedeliver', [], function (signCred) {
                    console.log("signCred", signCred);
                });

                $scope.isShowDD = false;
                if (facility !== "Facility Select...") {
                    factory.selecteFacility = facility;
                    $scope.selectedFac = facility;
                    // if (factory.isOrderExist > 0) {
                    sql.executeSqlQuery('checkExistingOrder', [], function (signCred) {
                        facilityOfOrders = signCred;
                        if (facilityOfOrders)
                            factory.isOrderExist = facilityOfOrders.length;
                        if (factory.isOrderExist <= 0) {
                            if (facility === 'All')
                                factory.isFacilityForOrders = false;
                            else {
                                facility = $.grep(factory.facilities, function (item, index) {
                                    return facility === item.FacilityName;
                                })[0];
                                if (facility.FacilityCode) {
                                    factory.FacilityCode = facility.FacilityCode;
                                    factory.isFacilityForOrders = true;
                                } else
                                    factory.isFacilityForOrders = false;
                            }
                        }
                    });
                } else {
                    $scope.selectedFac = "Facility Select...";
                }
            };

            $scope.toggleDropDown = function () {
                $scope.isShowDD = !$scope.isShowDD;
            };


        
          //  factory.center_code="DFW";
            if(factory.center_code){
                $scope.CenterCode= factory.center_code;
            }
            else{
                $scope.CenterCode = "";
            }
          
            $scope.centerFlag = false;

            $scope.isShowDD = false;
            $scope.data = {};
            $scope.IncludePhonesChecked = false;
            var loginRes = angular.fromJson(localStorage.getItem("loginRespons"));
            $scope.centers = loginRes.ServiceCenters;
            $scope.operatorName = localStorage.getItem("LoginDetails");

            var sCenter = {};
            $scope.getFacilities = function (serviceCenter) {
                $scope.facilities = [];
                if ($scope.centers)
                    if (serviceCenter !== "") {
                        sCenter = $.grep($scope.centers, function (srvCenters, key) { //Check orderId exist.
                            return srvCenters.CenterName === serviceCenter;
                        })[0];
                        if (sCenter.Facilities[0].IncludePhones == 1) {
                            $scope.IncludePhonesChecked = true;
                            $scope.data.DefaultIncludePhones = '1';
                        }
                        else {
                            $scope.IncludePhonesChecked = false;
                            $scope.data.DefaultIncludePhones = '0';
                        }

                        if (sCenter.Facilities[0].IncludePhones) {
                            delete sCenter.Facilities[0].IncludePhones;
                        }
                        $scope.facilities = sCenter.Facilities;

                    }
            };

            if (loginRes && factory.center_code){
              
                sCenter = $.grep($scope.centers, function (srvCenters, key) { //Check orderId exist.
                    return srvCenters.CenterCode === $scope.CenterCode;
                });
                var center = sCenter;
                console.log("sCenter", sCenter);
                if(sCenter.length > 0){
                    sCenter= sCenter[0];
                    $scope.centerFlag = true;
                    $scope.getFacilities(sCenter.CenterName);
                    $scope.center = sCenter.CenterName;
                    console.log("$scope.center",$scope.center);
                }
            }

            $scope.toggleDropDown = function () {
                if (!$scope.facilities)
                    ionicToast.show('Please select service center!', 'bottom', false, 3000);
                else if ($scope.facilities.length <= 0)
                    ionicToast.show('Please select service center!', 'bottom', false, 3000);
                else
                    $scope.isShowDD = !$scope.isShowDD;
            };
            $scope.searchDropdown = function (text) {
                if (text.length > 0)
                    $scope.isShowDD = true;
                else
                    $scope.isShowDD = true;
            };

            $scope.facilityList = [];
            $scope.selectedFac = 'Please select...';
            $scope.setFacility = function (facility, IncludePhonesChecked) {
                $scope.isShowDD = false;
                if (facility === "") {
                    return false;
                }

                $scope.selectedFac = facility;

                if ($scope.facilityList.filter(function (e) {
                    return e.FacilityName === facility;
                }).length > 0) {
                    return false;
                }

                var facility1 = $.grep(sCenter.Facilities, function (fac, key) { //Check orderId exist.
                    return fac.FacilityName === facility;
                })[0];
                $scope.facilityList[0] = facility1;
                factory.FacilityCode = $scope.facilityList[0].FacilityCode;
                $scope.data.Facilities = [];
                $scope.data.Facilities.push($scope.facilityList[0]);
                $scope.IncludePhonesChecked  = IncludePhonesChecked;                
                if (IncludePhonesChecked) {
                    $scope.data.IncludePhones = '1';
                    }
                else {
                    $scope.data.IncludePhones = '0';
                }
            };

            $scope.minDate = new Date(2010, 12, 1);
            $scope.maxDate = new Date(3000, 12, 31);

            $scope.startDateCallback = function (val) {
                $scope.StartDate = val;
                $scope.data.StartDate = $filter('date')(val, 'MMddyyyy');
            };

            function getMonday(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                d.setDate(diff);
                return d;
            }

         //   $scope.startDateCallback(getMonday(new Date()));

            $scope.endDateCallback = function (val) {
                $scope.EndDate = val;
                $scope.data.EndDate = $filter('date')(val, 'MMddyyyy');
            };
          //  $scope.endDateCallback(new Date());

            if (loginRes.Token)
                $scope.data.Token = loginRes.Token;

            $scope.getOrders = function () {

                if (db !== null)
                    if (!ionicPopups.isOnline) {
                        ionicToast.show('No Internet Connectivity!', 'bottom', false, 3000);
                        return;
                    }
                if (!$scope.data.StartDate) {
                    ionicToast.show('Enter start date.', 'bottom', false, 3000);
                    return;
                }
                if (!$scope.data.EndDate) {
                    ionicToast.show('Enter end date.', 'bottom', false, 3000);
                    return;
                }
                if($scope.data.Facilities){
                    if ($scope.data.Facilities.length <= 0) {
                        ionicToast.show('Select atleast one facility.', 'bottom', false, 3000);
                        return;
                    }
                }
                else{
                    ionicToast.show('Select atleast one facility.', 'bottom', false, 3000);
                    return;
                }
                
                
                
                
                function download(reDelivery) {
                    progressBar();
                    $scope.progressval = 0;
                    var res = reDelivery;
                    startprogress((Number(configConst.RequestTimeout) / 100), res);
                }
                $scope.progressval = 0;
                $scope.stopinterval = null;
                var loadingPopup = null;

                function startprogress(setTime, res) {
                    var deffer = $q.defer();
                    $scope.stopinterval = $interval(function () {
                        $scope.progressval = $scope.progressval + 1;
                        if ($scope.progressval >= 100) {
                            $interval.cancel($scope.stopinterval);
                            loadingPopup.close();
                            deffer.resolve('ok');
                        }
                    }, setTime);

                    if (setTime != configConst.SpeedTimeout) {
                        downloadOrdersFun(res).then(function (promise) {
                            if (promise == 'ok') {
                                $interval.cancel($scope.stopinterval);
                                loadingPopup.close();
                                deffer.resolve('ok');
                                $state.go('app.orderList');
                            }
                            else {
                                console.log(promise);
                            }
                        });
                    }

                    return deffer.promise;
                }

                $rootScope.$on('responseError', function (event, respError) {
                    console.log('responseError', respError);
                    loadingPopup.close();
                    ionicToast.show('Request timeout. Please try again.', 'bottom', false, 3000);
                });

                var isCancel = false;

                function progressBar() {
                    loadingPopup = $ionicPopup.show({
                        template: '<center><h4>Loading orders do not disconnect</h4></center><br><br><progress id="progressbar" max="100" value="{{progressval}}"> </progress>',
                        scope: $scope,
                        cssClass: 'val-popup',
                        buttons: [{
                            text: "Cancel",
                            onTap: function () {
                                isCancel = true;
                                loadingPopup.close();
                                $interval.cancel($scope.stopinterval);
                            }
                        }]
                    });
                }
                signatureChecker();
                function signatureChecker(){
                    sql.executeSqlQuery('checkSignatureCount', [], function (orders) {
                    db.transaction(function (tx) {
                           console.log(orders[0].countSignature);
                           var countSignature = orders[0].countSignature;
                           if(countSignature > 0){
                                confirmDeletePrompt();
                           }
                           else{
                                // download("0");
                               confirmReDelivery();
                           }
                    });
                });
                }


                function confirmDeletePrompt() {
                    var ConfirmPopup = $ionicPopup.show({
                    title:'<i class="fa fa-exclamation-circle fa-lg" style="color: red !important" aria-hidden="true"></i>',
                    template: 'There are orders on this tablet that have NOT been synced.  ALL signatures and credits will be lost.  Do you want to continue?',
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
                    
                    
                    ConfirmPopup.then(function (res) {
                        if(res){
                            ConfirmPopup.close();
                            confirmDelete();
                        }
                        else{
                            ConfirmPopup.close();
                            $state.go('app.dashboard');
                        }
                    });

                    }

                    function confirmDelete() {
                        var ConfirmDeletePopup = $ionicPopup.show({
                        title:'<i class="fa fa-exclamation-circle fa-lg" style="color: red !important" aria-hidden="true"></i>',
                        template: 'All signatures and credits will be lost.  Are you sure you want to continue?',
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
                        
                        
                        ConfirmDeletePopup.then(function (res) {
                            if(res){
                                // download("0");
                                confirmReDelivery();
                            }
                            else{
                                ConfirmDeletePopup.close();
                                $state.go('app.dashboard');
                            }
                        });
    
                        }


                        function confirmReDelivery() {
                            var ConfirmReDeliveryPopup = $ionicPopup.show({
                            title:'<i class="fa fa-exclamation-circle fa-lg" style="color: red !important" aria-hidden="true"></i>',
                            template: 'Include Re-Delivery Orders?',
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
                            
                            
                            ConfirmReDeliveryPopup.then(function (res) {
                                if(res){
                                    download("1");
                                }
                                else{
                                    download("0");
                                }
                            });
        
                            }
                

                // download();

                function downloadOrdersFun(isRedelivery) {
                    var deffer = $q.defer();
                    if (!ionicPopups.isOnline) {
                        ionicToast.show('No Internet Connectivity!', 'bottom', false, 3000);
                        deffer.reject("517");
                        return;
                    }

                    $scope.data.IncludeRedelivery=isRedelivery;
                    $scope.data.IncludeCommissary=factory.includeCommissary;
                    $scope.data.IncludeMCP=factory.includeMCP;
                    // $scope.data.IncludeMCP="0";
                    $scope.data.IncludeTTO=factory.includeTTO;
                    $scope.data.IncludeFacRetail=factory.includeFacRetail;
                    if(factory.includeCommissary=="0"&& factory.includeMCP=="0"){

                    }

                    console.log("Data", $scope.data);

                    service.downloadOrders($scope.data).then(function (response) {

                        console.log(response);

                        if (response.data) {
                            startprogress(Number(configConst.SpeedTimeout)).then(function () {

                                if (isCancel) {
                                    deffer.reject("533");
                                    return;
                                }

                                if (response.status !== 200) {
                                    ionicToast.show('Error occured ' + response.status, 'bottom', false, 3000);
                                    deffer.reject("542");
                                    return;
                                }

                                if (response.data === undefined || response.data === null) {
                                    ionicToast.show('No order found!' + response.status, 'bottom', false, 3000);
                                    deffer.reject("548");
                                    return;
                                }
                                
                                if (response.data[0].DownloadSeq===0) {
                                    ionicToast.show('No order found!' + response.status, 'bottom', false, 3000);
                                    deffer.reject("548");
                                    return;
                                }

                                if (response.data[0].DownloadSeq===(-1)) {
                                    ionicToast.show('Another tablet is processing, Try again later!' + response.status, 'bottom', false, 3000);
                                    deffer.reject("548");
                                    return;
                                }
                                

                                if (db !== null) {

                                    db.transaction(function (tx) {
                                        tx.executeSql(sqlQueries.deleteUnProcessedItems, [], function (results) {
                                            tx.executeSql(sqlQueries.truncateOrderHeader, [], function (results) {
                                                tx.executeSql(sqlQueries.deleteServiceCentre, [], function (tx3, resultsdeleteService) { });
                                            });
                                        });

                                    });


                                    var flag = 0;
                                    var flag2 = 0;
                                    var flag3 = 0;


                                    sql.executeSqlQuery('getOrders', [], function (orders) {

                                        db.transaction(function (tx) {
                                            for (var z = 0; z < response.data.length; z++) {
                                                var orderHeader = response.data[z].OrderHeader;
                                                var itemDetail = response.data[z].OrderDetails;
                                                var isRedeliver;
                                                // var redeliverHeader = response.data[z].RedeliverHeader;
                                                // var redeliverDetails = response.data[z].RedeliverDetails;

                                                if (response.data[z].DownloadSeq > 0) {
                                                    tx.executeSql('INSERT INTO SignaturesCredential (FacilityCode) VALUES (?)', [response.data[z].FacilityCode]);
                                                    
                                                    //OrderDetails

                                                    if (itemDetail != null && orderHeader != null) {
                                                        flag = flag + 1;
                                                        isRedeliver = 0;

                                                        for (var i = 0; i < orderHeader.length; i++) {
                                                            tx.executeSql('INSERT INTO OrderHeader (DeliveryID , ResID , OrderReceipt, Confirmation,isOrdered,FacilityCode,DownloadSeq,isRedeliver,isOrderRedelivered,isCredit,isCreditOnce) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                                                                [orderHeader[i].DeliveryID, orderHeader[i].ResID, orderHeader[i].OrderReceipt, '*** Undelivered', 0, response.data[z].FacilityCode, response.data[z].DownloadSeq, isRedeliver, 0, 0, 0]);
                                                        }
                                                    }
                                                    else {
                                                        deffer.reject("615");
                                                    }
                                           
                                                    if (itemDetail != null && orderHeader != null) {
                                                        flag2 = flag2 + 1;
                                                        for (var j = 0; j < itemDetail.length; j++) {
                                                            for(var x=0;x<itemDetail[j].Items.length;x++){
                                                                // (str.indexOf(' ') >= 0)?str.replace(/\s+/g, "-"):str
                                                                var locationItem = (itemDetail[j].Location.trim().length > 0 && itemDetail[j].Location.indexOf('') >= 0)?itemDetail[j].Location.replace(/\s+/g, "-"):itemDetail[j].Location;
                                                                tx.executeSql('INSERT INTO ItemDetail (ResID, DeliveryID, FirstName, LastName, Location, OrderSource, ItemNumber , ItemName, OrderQuantity, IsPAK, InReceipts, itemCount, credit, redelivery) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [itemDetail[j].ResID, itemDetail[j].DeliveryID, itemDetail[j].FirstName, itemDetail[j].LastName, locationItem, itemDetail[j].OrderSource, itemDetail[j].Items[x].ItemNumber, itemDetail[j].Items[x].ItemName, itemDetail[j].Items[x].OrderQuantity, itemDetail[j].Items[x].IsPAK, itemDetail[j].Items[x].InReceipts, itemDetail[j].Items.length, 0, 0]);        
                                                            }
                                                            }
                                                    }
                                                    else {
                                                        deffer.reject("636");
                                                    }

                                                    //ReDelivery Items

                                                //     if(isRedelivery=="1"){
                                                    
                                                //     if (redeliverDetails != null && redeliverHeader != null) {
                                                //         flag = flag + 1;
                                                //         isRedeliver = 1;

                                                //         for (var i = 0; i < redeliverHeader.length; i++) {
                                                //             tx.executeSql('INSERT INTO OrderHeader (DeliveryID , ResID , OrderReceipt, Confirmation,isOrdered,FacilityCode,DownloadSeq,isRedeliver,isOrderRedelivered,isCredit,isCreditOnce) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                                                //                 [redeliverHeader[i].DeliveryID, redeliverHeader[i].ResID, redeliverHeader[i].OrderReceipt, '*** Undelivered', 0, response.data[z].FacilityCode, response.data[z].DownloadSeq, isRedeliver, 0, 0, 0]);
                                                //         }
                                                //     }
                                                //     else {
                                                //         deffer.reject("615");
                                                //     }
                                           
                                                //     if (redeliverDetails != null && redeliverHeader != null) {
                                                //         flag2 = flag2 + 1;
                                                //         for (var j = 0; j < redeliverDetails.length; j++) {
                                                //             for(var x=0;x<redeliverDetails[j].Items.length;x++){
                                                //                 // (str.indexOf(' ') >= 0)?str.replace(/\s+/g, "-"):str
                                                //                 var locationItem = (redeliverDetails[j].Location.trim().length > 0 && redeliverDetails[j].Location.indexOf('') >= 0)?redeliverDetails[j].Location.replace(/\s+/g, "-"):redeliverDetails[j].Location;
                                                //                 tx.executeSql('INSERT INTO ItemDetail (ResID, DeliveryID, FirstName, LastName, Location, OrderSource, ItemNumber , ItemName, OrderQuantity, IsPAK, InReceipts, itemCount, credit, redelivery) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [redeliverDetails[j].ResID, redeliverDetails[j].DeliveryID, redeliverDetails[j].FirstName, redeliverDetails[j].LastName, locationItem, redeliverDetails[j].OrderSource, redeliverDetails[j].Items[x].ItemNumber, redeliverDetails[j].Items[x].ItemName, redeliverDetails[j].Items[x].OrderQuantity, redeliverDetails[j].Items[x].IsPAK, redeliverDetails[j].Items[x].InReceipts, redeliverDetails[j].Items.length, 0, 0]);        
                                                //             }
                                                //             }
                                                //     }
                                                //     else {
                                                //         deffer.reject("636");
                                                //     }

                                                // }



                                                    
                                                }
                                                else {
                                                    deffer.reject("684");
                                                }


                                            }



                                            var facilityCode = [];
                                            for (var a = 0; a < response.data.length; a++) {
                                                var fac = "'" + response.data[a].FacilityCode + "'";
                                                facilityCode.push(fac);
                                            }
                                            tx.executeSql(vsprintf(sqlQueries.getFacilitiesByFcode, [facilityCode]), [], function (tx, rs) {
                                                var result = [];
                                                for (var i = 0; i < rs.rows.length; i++) {
                                                    var row = rs.rows.item(i);
                                                    result[i] = row;
                                                }
                                                factory.isSync = false;
                                                factory.facilities = result;
                                                console.log(result);
                                            });

                                            if ((flag > 0 && flag2 > 0) || (flag3 > 0 && flag2 > 0)) {
                                                db.transaction(function (tx) {
                                                    tx.executeSql(sqlQueries.updateYesSync, [], function (isSync) {
                                                        console.log(isSync);
                                                    }, function (isSync) {
                                                        console.log(isSync);
                                                    });
                                                });
                                                factory.ordersByFacility = [];
                                                factory.isFacilityForOrders = false;
                                                deffer.resolve("ok");

                                            } else {
                                                $scope.$apply(function () {
                                                    ionicToast.show('Orders are not found for selected facilities!', 'bottom', false, 3000);
                                                });

                                                deffer.reject("726");

                                            }

                                            var facilityOfOrders;
                                            sql.executeSqlQuery('checkExistingOrder', [], function (signCred) {
                                                facilityOfOrders = signCred;
                                                if (facilityOfOrders)
                                                    factory.isOrderExist = facilityOfOrders.length;
                                                if (factory.isOrderExist > 0) {
                                                    factory.facilities = facilityOfOrders;
                                                    sql.executeSqlQuery('checkExistingCredit', [], function (checkCredit) {
                                                        factory.isCreditExist = checkCredit[0].numberOfCredit;
                                                        sql.executeSqlQuery('checkSyncExistingOrder', [], function (orders) {
                                                            factory.isSyncOrderExist = orders[0].numberOfResID;
                                                            factory.selecteFacility = factory.selecteFacility ? factory.selecteFacility : 'Facility Select...';

                                                        });
                                                    });
                                                } else {
                                                    factory.isSync = true;
                                                }
                                            });

                                        });
                                    });
                                } else {
                                    deffer.reject("775");
                                }
                            });
                        } else {
                            deffer.reject("781");
                        }

                    });

                    return deffer.promise;
                }
            };
            $scope.isDefault = false;
            $scope.removeFac = function (index) {
                //$scope.isDefault = true;
                $scope.facilityList.splice(index, 1);
            };

            $scope.$on('$routeChangeStart', function (scope, next, current) {
                $scope.facilityList = [];
                $scope.minDate = new Date();
                $scope.maxDate = new Date();
                $scope.data = {};
                console.log('routeChangeStart');
            });

            $scope.$on("$ionicView.enter", function (event, data) {
                factory.menuDashboard=false;
            });
        }]);
})();