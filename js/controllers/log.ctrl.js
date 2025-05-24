(function () {
    angular.module('starter.controllers')
    .controller('logCtrl', ['$scope', 'sql', '$ionicPopup', 'ionicToast','factory', function ($scope, sql, $ionicPopup, ionicToast,factory) {
        $scope.$on("$ionicView.enter", function (event, data) {
            factory.menuDashboard=true;
            sql.executeSqlQuery('getLog', [], function (lg) {
                // let isValidMail = false
                // let msgForInvalidMail=''
                let checkMail = {
                    isValidMail : false,
                    msgForInvalidMail : ''
                }
                $scope.log = lg;
                $scope.sendTo = '';

                $scope.sendMail = function (sendTo) {
                    sendTo = sendTo.split(',');
                    if (sendTo[0].length>0) {
                    //    isValidMail = sendTo.includes("keefegroup.com");
                    for(let i =0 ;i<sendTo.length;i++){
                        if(sendTo[i].split('@').length==2 && sendTo[i].split('@')[1]=="keefegroup.com"){
                            if(i == sendTo.length-1){
                                checkMail.isValidMail = true;
                            }
                        }else{
                            checkMail.isValidMail = false;
                            checkMail.msgForInvalidMail = `${sendTo[i]} is invalid Email`
                            break;
                        }
                    }
                                       
                     //   sendTo.push('ganesh.kumar@trinityservicesgroup.com');
                    } else {
                       // sendTo = ['ganesh.kumar@trinityservicesgroup.com'];
                       checkMail.isValidMail = false;
                       checkMail.msgForInvalidMail='No any valid Email found !';
                    }
                    // let emailBodyTemp = createEMailTemplate($scope.log);

                    // var parser = new DOMParser();
	                //  var doc = parser.parseFromString(emailBodyTemp, 'text/html');
                    //  document.body.appendChild(doc.body.childNodes[0]);

                    //  html2canvas(document.getElementById('testme')).then(function(canvas) 
                    // {
                    //     var imageData = canvas.toDataURL(1);
                    //     let node = document.getElementById('testme');
                    //     node.parentElement.removeChild(node);
                    //     let data = "base64:SyncLog.png//"+ imageData.split(',')[1];
                    //     sendMail(data, sendTo);
                    // });

                    // var file = new File([JSON.stringify($scope.log, null, "\t")], "foo.txt", {
                    //     type: "text/plain",
                    //   });
                    // let responseLog =[];
                    // $scope.log.forEach(log => {
                    //     if (isValidJson(log.Response)) {
                    //         let lo = angular.fromJson(log.Response);
                    //         if(isValidJson(lo.ResidentResults)) {
                    //             let lowRes = angular.fromJson(lo.ResidentResults);
                    //             if(lowRes.length > 0){
                    //                 lo.ResidentResults = JSON.stringify(lo.ResidentResults, null, "\t");
                    //                 responseLog.push(lo);
                    //             }
                    //         }
                    //     }
                    // });

                    if( $scope.log.length > 0 && checkMail.isValidMail){
                        sendMail(JSON.stringify( $scope.log, null, "\t"),sendTo);
                        checkMail.isValidMail = false;
                    }else{
                        if(!checkMail.isValidMail){
                            ionicToast.show(checkMail.msgForInvalidMail, 'bottom', false, 3000);
                            checkMail.isValidMail = false;
                            checkMail.msgForInvalidMail = '';
                        }
                       if($scope.log.length < 1){
                        ionicToast.show('No any log found', 'bottom', false, 3000);
                        checkMail.isValidMail = false;
                        checkMail.msgForInvalidMail = '';
                       }
                    }
                     
                };

                function sendMail(mailBody, sendTo) {
                    console.log('mail');
                    if(cordova.plugins.email){
                        cordova.plugins.email.open({
                            to:          sendTo, // email addresses for TO field
                            cc:          [], // email addresses for CC field
                            bcc:         [], // email addresses for BCC field
                            attachments: [], // file paths or base64 data streams
                            subject:    "OrderSignature log", // subject of the email
                            body:       mailBody, // email body (for HTML, set isHtml to true)
                            isHtml:    false, // indicats if the body is HTML or plain text
                        }, function (error) {
                            console.log('email view dismissed', error);
                            ionicToast.show('Email view dismissed!', 'bottom', false, 3000);
                        }, $scope);
    
                    }
                   
                    // cordova.plugins.email.isAvailable(
                    //     function (isAvailable) {
                    //         console.log('isAvailable:=>' , isAvailable);
                        
                    //     }
                    // );


                    
                }
                 function createEMailTemplate(logs){
                     var htmlBody ="<!DOCTYPE html><html><body><div id='testme'>";
                      logs.forEach(log => {
                          htmlBody += createEMailTemplateLog(log);
                      });
                      return htmlBody +="</div></body></html>";
                 }


                function createEMailTemplateLog(log){
                    let htmlString = "<h3>Sync Error Log: </h3><p style='color: #797979'>DownloadSeq: "+log.DownloadSeq+"</p><p style='color: #797979'>FacilityCode: "+log.FacilityCode+"</p><p style='color: #797979'>TotalDownloaded: "+log.TotalDownloaded+"</p><p style='color: #797979'>TotalReceivedValid:"+log.TotalReceivedValid+"</p><p style='color: #797979'>TotalSignatures:"+log.TotalSignatures+"</p><p style='color: #797979'>RequestTime:"+log.RequestTime+"</p>";
                    htmlString += "<table style='font-family: Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;'><tr><th style='border: 1px solid #ddd;padding: 8px; padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #949494;color: white;'>ResID</th><th style='border: 1px solid #ddd;padding: 8px; padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #949494;color: white;'>Message</th></tr><tbody>";
                    if (log.ResidentResults) {
                        for (var i = 0; i < log.ResidentResults.length; i++) {
                            htmlString += "<tr><td style='border: 1px solid #ddd;padding: 8px;'>" + log.ResidentResults[i].ResID + "</td><td style='border: 1px solid #ddd;padding: 8px;'> " + log.ResidentResults[i].Message + "</td></tr>";
                        }
                    } else if (log.CreditList) {
                        for (var j = 0; j < log.CreditList.length; j++) {
                            htmlString += "<tr><td style='border: 1px solid #ddd;padding: 8px;'>" + log.CreditList[i].ResID + "</td><td style='border: 1px solid #ddd;padding: 8px;'> " +  angular.toJson(log.CreditList[j].ItemList) + "</td></tr>";
                        }
                }
                htmlString +="</tbody></table>";
                return htmlString
            }


                function isValidJson(jsonData) {
                    try {
                        angular.fromJson(jsonData);
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                $scope.logDetail = function (log, RequestTime) {
                    var temp = '';
                    var template = '';
                    var header ="ResidentResults";
                    var errorMessage = "";
                    
                    if (log) {
                        if (log !== "null") {
                            if (isValidJson(log)) {
                                log = angular.fromJson(log);
                                if(log.data){
                                    errorMessage = log.data
                                }
                                if (log.ResidentResults) {
                                    header ="ResidentResults";
                                    for (var i = 0; i < log.ResidentResults.length; i++) {
                                        temp += '<tr style="border: 1px solid #949494;"><td>' + log.ResidentResults[i].ResID + '</td><td style="padding-left:5px" > ' + log.ResidentResults[i].Message + '</td></tr>';
                                    }
                                } else if (log.CreditList) {
                                    header ="CreditList";
                                    for (var j = 0; j < log.CreditList.length; j++) {
                                        temp += '<tr style="border: 1px solid #949494;"><td>' + log.CreditList[j].ResID + '</td><td style="padding-left:5px" > ' + innetTable(log.CreditList[j].ItemList) + '</td></tr>';
                                    }
                                } else if (log.RedeliverList) {
                                    header ="RedeliverList";
                                    for (var k = 0; k < log.RedeliverList.length; k++) {
                                        temp += '<tr style="border: 1px solid #949494;"><td>' + log.RedeliverList[k].ResID + '</td><td style="padding-left:5px" > ' + angular.toJson(log.RedeliverList[k].ItemList) + '</td></tr>';
                                    }
                                }
                                template = '<div class="col"><div class="order_details"><p ng-show =' + (log.DownloadSeq === undefined ? false : true) + '>DownloadSeq: ' + log.DownloadSeq + '</p><p ng-show =' + (log.FacilityCode === undefined ? false : true) + '>FacilityCode: ' + log.FacilityCode + '</p><p ng-show =' + (log.TotalDownloaded === undefined ? false : true) + '>TotalDownloaded: ' + log.TotalDownloaded + '</p><p ng-show =' + (log.TotalReceivedValid === undefined ? false : true) + '>TotalReceivedValid:' + log.TotalReceivedValid + '</p><p ng-show =' + (log.TotalSignatures === undefined ? false : true) + '>TotalSignatures:' + log.TotalSignatures + '</p><p ng-show =' + (RequestTime === undefined ? false : true) + '>RequestTime:' + RequestTime + '</p><p ng-show =' + (log.ResultMessage === undefined ? false : true) + '>ResultMessage:' + log.ResultMessage + '</p><p ng-show =' + (errorMessage === "" ? false : true) + '>Error Message: </p><span ng-show =' + (errorMessage === "" ? false : true) + '>' + errorMessage + '</span><h3>' + header+'</h3><br><table style="margin: auto;width: 100%;"><thead style="color: white;background-color: #9cb0c4;border: 1px solid #949494;"><tr style="border: 1px solid #949494;"><th>ResID</th><th>Message</th></tr></thead><tbody>' + temp + '</tbody> </table>';
                            } else
                                template = log;
                        } else
                            template = log;
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: 'Order Synced log',
                        template: template,
                        cssClass: 'sync-popup'
                    });
                };

                function innetTable(ItemList){
                    let _temp="";
                    ItemList.forEach(element => {
                        _temp += '<tr style="border: 1px solid #949494;"><td>' + element.ItemNumber + '</td><td style="padding-left:5px" > ' + element.ItemResultMessage + '</td></tr>';
                    });
                    
                    let table = '<table style="margin: auto;width: 100%;"><thead style="color: white;background-color: #9cb0c4;border: 1px solid #949494;"><tr style="border: 1px solid #949494;"><th>Item#</th><th>Message</th></tr></thead><tbody>' + _temp + '</tbody> </table>' 
                     return table;
                }
              
            });

            $scope.ClearLog = function(){
                sql.executeSqlQuery('clearLog', [], function (lg) {
                    ionicToast.show("Log Cleared", 'bottom', false, 4000);
                    $scope.log=[];
                })   
            }
        });

    }]);
})();