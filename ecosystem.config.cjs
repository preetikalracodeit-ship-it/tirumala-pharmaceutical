/**
 * PM2 ecosystem config — for traditional VPS/server deployment (no Docker)
 *
 * Install PM2:  npm install -g pm2
 * Start:        pm2 start ecosystem.config.cjs
 * Save:         pm2 save && pm2 startup
 * Logs:         pm2 logs
 * Status:       pm2 status
 */

module.exports = {
  apps: [
    {
      name: 'medical-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/backend-error.log',
      out_file:   './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
    },
    {
      name: 'medical-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-error.log',
      out_file:   './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
    },
  ],
}
