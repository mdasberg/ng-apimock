(function () {
    const fs = require('fs-extra');
    const path = require('path');

    updatePackageJson();

    /**
     * Update the package.json with the latest version number
     */
    function updatePackageJson() {
        const version = fs.readJSONSync('package.json').version;
        const packageJson = fs.readJSONSync(path.join('docker', 'package.json'));

        packageJson.version = version;
        packageJson.dependencies['ng-apimock'] = version;

        fs.writeJsonSync(path.join('docker', 'package.json'), packageJson);
    }

})();