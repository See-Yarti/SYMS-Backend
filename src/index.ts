import 'reflect-metadata';
import { register } from 'tsconfig-paths';

register({
  baseUrl: process.env.NODE_ENV === 'production' ? './dist' : './src',
  paths: {
    '@/*': process.env.NODE_ENV === 'production' ? ['./*'] : ['*'],
  },
});

import App from './providers/App';

App.run();
