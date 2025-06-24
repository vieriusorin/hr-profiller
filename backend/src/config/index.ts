import merge from 'lodash.merge';

// make sure NODE_ENV is set
if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV is not set');
}

const stage = process.env.STAGE || 'local';
let envConfig;

// dynamically require each config depending on the stage we're in
if (stage === 'production') {
  envConfig = require('./prod').default;
} else if (stage === 'staging') {
  envConfig = require('./staging').default;
} else {
  envConfig = require('./local').default;
}

const defaultConfig = {
  stage,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3001,
  logging: false,
};

export default merge(defaultConfig, envConfig);
