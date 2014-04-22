'use strict';

var controllers = angular.module('manager.controllers', []);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'auth', 'sha3','blockUI',
function($scope, $state, socket, auth, sha3,blockUI) {

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
		blockUI.start();
		var myemail = document.querySelector('#email').value;
		var mypassword = document.querySelector('#password').value;

		//$scope.email = $scope.email || '';
		var email = myemail.toLowerCase();
		var password = mypassword;

		auth.login(email, password, function() {
			blockUI.stop();
			clearFields();
		}, function() {
			blockUI.stop();
			$scope.password = '';
			$scope.loginFailed = true;
		});
	};

	// Sign Up
	$scope.signUp = function() {
		blockUI.start();
		if (!$scope.email) {
			alert('Please enter email address');
			blockUI.stop();
			return
		}
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
		auth.signup(email, pwHash, function() {
			//re-login after user signup successfully
			auth.login(email, $scope.password, function() {
				clearFields();
				blockUI.stop();
			}, function() {
				blockUI.stop();
				$scope.password = '';
				$scope.loginFailed = true;
			});
		}, function() {
			blockUI.stop();
			$scope.signupFailed = true;
		});

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

		var r = confirm("Are you sure you want to log out?");
		if (r == true) {
			$event.stopPropagation();
			$event.preventDefault();
			auth.logout();
		} else {
			$event.stopPropagation();
			$event.preventDefault();
		}

	};
}]);

