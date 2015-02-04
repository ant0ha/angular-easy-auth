'use strict';

angular.module('ngEasyAuth', [])

    // Main service
    .provider('EasyAuth', function () {

        var config = {
            host: '/',
            loginUrl: 'login.json',
            logoutUrl: false,
            loggedinUrl: 'users/current.json',

            unauthorizedPage: '/login',
            targetPage: '/',
            loginPage: '/login',

            usernameField: 'username',
            passwordField: 'password'
        };

        this.set = function (key, value) {
            config[key] = value;
            return this;
        };

        this.$get = ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

            var user = null,
                lastUser = null;

            return {

                targetPage: config.targetPage,
                loginPage: config.loginPage,
                unauthorizedPage: config.unauthorizedPage,

                getUser: function () {
                    return user;
                },

                getLastUser: function () {
                    return lastUser;
                },

                isLoggedIn: function () {
                    return user !== null;
                },

                authorize: function (role) {
                    return !role || (
                        user !== null &&
                        (role === true || _.contains(user.roles, role))
                        );
                },

                login: function (username, password) {
                    var defer = $q.defer();
                    $http({
                        url: config.host + config.loginUrl,
                        method: 'POST',
                        data: {
                            username: config.usernameField,
                            password: config.passwordField
                        }
                    }).success(function (data) {
                        user = data;
                        lastUser = data;
                        defer.resolve(user);
                        $rootScope.$broadcast('EasyAuth.login', user);
                    }).error(function () {
                        defer.reject();
                    });

                    return defer.promise;
                },

                logout: function () {
                    var defer = $q.defer();
                    $http.get(config.host + config.logoutUrl).success(function () {
                        user = null;
                        defer.resolve();
                        $rootScope.$broadcast('EasyAuth.logout');
                    }).error(function () {
                        defer.reject();
                    });

                    return defer.promise;
                },

                check: function () {
                    var defer = $q.defer();
                    $http({
                        url: config.host + config.loggedinUrl,
                        method: 'GET'
                    }).success(function (data) {
                        var previous = user;
                        user = data;
                        lastUser = data;
                        defer.resolve(user);
                        if (!angular.equals(previous, user)) {
                            $rootScope.$broadcast('EasyAuth.login', user);
                        }
                    }).error(function () {
                        $rootScope.$broadcast('EasyAuth.logout');
                        user = null;
                        defer.reject();
                    });

                    return defer.promise;
                }
            };
        }];
    })

    // Form's directive
    .directive('easyAuthForm', function () {
        return {
            scope: true,
            controller: ['$scope', '$location', 'EasyAuth', 'Referer',
                function ($scope, $location, EasyAuth, Referer) {
                    $scope.error = false;
                    $scope.ready = false;

                    var redirect = function () {
                        if (Referer.has()) {
                            var url = Referer.get();
                            Referer.reset();
                            $location.path(url);
                        } else {
                            $location.path(EasyAuth.targetPage);
                        }
                    };

                    // Check Login
                    EasyAuth.check().then(function() {
                        redirect();
                    }, function() {
                        $scope.ready = true;
                    });

                    // Login
                    $scope.submit = function() {
                        if (!$scope.loading) {
                            $scope.loading  = true;
                            EasyAuth.login($scope.username, $scope.password).then(function() {
                                $scope.loading  = false;
                                redirect();
                            }, function() {
                                $scope.loading  = false;
                                $scope.error = true;
                            });
                        }
                    };
                }],

            templateUrl: function(element, attr) {
                return attr.templateUrl ? attr.templateUrl : 'partials/login.html';
            }
        };
    })

    // Referer
    .factory('Referer', function() {

        return {
            url: false,

            has: function() {
                return this.url !== false;
            },

            reset: function () {
                this.url = false;
            },

            set: function (url) {
                this.url = url;
            },

            get: function () {
                return this.url;
            }
        };

    })

    // Check auth on route change
    .run(['$rootScope', '$location', 'EasyAuth', 'Referer',
        function ($rootScope, $location, EasyAuth, Referer) {
            $rootScope.$on("$routeChangeStart", function (event, next) {
                if ( ! EasyAuth.authorize(next.security)) {
                    if (EasyAuth.isLoggedIn()) {
                        $location.path(EasyAuth.unauthorizedPage);
                    } else {
                        Referer.set($location.url());
                        $location.path(EasyAuth.loginPage);
                    }
                }
            });
        }
    ])

    // Directive's template
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put('partials/login.html',
            "<form class=\"login-form\" ng-show=\"ready\" ng-submit=\"submit()\">" +
            "<div class=\"alert alert-error\" ng-show=\"error\">" +
            "Check your username or password" +
            "</div>" +
            "<input type=\"text\" placeholder=\"Username\" ng-model=\"username\" />" +
            "<input type=\"password\" placeholder=\"Password\" ng-model=\"password\" />" +
            "<input type=\"submit\" value=\"Login\" />" +
            "</form>");
    }])
;