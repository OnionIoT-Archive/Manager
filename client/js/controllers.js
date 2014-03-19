'use strict';

var controllers = angular.module('manager.controllers', []);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'auth', 'sha3',
function($scope, $state, socket, auth, sha3) {

	var clearFields = function() {
		$scope.loginFailed = false;
		$scope.signupFailed = false;
		$scope.pwResetSent = false;
		$scope.email = '';
		$scope.password = '';
	};

	// Switching between Login, Signup and Forgot Password
	$scope.mode = 'login';

	$scope.switchMode = function(mode) {
		clearFields();
		$scope.mode = mode;
	};

	// Login
	$scope.login = function() {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var password = $scope.password;

		auth.login(email, password, function() {
			clearFields();
		}, function() {
			$scope.password = '';
			$scope.loginFailed = true;
		});
	};

	// Sign Up
	$scope.signUp = function() {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);

		socket.rpc('SIGNUP', {
			email : email,
			hash : pwHash
		}, function() {
			clearFields();
			$scope.switchMode('login');
		}, function() {
			$scope.signupFailed = true;
		})
	};

	// Password Reset
	$scope.passwordReset = function() {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		socket.emit('PWRESET', {
			email : email
		}, function() {
			$scope.pwResetSent = true;
		}, function() {
			$scope.pwResetSent = false;
		});
	};
}]);

controllers.controller('TestCtrl', ['$scope', 'socket',
function($scope, socket) {
	$scope.signup = function() {
		socket.emit('SIGNUP', {});
	};
}]);

controllers.controller('CpCtrl', ['$scope', '$state', 'socket', 'auth',
function($scope, $state, socket, auth) {
	// Determin whether the current tab is active or not
	$scope.isActive = function(root) {
		return ($state.current.name.search(root) !== -1) ? true : false;
	};

	$scope.logout = function($event) {
		$event.stopPropagation();
		$event.preventDefault();
		auth.logout();
	};
}]);
//TODO:shouldn't go back to login page everytime.
controllers.controller('DevicesListCtrl', ['$scope', '$timeout', '$state', 'socket','auth',
function($scope, $timeout, $state, socket,auth) {
	$scope.devices = [];	
	socket.emit('LIST_DEVICES',{});
	socket.on('LIST_DEVICES_PASS',function(data){
		$scope.$apply(function () {
            $scope.devices = data;
        });
	});
	

	$scope.toggleSelection = function() {
		var selectedAll = true;
		angular.forEach($scope.devices, function(value, key) {
			// Test if everything is selected
			selectedAll = selectedAll && value.selected;
		});

		if (selectedAll) {
			angular.forEach($scope.devices, function(value, key) {
				// Test if everything is selected
				value.selected = false;
			});
		} else {
			angular.forEach($scope.devices, function(value, key) {
				// Test if everything is selected
				value.selected = true;
			});
		}
	};

	$scope.deleteSelected = function() {
		if (confirm("Are you sure you would like to delete selected devices?")) {
			var deviceIds = [];
			angular.forEach($scope.devices, function(value, key) {
				if (value.selected) {
					deviceIds.push({
						_id : value._id
					});
				}
			});
			socket.rpc('DELETE_DEVICES', deviceIds, function() {
				socket.rpc('LIST_DEVICES', function(data) {
					
					$scope.devices = data;
				});
			});
		}
	};

	$scope.newDevice = function() {
		socket.rpc('NEW_DEVICE', {}, function(data) {
			$state.go('cp.devices.edit', {
				deviceId : data.id
			});
		});
	};
}]);

controllers.controller('DevicesEditCtrl', ['$scope', '$state', '$stateParams', 'socket','blockUI','$http',
function($scope, $state, $stateParams, socket,blockUI,$http) {
	
	$scope.device = {};
	$scope.editMode = false;
	// socket.rpc('GET_DEVICE', {
		// id : $stateParams.deviceId
	// }, function(data) {
		// $scope.device = data;
	// });
	
	socket.emit('GET_DEVICE',{id : $stateParams.deviceId});
	
	socket.on('GET_DEVICE_PASS',function(data){
		$scope.$apply(function () {
            $scope.device = data;
        });
	});
	
	socket.emit('GET_HISTORY',{deviceId : $stateParams.deviceId});
	
	socket.on('GET_HISTORY_PASS',function(data){
		$scope.$apply(function () {
            $scope.his = data;
        });
	});
	
	
	$scope.testProcedure = function(path){
		//TODO: use a config file to change this end point
		console.log('http://http://192.241.191.6//v1/devices/'+$scope.device.id+path);
		$http.get('http://192.241.191.6/v1/devices/'+$scope.device.id+path).success(function(e){
			console.log(e);
		});
	};
	$scope.toggleEdit = function() {
		console.log('toggleEdit save');
		if ($scope.editMode) {
			socket.rpc('DEVICE_UPDATE', {
				condition : {
					id : $stateParams.deviceId
				},
				update : {
					name : $scope.device.meta.name,
					description : $scope.device.meta.description,
					deviceType:$scope.device.meta.deviceType
				}
			}, function(data) {
				$scope.device = data;
			});
		}

		$scope.editMode = !$scope.editMode;
	};

	$scope.renewKey = function() {
		socket.rpc('RENEW_KEY', {
			_id : $stateParams.deviceId
		}, function(data) {
			$scope.device.key = data.key;
		});
	};

	$scope.deleteDevice = function() {
		if (confirm("Are you sure you would like to delete the device?")) {
			blockUI.start();
			socket.rpc('DELETE_DEVICES', [{
				id : $stateParams.deviceId
			}], function() {
				blockUI.stop();
				$state.go('cp.devices.list');
			});
		}
	};
}]);

