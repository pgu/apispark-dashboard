angular.module('frontsDashboardApp', [])

  .controller('frontsDashboardCtrl', function ($http, $interval) {

    var ctrl = this;

    ctrl.shouldShowCredentialsForm = true;

    ctrl.apps = {
      studio: {
        file: 'studio.json',
        env: {
          staging: {
            url: 'https://{user}:{pwd}@studio.rest-let.com/'
          },
          prod: {
            url: 'https://studio.restlet.com/'
          }
        }
      },
      hub: {
        file: 'hub.json',
        env: {
          staging: {
            url: 'https://{user}:{pwd}@preview.staging.rest-let.io/'
          },
          prod: {
            url: 'https://preview.restlet.io/'
          }
        }
      }
    };

    ctrl.credentials = {
      staging: { user: '', pwd: '' },
      prod: { user: '', pwd: '' }
    };

    ctrl.saveCredentials = saveCredentials;

    function saveCredentials () {
      ctrl.shouldShowCredentialsForm = false;

      launchMonitoring();
    }


    function launchMonitoring () {
      updateVersions(ctrl.apps);

      $interval(function () {
        updateVersions(ctrl.apps);
      }, 10 * 1000);
    }

    function updateVersions (apps) {

      _.each(apps, function (appConfig, appName) {
        _.each(appConfig.env, function (envConfig, envName) {
          fetchVersionForEnv(envName, envConfig, appConfig);
        });
      });

    }

    function fetchVersionForEnv (envName, envConfig, appConfig) {

      var url = envConfig.url
        .replace('{user}', ctrl.credentials[ envName ].user)
        .replace('{pwd}', ctrl.credentials[ envName ].pwd);

      var fileUrl = url + appConfig.file;
      console.log(fileUrl);

      envConfig.status = '';

      // envConfig.version = '';
      // envConfig.sha1 = '';

      envConfig.errorCode = '';
      envConfig.errorText = '';

      $http.get(fileUrl)
        .then(function (response) {

          var data = response.data;

          var isHtmlPage = data.indexOf('<head>') > -1; // can return 200 with html content
          if (isHtmlPage) {
            envConfig.status = 'KO';
            envConfig.errorCode = '404';
            envConfig.errorText = 'Not found';
            return;
          }

          envConfig.status = 'OK';

          console.log(envConfig, data);
          // var parts = _.take(data.split('-'), 2);

          // env.version = _.first(parts);
          // env.sha1 = _.last(parts);

        })
        .catch(function (response) {
          envConfig.status = 'KO';

          envConfig.errorCode = response.status;
          envConfig.errorText = response.statusText || 'none';
        });

    }

  });
