/* eslint-disable strict */
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'developement',
  DB_URL: process.env.DATABASE_URL || 'postgres://noty@localhost/noteful'
};