//TODO:shouldn't go back to login page everytime.
controllers.controller('DevicesListCtrl', ['$scope', '$timeout', '$state', 'socket', 'auth',
function($scope, $timeout, $state, socket, auth) {
	$scope.devices = [];
	socket.emit('LIST_DEVICES', {});
	socket.on('LIST_DEVICES_PASS', function(data) {
		$scope.$apply(function() {
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

controllers.controller('DevicesEditCtrl', ['$scope', '$state', '$stateParams', 'socket', 'blockUI', 'test',
function($scope, $state, $stateParams, socket, blockUI, test) {
	//TODO:put that in service
	var formatTime = function(timestamp) {
		return (new Date(timestamp)).toLocaleString();
	};
	$scope.testOn = false;

	$scope.toggleTest = function() {
		$scope.testOn = !$scope.testOn;
	};

	$scope.currentProcedure = {};

	$scope.initTest = function(procedure) {
		$scope.testOn = true;
		$scope.currentProcedure = angular.copy(procedure);
		$scope.currentProcedure.data = {};
	};

	$scope.test = test;

	$scope.device = {};
	$scope.paras = {};
	$scope.editMode = false;

	socket.emit('GET_DEVICE', {
		id : $stateParams.deviceId
	});

	socket.on('GET_DEVICE_PASS', function(data) {
		$scope.$apply(function() {
			for (var i = 0; i < data.states.length; i++) {
				data.states[i].timeStamp = formatTime(data.states[i].timeStamp);
			}
			if (data.id == $stateParams.deviceId) {
				$scope.device = data;
			}
		});
	});

	socket.emit('GET_HISTORY', {
		deviceId : $stateParams.deviceId
	});

	socket.on('GET_HISTORY_PASS', function(data) {

		$scope.$apply(function() {
			// Format the time
			for (var i = 0; i < data.length; i++) {
				data[i].timestamp = formatTime(data[i].timestamp);
			}

			$scope.his = data;
		});
	});

	$scope.newState = {};
	$scope.addState = function() {
		if (!$scope.newState.path) {
			alert('Please input path');
			return
		}
		if (!$scope.newState.value) {
			alert('Please input value');
			return
		}

		//blockUI.start();
		socket.rpc('ADD_STATE', {
			deviceId : $stateParams.deviceId,
			path : $scope.newState.path,
			value : $scope.newState.value,
			timeStamp:new Date()
		}, function(e) {
			console.log('add state successfully');
			// socket.emit('GET_STATE', {
				// deviceId : $stateParams.deviceId
			// });
		});
	};

	$scope.removeState = function(stateId) {
		blockUI.start();
		
		socket.rpc('REMOVE_STATE', {
			_id : stateId
		}, function(e) {
			console.log('remove state success');
			socket.emit('GET_STATE', {
				deviceId : $stateParams.deviceId
			});
		});
	};
	socket.emit('GET_STATE', {
		deviceId : $stateParams.deviceId
	});
	socket.on('GET_STATE_PASS', function(data) {
		console.log(data.length);
		$scope.$apply(function() {
			console.log(data.length);
			for (var i = 0; i < data.length; i++) {
				data[i].timeStamp = formatTime(data[i].timeStamp);
			}
			
			$scope.device.states = data;
			blockUI.stop();
		});

	});

	$scope.newTrigger = {};
	$scope.updateTrigger = {};
	$scope.addTrigger = function() {
		if (!$scope.newTrigger.condition) {
			alert('Please select condition');
			return
		}
		if (!$scope.newTrigger.postUrl) {
			alert('Please type post url');
			return
		}
		if (!$scope.newTrigger.state) {
			alert('Please select state');
			return
		}
		blockUI.start();
		socket.rpc('ADD_TRIGGER', {
			deviceId : $stateParams.deviceId,
			condition : $scope.newTrigger.condition,
			postUrl : $scope.newTrigger.postUrl,
			stateID : $scope.newTrigger.state._id
		}, function(e) {
			socket.emit('GET_TRIGGER', {
				deviceId : $stateParams.deviceId
			});
		});
	};

	$scope.removeTrigger = function(triggerId) {
		blockUI.start();
		socket.rpc('REMOVE_TRIGGER', {
			_id : triggerId
		}, function(e) {
			socket.emit('GET_TRIGGER', {
				deviceId : $stateParams.deviceId
			});
		});
	};

	socket.emit('GET_TRIGGER', {
		deviceId : $stateParams.deviceId
	});

	socket.on('GET_TRIGGER_PASS', function(data) {
		$scope.$apply(function() {
			$scope.trigger = data;
			blockUI.stop();
		});
	});

	$scope.toggleEdit = function() {

		console.log('toggleEdit save');

		if ($scope.editMode) {
			blockUI.start();
			$scope.updateTriggers();
			socket.rpc('DEVICE_UPDATE', {
				condition : {
					id : $stateParams.deviceId
				},
				update : {
					name : $scope.device.meta.name,
					description : $scope.device.meta.description,
					deviceType : $scope.device.meta.deviceType
				}
			}, function(data) {

				blockUI.stop();
				$scope.device = data;
			});
		};
		$scope.editMode = !$scope.editMode;
	};

	$scope.updateTriggers = function() {
		for (var i = 0; i < $scope.trigger.length; i++) {
			if (!$scope.trigger[i].postUrl) {
				alert('Please type post url');
				return
			}
			socket.rpc('UPDATE_TRIGGER', {
				condition : {
					_id : $scope.trigger[i]._id
				},
				update : {
					postUrl : $scope.trigger[i].postUrl
				}
			}, function(data) {
			});
		}
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
		if (!$scope.device.meta.name) {                      //add require for device name.    -Ran
			alert('Please enter device name');
			blockUI.stop();
			return
		}
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
		var pwHash = ($scope.password ? sha3($scope.password) : sha3($scope.oldPassword));
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
			alert('Please put your password to update your profile');
			return
		}
		//validation of url
		//remove this becuase this is optional for now.
		// if (!$scope.user.website) {
		// alert('Please type in valid url');
		// return
		// } else {
		// console.log("valid url");
		// }

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
	socket.rpc('FORUMS_SETUP', function(forumsInfo) {
		$scope.forumsUrl = $sce.trustAsResourceUrl('//' + $location.host() + ($location.port() === 80 ? '' : ':' + $location.port()) + '/forums/' + encodeURIComponent(forumsInfo.message) + '/' + forumsInfo.timestamp + '/' + forumsInfo.signature);
	});
}]);

controllers.controller('DocsCtrl', ['$scope', '$templateCache',
function($scope, $templateCache) {
	var currentChapter = 'intro';
	$scope.docText = $templateCache.get('tutorials.intro');

	$scope.changeDoc = function(chapter) {
		if (currentChapter !== chapter) {
			$scope.docText = $templateCache.get('tutorials.' + chapter);
			currentChapter = chapter;
		}
	};
}]);