controllers.controller('DevicesAddCtrl', ['$scope', '$state', '$stateParams', 'socket', 'blockUI',
function($scope, $state, $stateParams, socket, blockUI) {
	$scope.device = {
		id : 'new_device',
		key : 'N/A',
		status : 'Unknown',
		meta : {
			name : '',
			description : '',
			deviceType : 'public'
		}
	};
	$scope.editMode = true;
	$scope.addMode = true;

	$scope.toggleEdit = function() {
		console.log('toggle edit save');
		blockUI.start();
		socket.rpc('ADD_DEVICE', {
			meta : {
				name : $scope.device.meta.name,
				description : $scope.device.meta.description,
				deviceType : $scope.device.meta.deviceType
			}
		}, function(data) {
			console.log(data);
			blockUI.stop();
			$state.go('cp.devices.edit', {
				deviceId : data.id
			});
		});
	};
}]);

controllers.controller('SupportCtrl', ['$scope', 'socket',
function($scope, socket) {
	$scope.send = function() {
		socket.rpc('NEW_TICKET', {
			entry_1679870466 : 'testing User',
			entry_1266873877 : $scope.subject,
			entry_1148148744 : $scope.details
		}, function(data) {
			console.log(data);
		}, function(data) {
			console.log(data);
		});
	};
}]);

controllers.controller('UsersEditCtrl', ['$scope', '$state', 'socket', 'auth', 'sha3',
function($scope, $state, socket, auth, sha3) {

	$scope.revert = function() {
		socket.rpc('GET_USER', {
		}, function(user) {
			$scope.user = user;
		}, function() {

		});
	};
	$scope.revert();

	$scope.userUpdate = function() {
		$scope.email = $scope.email || '';
		var email = $scope.user.email.toLowerCase();
		var pwHash = sha3($scope.password);
		var fullname = $scope.user.fullname;
		var website = $scope.user.website;
		var company = $scope.user.company;
		var address = $scope.user.address;
		var title = $scope.user.title;
		var industry = $scope.user.industry;
		var phone = $scope.user.phone;
		var isReset;
		$scope.isDisable = true;
		if (!$scope.oldPassword) {
			isReset = false;
		} else {
			isReset = true;
			if (!$scope.password) {
				alert('Please put your new password');
				return
			}
		}
		socket.rpc('USER_UPDATE', {
			isReset : isReset,
			oldPass : sha3($scope.oldPassword),
			update : {
				email : email,
				passHash : pwHash,
				fullname : fullname,
				website : website,
				company : company,
				title : title,
				industry : industry,
				phone : phone,
				address : address
			}
		}, function() {
			alert("Update successfully");
		}, function() {
			alert("User name does not match password!");
		});
	};

}]);

controllers.controller('SupportCtrl', ['$scope', '$location', '$state', '$sce', 'localStorageService', 'socket', 'auth', 'sha3', '$http', 'blockUI',
function($scope, $location, $state, $sce, localStorageService, socket, auth, sha3, $http, blockUI) {
	socket.rpc('FORUMS_SETUP', function (forumsInfo) {
		$scope.forumsUrl = $sce.trustAsResourceUrl('http://' + $location.host() + ($location.port() === 80 ? '' : ':' + $location.port()) + '/forums/' + encodeURIComponent(forumsInfo.message) + '/' + forumsInfo.timestamp + '/' + forumsInfo.signature);
	});
}]);

controllers.controller('DocsCtrl', ['$scope', '$templateCache',
function($scope, $templateCache) {
	var currentChapter = 'intro';
	$scope.docText = $templateCache.get('tutorials.intro');

	$scope.changeDoc = function (chapter) {
		if (currentChapter !== chapter) {
			$scope.docText = $templateCache.get('tutorials.' + chapter);
			currentChapter = chapter;
		}
	};
}]);