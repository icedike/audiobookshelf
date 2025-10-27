/**
 * @typedef MigrationContext
 * @property {import('sequelize').QueryInterface} queryInterface - a Sequelize QueryInterface object.
 * @property {import('../Logger')} logger - a Logger object.
 *
 * @typedef MigrationOptions
 * @property {MigrationContext} context - an object containing the migration context.
 */

const migrationVersion = '2.30.1'
const migrationName = `${migrationVersion}-add-feed-categories`
const loggerPrefix = `[${migrationVersion} migration]`

/**
 * This migration script adds the categories column to the feeds table to support iTunes podcast categories.
 *
 * @param {MigrationOptions} options - an object containing the migration context.
 * @returns {Promise<void>} - A promise that resolves when the migration is complete.
 */
async function up({ context: { queryInterface, logger } }) {
  logger.info(`${loggerPrefix} UPGRADE BEGIN: ${migrationName}`)

  if (await queryInterface.tableExists('feeds')) {
    const tableDescription = await queryInterface.describeTable('feeds')
    if (!tableDescription.categories) {
      logger.info(`${loggerPrefix} Adding categories column to feeds table`)
      await queryInterface.addColumn('feeds', 'categories', {
        type: queryInterface.sequelize.Sequelize.DataTypes.JSON,
        defaultValue: null,
        allowNull: true
      })
      logger.info(`${loggerPrefix} Added categories column to feeds table`)
    } else {
      logger.info(`${loggerPrefix} categories column already exists in feeds table`)
    }
  } else {
    logger.info(`${loggerPrefix} feeds table does not exist`)
  }

  logger.info(`${loggerPrefix} UPGRADE END: ${migrationName}`)
}

/**
 * This migration script removes the categories column from the feeds table.
 *
 * @param {MigrationOptions} options - an object containing the migration context.
 * @returns {Promise<void>} - A promise that resolves when the migration is complete.
 */
async function down({ context: { queryInterface, logger } }) {
  logger.info(`${loggerPrefix} DOWNGRADE BEGIN: ${migrationName}`)

  if (await queryInterface.tableExists('feeds')) {
    const tableDescription = await queryInterface.describeTable('feeds')
    if (tableDescription.categories) {
      logger.info(`${loggerPrefix} Removing categories column from feeds table`)
      await queryInterface.removeColumn('feeds', 'categories')
      logger.info(`${loggerPrefix} Removed categories column from feeds table`)
    } else {
      logger.info(`${loggerPrefix} categories column does not exist in feeds table`)
    }
  } else {
    logger.info(`${loggerPrefix} feeds table does not exist`)
  }

  logger.info(`${loggerPrefix} DOWNGRADE END: ${migrationName}`)
}

module.exports = { up, down }
