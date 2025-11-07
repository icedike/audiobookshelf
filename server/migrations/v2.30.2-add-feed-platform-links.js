/**
 * @typedef MigrationContext
 * @property {import('sequelize').QueryInterface} queryInterface - a suquelize QueryInterface instance
 * @property {typeof import('sequelize')} sequelize - sequelize module
 * @property {import('../Logger')} logger
 */

/**
 * Add platformLinks column to feeds table to store podcast platform subscription URLs
 *
 * @param {MigrationContext} context
 */
async function up({ queryInterface, sequelize }) {
  await queryInterface.addColumn('feeds', 'platformLinks', {
    type: sequelize.Sequelize.DataTypes.JSON,
    defaultValue: null,
    allowNull: true
  })
}

/**
 * @param {MigrationContext} context
 */
async function down({ queryInterface }) {
  await queryInterface.removeColumn('feeds', 'platformLinks')
}

module.exports = { up, down }
