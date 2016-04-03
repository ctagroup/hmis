/**
 * Created by udit on 01/04/16.
 */
Package.describe(
	{
		name: "desaiuditd:hmis",
		summary: "HMIS OAuth flow",
		version: "0.0.1",
		git: "https://github.com/desaiuditd/hmis",
	}
);

Package.onUse(function(api) {
	api.use('oauth2', ['client', 'server']);
	api.use('oauth', ['client', 'server']);
	api.use('http', ['server']);
	api.use('templating', 'client');
	api.use('underscore', 'server');
	api.use('random', 'client');
	api.use('service-configuration', ['client', 'server']);

	api.export('HMIS');

	api.addFiles(
		['hmis_configure.html', 'hmis_configure.js'],
		'client'
	);

	api.addFiles('hmis_server.js', 'server');
	api.addFiles('hmis_client.js', 'client');
});