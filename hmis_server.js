/**
 * Created by udit on 01/04/16.
 */
HMIS = {};

OAuth.registerService('HMIS', 2, null, function(query) {

	var response = getTokenResponse(query);
	var accessToken = response.accessToken;

	var whitelisted = ['accountId', 'emailAddress', 'firstName', 'lastName'];

	var identity = getIdentity(accessToken);
	identity.name = identity.account.firstName.trim() + " " + identity.account.lastName.trim();

	var serviceData = {
		accessToken: accessToken,
		expiresAt: (+new Date) + (1000 * response.expiresIn),
		refreshToken: response.refreshToken
	};


	var fields = _.pick(identity.account, whitelisted);
	fields.id = fields.accountId;
	fields.name = identity.account.firstName.trim() + " " + identity.account.lastName.trim();
	fields.firstName = fields.firstName.trim();
	fields.lastName = fields.lastName.trim();
	fields.first_name = fields.firstName;
	fields.last_name = fields.lastName;
	fields.email = fields.emailAddress;
	_.extend(serviceData, fields);

	return {
		serviceData: serviceData,
		options: {profile: identity}
	};
});

// checks whether a string parses as JSON
var isJSON = function (str) {
	try {
		JSON.parse(str);
		return true;
	} catch (e) {
		return false;
	}
};

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
	var config = ServiceConfiguration.configurations.findOne({service: 'HMIS'});
	if (!config)
		throw new ServiceConfiguration.ConfigError();

	var responseContent;
	try {
		var code;
		if(query['close?code']) {
			code = query['close?code'];
		} else {
			code = query['code'];
		}
		// Request an access token
		responseContent = HTTP.post(
			config.hmisAPIEndpoints.oauthBaseUrl + config.hmisAPIEndpoints.token +
			"?grant_type=authorization_code" +
			"&code=" + code +
			"&redirect_uri=" + OAuth._redirectUri('HMIS', config), {
				headers: {
					"X-HMIS-TrustedApp-Id": config.appId,
					"Authorization": new Buffer(config.appId+":"+config.appSecret || '').toString('base64'),
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				npmRequestOptions: {
					rejectUnauthorized: false // TODO remove when deploy
				}
			}).content;
	} catch (err) {
		throw _.extend(new Error("Failed to complete OAuth handshake with HMIS. " + err.message),
		               {response: err.response});
	}

	// If 'responseContent' parses as JSON, it is an error.
	// XXX which hmis error causes this behvaior?
	if (!isJSON(responseContent)) {
		throw new Error("Failed to complete OAuth handshake with HMIS. " + responseContent);
	}

	// Success!  Extract the hmis access token and expiration
	// time from the response
	var parsedResponse = JSON.parse(responseContent);
	var hmisAccessToken = parsedResponse.oAuthAuthorization.accessToken;
	var hmisExpires = parsedResponse.oAuthAuthorization.expiresIn;
	var hmisRefreshToken = parsedResponse.oAuthAuthorization.refreshToken;

	if (!hmisAccessToken) {
		throw new Error("Failed to complete OAuth handshake with hmis " +
		                "-- can't find access token in HTTP response. " + responseContent);
	}
	return {
		accessToken: hmisAccessToken,
		expiresIn: hmisExpires,
		refreshToken: hmisRefreshToken
	};
};

var getIdentity = function (accessToken) {
	var config = ServiceConfiguration.configurations.findOne({service: 'HMIS'});
	if (!config)
		throw new ServiceConfiguration.ConfigError();

	try {
		return HTTP.get(
			config.hmisAPIEndpoints.userServiceBaseUrl + config.hmisAPIEndpoints.selfBasicInfo, {
				headers: {
					"X-HMIS-TrustedApp-Id": config.appId,
					"Authorization": "HMISUserAuth session_token="+accessToken,
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				npmRequestOptions: {
					rejectUnauthorized: false // TODO remove when deploy
				}
		}).data;
	} catch (err) {
		throw _.extend(new Error("Failed to fetch identity from HMIS. " + err.message),
		               {response: err.response});
	}
};

HMIS.retrieveCredential = function(credentialToken, credentialSecret) {
	return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
