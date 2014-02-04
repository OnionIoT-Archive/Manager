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

controllers.controller('DevicesListCtrl', ['$scope', '$timeout', '$state', 'socket',
function($scope, $timeout, $state, socket) {
	$scope.devices = [];
	socket.rpc('LIST_DEVICES', function(data) {
		$scope.devices = data;
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
					console.log('list new decice')
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

controllers.controller('DevicesEditCtrl', ['$scope', '$state', '$stateParams', 'socket',
function($scope, $state, $stateParams, socket) {
	$scope.device = {};
	$scope.editMode = false;

	socket.rpc('GET_DEVICE', {
		_id : $stateParams.deviceId
	}, function(data) {
		$scope.device = data;
	});

	$scope.toggleEdit = function() {
		if ($scope.editMode) {
			socket.rpc('DEVICE_UPDATE', {
				condition : {
					_id : $stateParams.deviceId
				},
				update : {
					name : $scope.device.meta.name,
					description : $scope.device.meta.description
				}
			}, function(data) {
				$scope.device = data;
			});
		}

		$scope.editMode = !$scope.editMode;
	};

	$scope.renewKey = function() {
		socket.rpc('RENEW_KEY', {
			id : $stateParams.deviceId
		}, function(data) {
			$scope.device.key = data.key;
		});
	};

	$scope.deleteDevice = function() {
		if (confirm("Are you sure you would like to delete the device?")) {
			socket.rpc('DELETE_DEVICES', [{
				_id : $stateParams.deviceId
			}], function() {
				$state.go('cp.devices.list');
			});
		}

	};
}]);

controllers.controller('DevicesAddCtrl', ['$scope', '$state', '$stateParams', 'socket',
function($scope, $state, $stateParams, socket) {
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
		socket.rpc('ADD_DEVICE', {
			meta : {
				name : $scope.device.meta.name,
				description : $scope.device.meta.description,
				deviceType : $scope.device.meta.deviceType
			}
		}, function(data) {
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
			$scope.email = user.email;
			$scope.fullName = user.fullname;
			$scope.website = user.website;
			$scope.company = user.company;
			$scope.address = user.address;
			$scope.title = user.title;
			$scope.industry = user.industry;
			$scope.number = user.phone;
		}, function() {

		});
	};

	$scope.revert();

	$scope.userUpdate = function() {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
		var fullname = $scope.fullName;
		var website = $scope.website;
		var company = $scope.company;
		var address = $scope.address;
		var title = $scope.title;
		var industry = $scope.industry;
		var phone = $scope.number;
		var isReset;
		if (!$scope.oldPassword) {
			isReset = false;
		} else {
			isReset = true;
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

controllers.controller('SupportCtrl', ['$scope', '$state', 'socket', 'auth', 'sha3', '$http',
function($scope, $state, socket, auth, sha3, $http) {
	$scope.click = false;
	$scope.send = function($event) {
		if (!$scope.subject || !$scope.details) {
			$scope.click = true;
			$scope.sumbitted = false;
			$event.preventDefault();
			return
		}
		$event.preventDefault();
		socket.rpc('UPLOAD_SUPPORT', {
			subject : $scope.subject,
			details : $scope.details
		}, function(data) {
			$scope.sumbitted = true;
			$scope.subject = '';
			$scope.details = '';
		}, function(data) {
			$scope.sumbitted = false;
		})
	};

}]);
