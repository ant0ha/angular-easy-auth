ngEasyAuth
=============

ngEasyAuth is a simple angular library for handling security
(fork of [authenticateJS](https://github.com/youknowriad/authenticate.js))

Installation
------------

To use this library you should have a server application that handles authentication with sessions and it should have a login api that uses a username and password parameters from request body, a logout url and an api to get the current loggedin user with its credentials.

 * Install the library

```bash
bower install angular-easy-auth
```

 * load the library

```html
<script src="js/angular.min.js"></script>
<script src="js/angular-route.min.js"></script>
<script src="js/angular-easy-auth.js"></script>
```

 * add it to your dependencies

```javascript
angular.module('myapp', ['ngEasyAuth']);
```

 * configure

```javascript
angular.module('myapp').config(['EasyAuthProvider', function (EasyAuthProvider) {

    EasyAuthProvider
        .set('host', 'api/')
        .set('loginUrl', 'login.json')
    ;

}]);
```

All params and default values you can see below:

Param               | Default value
------------------- | -------------
host                | 'api/'
loginUrl            | 'login.json'
logoutUrl           | false
loggedinUrl         | 'users/current.json'
unauthorizedPage    | '/login'
targetPage          | '/'
loginPage           | '/login'
router              | 'ngRoute'

Usage
-----

 * In your login page, include the login form like this

```html
<div easy-auth-form></div>
```
You can override the default login form template like this

```html
<div easy-auth-form template-url="mypartial.html"></div>
```

 * add a security attribute to your routes
     * a false value means that the route is not protected,
     * a true value means, you have to be loggedin to access this route,
     * other custom string can be used to indicate that a user role is required to access this route (the string represent the role that have to be found in user.roles)

* you can call EasyAuth.logout(); to loggout

* you cas use EasyAuth.getLoggedinUser() to get the current loggedin user
