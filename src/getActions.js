const path = require('path');
const fs = require('fs');
const flatten = require('lodash.flatten');

/**
 * Filter dependencies by name pattern
 * @param  {String} dependency Name of the dependency
 * @return {Boolean}           If dependency is a rnpm plugin
 */
const isPlugin = (dependency) => !!~dependency.indexOf('rnpm-plugin-');

/**
 * Get default actions from rnpm's package.json
 * @type {Array}
 */
const getActions = (cwd) => {
  const packagePath = path.join(cwd, 'package.json');

  if (!fs.existsSync(packagePath)) {
    return [];
  }

  const pjson = require(packagePath);

  return flatten(
      Object.keys(pjson.dependencies || {}),
      Object.keys(pjson.devDependencies || {})
    )
    .filter(isPlugin)
    .map(getPluginConfig(cwd));
};

/**
 * Get plugin config
 * @param  {String} name Name of the plugin
 * @return {Object}      Plugin's config
 */
const getPluginConfig = cwd => name =>
  require(path.join(cwd, 'node_modules', name));

/**
 * Compose a list of dependencies from default actions,
 * package's dependencies & devDependencies
 * @type {Array}
 */
const pluginsList = flatten([
  getActions(path.join(__dirname, '..')),
  getActions(process.cwd())
]);

module.exports = () => pluginsList;
