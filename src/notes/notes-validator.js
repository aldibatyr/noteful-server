/* eslint-disable strict */
const logger = require('../logger');

const NO_ERRORS = null;

function getNotesValidationError({name, content, folder_id}) {
  if (!name) {
    logger.error('No name provided');
    return {
      error: {
        message: 'name must not be empty'
      }
    };
  }

  if(!content) {
    logger.error('no content provided');
    return {
      error: {
        message: 'content must not be empty'
      }
    };
  }

  if (!folder_id) {
    logger.error('no folder provided');
    return {
      error: {
        message: 'folder must be assigned'
      }
    };
  }

  return NO_ERRORS;
}

module.exports = {getNotesValidationError};