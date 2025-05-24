(function () {
    angular.module('starter.config', [])
        .constant('configConst', {
            RequestTimeout: 30000,
            appVersion: '1.0.0.2',
            SpeedTimeout : 6,
            DefaultPassword : 'password'
            });
})();