/**
 * Created by udit on 01/04/16.
 */
HMIS = {};

var querystring = Npm.require('querystring');

OAuth.registerService('HMIS', 2, null, function(query) {

	var response = getTokenResponse(query);
	var accessToken = response.accessToken;

	// include all fields from hmis
	// http://developers.hmis.com/docs/reference/login/public-profile-and-friend-list/
	var whitelisted = ['id', 'email', 'name', 'first_name',
	                   'last_name', 'link', 'gender', 'locale', 'age_range'];

	var identity = getIdentity(accessToken, whitelisted);

	var serviceData = {
		accessToken: accessToken,
		expiresAt: (+new Date) + (1000 * response.expiresIn)
	};


	var fields = _.pick(identity, whitelisted);
	_.extend(serviceData, fields);

	return {
		serviceData: serviceData,
		options: {profile: {name: identity.name}}
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
		// Request an access token
		responseContent = HTTP.get(
			"https://graph.hmis.com/v2.2/oauth/access_token", {
				params: {
					client_id: config.appId,
					redirect_uri: OAuth._redirectUri('HMIS', config),
					client_secret: OAuth.openSecret(config.secret),
					code: query.code
				}
			}).content;
	} catch (err) {
		throw _.extend(new Error("Failed to complete OAuth handshake with HMIS. " + err.message),
		               {response: err.response});
	}

	// If 'responseContent' parses as JSON, it is an error.
	// XXX which hmis error causes this behvaior?
	if (isJSON(responseContent)) {
		throw new Error("Failed to complete OAuth handshake with HMIS. " + responseContent);
	}

	// Success!  Extract the hmis access token and expiration
	// time from the response
	var parsedResponse = querystring.parse(responseContent);
	var fbAccessToken = parsedResponse.access_token;
	var fbExpires = parsedResponse.expires;

	if (!fbAccessToken) {
		throw new Error("Failed to complete OAuth handshake with hmis " +
		                "-- can't find access token in HTTP response. " + responseContent);
	}
	return {
		accessToken: fbAccessToken,
		expiresIn: fbExpires
	};
};

var getIdentity = function (accessToken, fields) {
	try {
		return HTTP.get("https://graph.hmis.com/v2.4/me", {
			params: {
				access_token: accessToken,
				fields: fields
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
