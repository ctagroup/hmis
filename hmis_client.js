/**
 * Created by udit on 01/04/16.
 */
HMIS = {};

// Request HMIS credentials for the user
//
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
HMIS.requestCredential = function (options, credentialRequestCompleteCallback) {

	// support both (options, callback) and (callback).
	if (!credentialRequestCompleteCallback && typeof options === 'function') {
		credentialRequestCompleteCallback = options;
		options = {};
	}

	var config = ServiceConfiguration.configurations.findOne({service: 'HMIS'});
	if (!config) {
		credentialRequestCompleteCallback && credentialRequestCompleteCallback(
			new ServiceConfiguration.ConfigError());
		return;
	}

	var credentialToken = Random.secret();
	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
	var display = mobile ? 'touch' : 'popup';

	var scope = "email";
	if (options && options.requestPermissions)
		scope = options.requestPermissions.join(',');

	var loginStyle = OAuth._loginStyle('HMIS', config, options);
	// http://localhost:3000/
	// ?code=9D057723C76142219E7B529BF625BDCE
	// &state=eyJsb2dpblN0eWxlIjoicG9wdXAiLCJjcmVkZW50aWFsVG9rZW4iOiJYNkNHQnRBWGJTdXRiclAwQjgwMWd0VmtlRmU4ZjYybnU3M0NnaUNXdWxEIiwiaXNDb3Jkb3ZhIjpmYWxzZX0%253D
	// &access_type=online
	// &approval_prompt=auto
	var loginUrl =
		config.hmisAPIEndpoints.oauthBaseUrl + config.hmisAPIEndpoints.authorize +
		'?access_type=online' +
		'&approval_prompt=auto' +
		'&trustedApp_id=' + config.appId +
		'&response_type=code' +
		'&redirect_uri=' + OAuth._redirectUri('HMIS', config) +
		'&state=' + OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl);

	OAuth.launchLogin(
		{
			loginService: "HMIS",
			loginStyle: loginStyle,
			loginUrl: loginUrl,
			credentialRequestCompleteCallback: credentialRequestCompleteCallback,
			credentialToken: credentialToken,
			popupOptions: {height: 650}
	    }
	);
};