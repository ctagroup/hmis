/**
 * Created by udit on 01/04/16.
 */
Template.configureLoginServiceDialogForHMIS.helpers(
	{
		siteUrl: function () {
			return Meteor.absoluteUrl();
		}
	}
);

Template.configureLoginServiceDialogForHMIS.fields = function () {
	return [
		{ property: 'appId', label: 'App ID' },
		{ property: 'secret', label: 'App Secret' }
	];
};
