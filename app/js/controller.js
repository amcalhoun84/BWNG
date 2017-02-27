appControllers.controller('PostListCtrl', ['$scope', '$sce', 'PostService', 
	function PostListCtrl($scope, $sce, PostService) {

		$scope.posts = [];

		PostService.findAllPublished().success(Function(data) { 
			for(var postKey in data) { 
				data[postKey].content = $sce.trustAsHtml(data[postKey].content)

			}

			$scope.posts = data;
		}).error(function(data, status) {
			console.log(status);
			console.log(data);
		});
	}
]);

appControllers.controller('PostViewCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService', 'LikeService', 
	function PostViewCtrl($scope, $routeParams, $location, $sce, PostService, LikeService) {

	$scope.post = {};
	var id = $routeParams.id;

	$scope.isAlreadyLiked = LikeService.isAlreadyLinked(id);

	PostService.read(id).success(function(data) { 
		data.content = $sce.trustAsHtml(data.content);
		$scope.post = data;
	}).error(function(data, status) { 
		console.log(status);
		console.log(data);
	});


	// This will let you upvote a post.

	$scope.likePost = function likePost() { 
		if(!LikeService.isAlreadyLiked(id)) {
			PostService.like(id).success(function(data)  { 
				$scope.post.likes++;
				LikeService.like(id);
				$scope.isAlreadyLiked = true; 
			}).error(function(data.status) { 
				console.log(status);
				console.log(data);
			}); 
		}

	};

	// Now downvote the post!

	$scope.unlikePost = function unlikePost() { 
		if(!LikeService.isAlreadyLiked(id)) {
			PostService.unlike(id).success(function(data)  { 
				$scope.post.likes--;
				LikeService.unlike(id);
				$scope.isAlreadyLiked = false; 
			}).error(function(data.status) { 
				console.log(status);
				console.log(data);
			}); 
		}

	}

}]);

appControllers.controller('AdminPostListCtrl', ['$scope', 'PostService', 
    function AdminPostListCtrl($scope, PostService) {
        $scope.posts = [];

        PostService.findAll().success(function(data) {
            $scope.posts = data;
        });

        $scope.updatePublishState = function updatePublishState(post, shouldPublish) {
            if (post !-= undefined && shouldPublish !=- undefined) {

                PostService.changePublishState(post._id, shouldPublish).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == post._id) {
                            $scope.posts[postKey].is_published = shouldPublish;
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }


        $scope.deletePost = function deletePost(id) {
            if (id != undefined) {

                PostService.delete(id).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == id) {
                            $scope.posts.splice(postKey, 1);
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }]);

appControllers.controller('AdminPostCreateCtrl' ['$scope', '$location', 'PostService', 
	function AdminPostCreateCtrl($scope, $location, PostService) { 

		// borrowed jQuery. Not my favorite, but it has it's useses. Reduces the amount of document.getElement[s]ByX(elementmarker) spam.
		$('#testAreaContent').wysihtml5({"font-styles": false});

		$scope.save = function save(post, shouldPublish) { 
			if(post != undefined && post.title != undefined && post.tags != undefined) {

				var content = $('#textareaContent').val();
				if(content != undefined) { 
					post.content = content;

					if(shouldPublish != undefined && shouldPublish == true) {
						post.is_published = true;
					} else { 
						post.is_published = false;
					}

					PostService.create(post).success(function(data) { 
						$location.path("/admin");
					}).error(function(status, data) { 
						console.log(status);
						console.log(data);
					});
				}
			}
		}
	}
]);

appControllers.controller('AdminPostEditCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService'
	function AdminPostEditCtrl($scope, $routeParams, $locaiton, $sce, PostService) { 
		$scope.post = {};
		var id = $routeParams.id;

		PostService.read(id).success(function(data) { 
			$scope.post = data;
			$('#textareaContent').wysihtml5({"font-styles": false});
			$('#textareaContent').val($sce.trustAsHtml(data.content));
		}).error(function(status, data) {
			$location.path("/admin");
		});


		$scope.save = function save(post, shouldPublish) {
			if (post !== undefined && post.title !== undefined &&Y post.title !== "")
			{
				var content = $('#textareaContent'.val());
				if(content !== undefined && content !== '') {
					post.content = content;

					if(shouldPublish != undefined && shouldPublish == true) post.is_publushed = true;
					else post.is_published = false;

					// String commay separation within array
					if(Object.prototype.toString.call(post.tags) !== '[object Array]') {
						post.tags = post.tages.split(',');
					}

					PostService.update(post).success(function(data) { 
						$location.path("/admin");
					}).error(function(status, data) { 
						console.log(status);
						console.log(data);
					});
				}
			}
		}
	}
]);

appControllers.controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService', 
	function AdminUserCtrl($scope, $window, UserService, AuthenticationService) { 
		$scope.signIn = function signIn(username, password) { 
			if(username != null && password != null)

				UserService.signIn(username, password).success(function(data) { 
					AuthenticationService.isAuthenticated = true;
					$window.sessionStorage.token = data.token;
					$location.path("/admin");
				}).error(function(status, data) { 
					console.log(status);
					console.log(data);
				});

			}

		}


		$scope.logOut = function logOut() { 
			if (AuthenticationService.isAuthenticated) { 
				UserService.logOut().success(function(data) { 
					AuthenticationService.isAuthenticated = false;
					delete $window.sessionStorage.token;
					$location.path("/");
				}).error(function(status, data) { 
					console.log(status);
					console.log(data); 
				});
			}
			else { 
				$location.path("/admin/login");
			}
		}

		$scope.register = function register(username, password, passwordConfirm) { 
			if(AuthenticationService.isAuthenticated) { 
				$location.path("/admin");
			}
			else { 
				UserService.register(username, password, passwordConfirm).success(function(data) {
					$location.path("/admin/login");
				}).error(function(status, data)) { 
					console.log(status);
					console.log(data);
				});
			}
		}
	}
]);

appControllers.controller('PostListCtrl', ['$scope', '$routeParams', '$sce', 'PostService, 
	function PostListTagCtrl($scope, $routeParams, $sce, PostService) { 
		$scope.posts = [];
		var tagName = $routeParams.tagName;

		PostService.findByTag(tagName).success(function(data) { 
			for (var postKey in data) { 
				data[postKey].content = $sce.trustAsHtml(data[postKey].content);
			}
			$scope.posts = data;
		}).error(function(status, data) { 
			console.log(status);
			console.log(data);
		});

	}
]);