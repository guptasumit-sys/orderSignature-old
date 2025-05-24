(function () {
    angular.module('starter.value', [])
        .value('sqlQueries', {
            //AppCtrl
            //syncOrderHeader: "SELECT DISTINCT ResID, Confirmation , DownloadSeq FROM OrderHeader WHERE FacilityCode = '%s' group by ResID",
            // syncOrderHeader: "SELECT ResID,DeliveryID, Confirmation , DownloadSeq FROM OrderHeader WHERE FacilityCode = '%s'",
            syncOrderHeader: "SELECT distinct ( ResID || DeliveryID) as mergedata ,ResID,DeliveryID, Confirmation , DownloadSeq FROM OrderHeader WHERE isOrdered <> 0 AND FacilityCode = '%s'",
            
            syncSignatureMetadata: 'SELECT DISTINCT FacilityCode FROM SignaturesCredential group by FacilityCode',
            //dashboardCtrl
            checkSyncExistingOrder: "SELECT count(ResID) as numberOfResID FROM OrderHeader WHERE isOrdered = '1'",
            checkExistingOrder: 'SELECT distinct oh.FacilityCode, f.IncludePhones, f.FacilityName FROM OrderHeader as oh join Facilities as f on oh.FacilityCode = f.FacilityCode',
            checkExistingCredit: "SELECT count(isOrdered) numberOfCredit FROM orderheader WHERE isOrdered = '2'",
            
            checkisRedeliver:"SELECT isRedeliver from Facilities WHERE FacilityName = '%s' ",


            //downloadCtrl
            checkSignatureCount: "SELECT count(confirmation) as countSignature from OrderHeader WHERE isOrdered>='1'",
            
            truncateSignCredential: 'DELETE FROM SignaturesCredential',
            truncateOrderHeader: "DELETE FROM OrderHeader ",//WHERE isOrdered = 0
            deleteUnProcessedItems: "DELETE FROM ItemDetail ",//WHERE ResID IN (SELECT ResID from OrderHeader WHERE isOrdered = 0)
            truncateItemDetail: 'DELETE FROM ItemDetail',
            storeSignCredential: 'INSERT INTO SignaturesCredential (FacilityCode) VALUES (?)',
            //storeOrderHeader: 'INSERT INTO OrderHeader (OrderID , ResID , LastName , FirstName , Location, Confirmation,isOrdered,FacilityCode, DownloadSeq) VALUES (?,?,?,?,?,?,?,?,?)',
            storeItemDetail: 'INSERT INTO ItemDetail (ResID, ItemNumber ,ItemName, OrderQuantity, IsPAK, InReceipts,itemCount, credit, redelivery) VALUES (?,?,?,?,?,?,?,?,?)',
            truncateFacilities: 'DELETE FROM Facilities',
            truncateServiceCenters: 'DELETE FROM ServiceCenters',
            storeServiceCenters: 'INSERT INTO ServiceCenters (CenterCode , CenterName) VALUES (?,?)',
            storeFacilities: 'INSERT INTO Facilities (FacilityCode , FacilityName , ServiceCenter, IncludePhones, IsRedeliver ) VALUES (?,?,?,?,?)',
            getFacilitiesByFcode: 'select FacilityName ,FacilityCode from  Facilities where FacilityCode IN (%s)',
            //orderCtrl
            // getOrderHeaders:"SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isRedeliver, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID group by Id.ResID ",
            // getOrderHeadersForScan: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isRedeliver, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID group by Id.ResID",
            // getOrderHeadersByFacility: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered, Oh.FacilityCode,Oh.DownloadSeq, Oh.isRedeliver, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.FacilityCode = '%s' group by Id.ResID",
            
            getOrderHeaders:"SELECT DISTINCT Oh.DeliveryID , Oh.ResID , Id.LastName , Id.FirstName , Id.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isRedeliver, Oh.isOrderRedelivered, Oh.isCredit, Oh.isCreditOnce  FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID  AND Id.DeliveryID = Oh.DeliveryID",
            // getOrderHeadersForScan: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isRedeliver, Oh.isOrderRedelivered, Oh.isCredit, Oh.isCreditOnce FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID",
            // getOrderHeadersByFacility: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered, Oh.FacilityCode,Oh.DownloadSeq, Oh.isRedeliver, Oh.isOrderRedelivered, Oh.isCredit, Oh.isCreditOnce FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.FacilityCode = '%s'",
            getOrderGroup1:"Select substr(Location,1,1) as loc from ItemDetail where length(location)<6 group by substr(Location,1,1)",
            getOrderGroup2:"Select substr(Location,1,6) as loc from ItemDetail where length(location)>6 group by substr(Location,1,6)",
            //orderDetailsCtrl
            getSingleOrderHeader: "SELECT DeliveryID , ResID ,OrderReceipt, Confirmation,isOrdered, isOrderRedelivered,isRedeliver FROM OrderHeader WHERE ResID = '%s' AND DeliveryID = %s",
            //getSingleOrderHeader: "SELECT OrderID , ResID , LastName , FirstName , Location, Confirmation,isOrdered, isOrderRedelivered,isRedeliver FROM OrderHeader WHERE ResID = '%s' AND OrderID = '%s'",
            //getSingleItemDetail: "SELECT ResID, ItemNumber ,ItemName, OrderQuantity, IsPAK, InReceipts, itemCount, credit,redelivery FROM ItemDetail WHERE ResID = '%s' ORDER BY ItemNumber",
            getSingleItemDetail: "SELECT ResID , FirstName ,  LastName , Location, ItemNumber ,ItemName, OrderQuantity, IsPAK, InReceipts, itemCount, credit,redelivery, OrderSource FROM ItemDetail WHERE ResID = '%s' AND DeliveryID = %s ORDER BY ItemNumber",

            getSingleCreditDetail: "SELECT ResID, ItemNumber ,FirstName, Location, LastName,  ItemName, OrderQuantity, IsPAK, InReceipts, itemCount, credit,redelivery FROM ItemDetail WHERE ResID = '%s' AND DeliveryID = '%s' ORDER BY OrderQuantity DESC",
            
            //scanCtrl
            singleOrdrHdrWithItemCountNew: 'SELECT DISTINCT Oh.DeliveryID , Oh.ResID , Id.LastName , Id.FirstName , Id.Location,Id.itemCount FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID AND Id.DeliveryID = Oh.DeliveryID WHERE Oh.OrderReceipt=?',
            singleOrdrHdrWithItemCount: 'SELECT DISTINCT Oh.DeliveryID , Oh.ResID , Id.LastName , Id.FirstName , Id.Location,Id.itemCount FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID AND Id.DeliveryID = Oh.DeliveryID WHERE Oh.isOrdered IS NOT "1" AND Oh.OrderReceipt=?',//LIKE ?||"%"' ,//                    = %s",
            checkOrdrByFacility: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.isOrdered IS NOT '1' AND Oh.FacilityCode = '%s' AND Oh.OrderID = '%s'",
            
            updateOrders: "UPDATE OrderHeader set Confirmation ='%s',isOrdered='%s',isOrderRedelivered= '%s',isRedeliver= '%s',isCredit='%s' WHERE ResID ='%s' AND DeliveryID=%s",
            updateOrdersWithOnceCredit: "UPDATE OrderHeader set Confirmation ='%s',isOrdered='%s',isOrderRedelivered= '%s',isRedeliver= '%s',isCredit='%s', isCreditOnce='%s' WHERE ResID ='%s' AND DeliveryID=%s",
            
            //updateOrders: "UPDATE OrderHeader set Confirmation ='%s',isOrdered= %s, isOrderRedelivered= %s WHERE ResID ='%s'",
            getCreditList: "SELECT  iD.DeliveryID,iD.ResID,iD.Location, sum(iD.credit) as CreditItems from itemDetail as iD  WHERE iD.credit >0 GROUP BY resID ORDER BY iD.DeliveryID ASC",
            getCreditListByFacility: "SELECT Oh.DeliveryID,oh.ResID, sum(iD.credit) as CreditItems FROM orderHeader as oH LEFT JOIN itemDetail as iD on iD.ResID = Oh.ResID WHERE iD.credit >0 AND oH.isOrdered= '2' AND oh.FacilityCode = '%s'  AND iD.DeliveryID = oH.DeliveryID GROUP BY Oh.DeliveryID ORDER BY Oh.DeliveryID ASC",
            updateCredit: "UPDATE ItemDetail set credit = '%s' WHERE ResID = '%s' AND DeliveryID = %s AND ItemNumber = %s",
            getCredits: "SELECT DISTINCT Id.ResID, Id.ItemNumber, Id.credit as CreditQuantity, Id.IsPAK, Id.InReceipts, oH.FacilityCode, oH.DownloadSeq FROM orderHeader as oH JOIN ItemDetail AS Id ON Id.ResID = oH.ResID AND Id.DeliveryID = oH.DeliveryID where oH.isOrdered = '2' AND Id.credit >'0' AND oH.FacilityCode = '%s'",
            getCreditsCount: "SELECT Count (DISTINCT Id.ResID)  as numberOfResID FROM orderHeader as oH JOIN ItemDetail AS Id ON Id.ResID = oH.ResID where oH.isOrdered = '2' AND Id.credit >0 AND oH.FacilityCode = ",// 'HOT' ",
           
            getRedeliver: "SELECT DISTINCT Id.ResID, Id.ItemNumber, Id.redelivery as RedeliverQuantity, Id.IsPAK, Id.InReceipts, oH.FacilityCode, oH.DownloadSeq FROM orderHeader as oH JOIN ItemDetail AS Id ON Id.ResID = oH.ResID where oH.isOrderRedelivered = '2' AND Id.redelivery >0 AND oH.FacilityCode = '%s'",
            getRedeliverCount:  "SELECT Count (DISTINCT Id.ResID) as numberOfResID FROM orderHeader as oH JOIN ItemDetail AS Id ON Id.ResID = oH.ResID where oH.isOrderRedelivered = '2' AND Id.redelivery >0 AND oH.FacilityCode =",// 'HOT'",
           
            //getCredits: "SELECT ResID, FacilityCode, DownloadSeq FROM orderHeader where isOrdered = '2' AND FacilityCode = '%s'",
            //getCreditByResID: "SELECT Id.ItemNumber, Id.credit as CreditQuantity, Id.IsPAK, Id.InReceipts FROM ItemDetail AS Id where Id.credit >0 AND ResID = '%s'",

             updateRedelivery: "UPDATE ItemDetail set redelivery = '%s' WHERE ResID = '%s' AND DeliveryID = %s AND ItemNumber = %s",


            log: "INSERT INTO log (API, RequestTime, FacilityCode, DownloadSeq,Request, Response, ResponseTime) VALUES (?,?,?,?,?,?,?)",
            //deleteOrderHeader: "DELETE FROM OrderHeader WHERE ResID IN (%s)",
            deleteOrderHeader: "DELETE FROM OrderHeader",
            //deleteItemDetails: "DELETE FROM ItemDetail WHERE ResID IN (%s)",
            deleteItemDetails: "DELETE FROM ItemDetail",
            getOrders: "SELECT DeliveryID , ResID, DownloadSeq FROM OrderHeader",
            deleteServiceCentre: "DELETE FROM SignaturesCredential WHERE FacilityCode NOT IN (SELECT distinct facilitycode from OrderHeader)",
            getLog: "SELECT API,RequestTime,FacilityCode, DownloadSeq,Request, Response, ResponseTime FROM log",
            // updateLog: "UPDATE log set Response = '%s', ResponseTime = '%s' WHERE FacilityCode = '%s' AND DownloadSeq = %s",
            getIsSync: "SELECT isSync FROM checkSync",
            updateNoSync: "UPDATE checkSync set isSync='0'",
            updateYesSync: "UPDATE checkSync set isSync='1'",
            clearLog:"Delete from log",

            //reliveryOrderCtrl
            // getRedeliveryOrderHeaders:"SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.isRedeliver = 1 group by Id.ResID ",
            // getRedeliveryOrderHeadersForScan: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.isRedeliver= 1",
            // getRedeliveryOrderHeadersByFacility: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered, Oh.FacilityCode,Oh.DownloadSeq, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.FacilityCode = '%s' AND Oh.isRedeliver = 1 ",
            
            getRedeliveryOrderHeaders:"SELECT DISTINCT Oh.DeliveryID , Oh.isRedeliver, Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.isRedeliver = 1 OR Oh.isRedeliver = '1'",
            getRDOrderHeaders:"SELECT DISTINCT Oh.DeliveryID , Oh.ResID , Id.LastName , Id.FirstName , Id.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isRedeliver, Oh.isOrderRedelivered, Oh.isCredit, Oh.isCreditOnce  FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID  AND Id.DeliveryID = Oh.DeliveryID WHERE Oh.isRedeliver = 1 OR Oh.isRedeliver = '1'",
            getRedeliveryOrderHeadersForScan: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered,Oh.FacilityCode, Oh.DownloadSeq, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.isRedeliver= 1 OR Oh.isRedeliver = '1'",
            getRedeliveryOrderHeadersByFacility: "SELECT DISTINCT Oh.OrderID , Oh.ResID , Oh.LastName , Oh.FirstName , Oh.Location,Id.itemCount, Oh.isOrdered, Oh.FacilityCode,Oh.DownloadSeq, Oh.isOrderRedelivered, Oh.isCredit FROM OrderHeader As Oh LEFT JOIN ItemDetail As Id on Id.ResID = Oh.ResID WHERE Oh.FacilityCode = '%s' AND Oh.isRedeliver = 1 OR Oh.isRedeliver = '1' ",
            
        
        });
})();

