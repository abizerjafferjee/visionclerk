var fileService = angular.module('fileService', []);

function getFile() {}
function postFile() {}

/**
 * @class FS interface
 */
fileService.factory('FS', function () {

    /**
     * @param domFile: Blob file from DOM element
     */
    fileService.push = function (domFile) {
        // TODO : Extract meta data

        var reader = new FileReader();
        reader.onloadend = function (ev) {
            var data = ev.target.result;

            console.log("File read:");
            console.log(data);

            // TODO : Call server
            // TODO : Dress it up with auth and meta data
        };
        reader.readAsArrayBuffer(domFile);
    };

    // Service interface to get a file either from cache or in
    // case of miss, request from backend.
    // Returns promise
    fileService.pull = function (id) {
        // TODO : Call server
    };

});