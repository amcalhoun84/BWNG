'use strict';

// The universal app variable, which in this case is using AngularJS within the MEAN system.
var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives']);

// From the angular Modules that we called for, the Services, Controllers, and Directives.
var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
var port = 3000;
options.api.base_url = "http://localhost:" + port;

app.config(['$locationProvider', '$routeProvider', 
	function($location, $routeProvider) {
		$routeProvider.
		when('/', {
			templateUrl: 'partials/post.list.html',
			controller: 'PostListCtrl'
		}).
		when('/post/:id', {
			templateUrl: 'partials/post.view.html',
			controller: 'PostViewCtrl'
		}).
		when('/tag/:tagName', { 
			templateUrl: 'partials/post.list.html',
			controller: 'PostListTagCtrl'
		}).
		when('/admin', { 
			templateUrl: 'partials/admin.post.list.html', 
			controller: 'AdminPostListCtrl',
			access: { requiredAuthentication: true }
		}).
		when('/admin/post/create', { 
			templateUrl: 'partials/admin.post.create.html',
			controller: 'AdminPostCreateCtrl',
			access: { requiredAuthentication: true }
		}).
		when('/admin/post/edit/:id', { 
			templateUrl: 'partials/admin.post.edit.html',
			controller: 'AdminPostEditCtrl',
			access: { requiredAuthentication: true }
		}).
		when('/admin/register', {
			templateUrl: 'partials/admin.register.html',
			controller: 'AdminUserCtrl'
		}).
		when('/admin/login', {
			templateUrl: 'partials/admin.login.html',
			controller: 'AdminUserCtrl'
		}).
		when('/admin/logout', { 
			templateUrl: 'partials/admin.logout.html',
			controller: 'AdminUserCtrl',
			access: { requiredAuthentication: true }
		}).
		otherwise({
			redirectTo: '/'
		});
}]);

app.config(function ($httpProvider) { 
	$httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) { 
	$rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute)
	{
		// redirects should only occur if the user is not authenticated and there is no sret token.
		if(nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication && !AuthenticationService.isAuthenticated && !window.sessionStorage.token) 
		{
			$location.path("/admin/login");
		}
	});
});