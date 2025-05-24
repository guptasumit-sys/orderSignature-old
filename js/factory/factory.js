// factory module
(function () {
    angular.module('factories', [])
        .factory('ionicPopups', ['$ionicPopup', ionicPopups])
        .factory('getServiceUrl', [getServiceUrl])
        .factory('sql', ['sqlQueries', sql])
        // .factory('timeoutHttpInterceptor', ['configConst', timeoutHttpInterceptor])
        .factory('factory', [factory])


/*--------------------application configuration for app build when development will be false in constant.js-----------------------------*/
.factory('EnvConfig', ['$q', function ($q) {

    return {

       getEnvConfig: function() {
          console.log("here");
          var q = $q.defer();
          envConfig.getEnvConfig(null, function(msg) {q.resolve(msg);}, function(msg) {console.log("Failed to retrieve config data: " + msg); q.reject("Error retrieving config values.");});
            //hello.greet("World", function(msg) {}, function(msg) {console.log("Failed to retrieve config data: " + msg);});

            return q.promise;
        },

         getCustConfig: function() {
          console.log("here at custConfig");
          var q = $q.defer();
          envConfig.getCustConfig(null, function(msg) {q.resolve(msg);}, function(msg) {console.log("Failed to retrieve cust config data: " + msg); q.reject("Error retrieving config values.");});
            //hello.greet("World", function(msg) {}, function(msg) {console.log("Failed to retrieve config data: " + msg);});

            return q.promise;
        }


    };
    }]);


    function ionicPopups($ionicPopup) {
        return {
            ionicPopup: function (title) {
                $ionicPopup.alert({ title: title });
            }
        };
    }

    function getServiceUrl() {
        return {
             //serviceUrl: 'https://fusion1.tsgsoft.com/TabTesterAPI/api/CommTabletDelivery/',
        };
    }

    function sql(sqlQueries) {
        return {
            executeSqlQuery: function (query, params, callBack) {
                var result = [];
                var queryValue = query.split('#');
                // var value = queryValue[1] ? "'" + queryValue[1] + "'" : '';
                var value = queryValue[1] ?  queryValue[1] + '' : '';
                if (db !== null)
                    db.transaction(function (tx) {
                        tx.executeSql(sqlQueries[queryValue[0]] + value, params, function (tx, rs) {
                            for (var i = 0; i < rs.rows.length; i++) {
                                var row = rs.rows.item(i);
                                result[i] = row;
                            }
                            callBack(result);
                        });
                    });
            }
        };
    }

    // /*-----------------------request timeout for cobra constant variable cobraConstant.RequestTimeout------------------------------------*/
    // function timeoutHttpInterceptor(configConst) {
    //     return {
    //         'request': function (config) {
    //             config.timeout = configConst.RequestTimeout;
    //             // console.log('called');
    //             return config;
    //         }
    //     };https://fusion1.tsgsoft.com/TabTesterAPI/api/CommTabletDelivery/
   // 
    // 
    // }
    function factory() {
        return {
            rD:0,
            popupsCredit:[],
            creditListCancelSignature:[],
            user:'test',
            authToken:'',
            isAuthenticated:false,
            username:'',
            password:'',
            adminlogin:false,
            orderListSelect:'',
            menuDashboard: true,
            center_code:'',//'SRQ',
            serviceUrl: '',//'https://fusion1.tsgsoft.com/tabtesterapierr/api/commtabletdelivery/',// 'https://fusion1.tsgsoft.com/tabtesterapi/api/commtabletdelivery/',//'https://fusion1.tsgsoft.com/TabDevAPI/api/CommTabletDelivery/',//https://fusion20.trinityservicesgroup.com/TabTestAPI/api/CommTabletDelivery/',//'https://fusion20.trinityservicesgroup.com/TabTestAPI/api/CommTabletDelivery/'
            dbToJson: function (rs, callBack) {
                var result = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    var row = rs.rows.item(i);
                    result[i] = row;
                }
                callBack(result);
            }
        };
    }


})();
