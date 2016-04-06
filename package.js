/**
 * Created by udit on 01/04/16.
 */
Package.describe(
	{
		name: "desaiuditd:hmis",
		summary: "HMIS OAuth flow",
		version: "0.0.3",
		git: "https://github.com/desaiuditd/hmis",
	}
);

Package.onUse(function(api) {
	api.use('oauth2@1.1.5', ['client', 'server']);
	api.use('oauth@1.1.6', ['client', 'server']);
	api.use('http@1.1.1', ['server']);
	api.use('templating@1.1.5', 'client');
	api.use('underscore@1.0.4', 'server');
	api.use('random@1.0.5', 'client');
	api.use('service-configuration@1.0.5', ['client', 'server']);

	api.export('HMIS');

	api.addFiles(
		['hmis_configure.html', 'hmis_configure.js'],
		'client'
	);

	api.addFiles('hmis_server.js', 'server');
	api.addFiles('hmis_client.js', 'client');
});