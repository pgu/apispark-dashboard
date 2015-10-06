angular.module('dashboardApp', [])

  .controller('dashboardCtrl', function ($http, $interval) {

    var ctrl = this;

    ctrl.envs = [
      {
        name: 'Staging',
        url: 'https://apispark.rest-let.com/'
      }
      , {
        name: 'Preprod',
        url: 'https://apispark.preprod.rest-let.com/'
      }
      , {
        name: 'Prod',
        url: 'https://apispark.restlet.com/'
      }
    ];

    function updateEnvs (envs) {

      _.each(envs, function (env) {

        env.status = '';

        env.version = '';
        env.sha1 = '';

        env.errorCode = '';
        env.errorText = '';

        $http.get(env.url + 'version')
          .then(function (response) {

            var data = response.data;

            var isHtmlPage = data.indexOf('<head>') > -1; // can return 200 with html content
            if (isHtmlPage) {
              env.status = 'KO';
              env.errorCode = '404';
              env.errorText = 'Not found';
              return;
            }

            env.status = 'OK';

            var parts = _.take(data.split('-'), 2);

            env.version = _.first(parts);
            env.sha1 = _.last(parts);

          })
          .catch(function (response) {
            env.status = 'KO';

            env.errorCode = response.status;
            env.errorText = response.statusText || 'none';
          });

      });

    }

    updateEnvs(ctrl.envs);

    $interval(function () {
      updateEnvs(ctrl.envs);
    }, 60 * 1000);

  });