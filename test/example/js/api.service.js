(function () {
    'use strict';

    function Api($resource, $window, $document, $sce) {
        return $resource('/online/rest/some/api/:x/and/:y', {
            x: '@x',
            y: '@y'
        }, {
            fetch: {
                method: 'GET',
                isArray: true
            },
            update: {
                method: 'POST',
                isArray: false
            },
            download: {
                url: '/online/rest/some/api/pdf',
                method: 'GET',
                headers: {
                    accept: 'application/pdf'
                },
                responseType: 'arraybuffer',
                transformResponse: function (data) {
                    var fileName = 'my.pdf';
                    var blob = new $window.Blob([data], {type: 'application/pdf'}),
                        fileURL = ($window.URL || $window.webkitURL).createObjectURL(blob),
                        a = $document[0].createElement('a');

                    a.download = fileName;
                    a.href = $sce.trustAsResourceUrl(fileURL);
                    var event = document.createEvent('MouseEvents');
                    event.initEvent('click', true, false);
                    a.dispatchEvent(event);
                    return;
                }
            }
        });
    }

    Api.$inject = ['$resource', '$window', '$document', '$sce'];

    angular
        .module('ngApimock-example')
        .service('api', Api);

})();