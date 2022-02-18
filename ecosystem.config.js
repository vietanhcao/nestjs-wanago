module.exports = {
  apps: [
    {
      name: 'serve-data-prod',
      script: 'dist/main.js',
      // cwd: __dirname, // path-to-project
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      user: 'root',
      host: '188.166.240.52',
      ref: 'origin/master',
      repo: 'git@github.com:vietanhcao/nestjs-wanago.git',
      path: '/root/apps/nestjs-wanago',
      'pre-deploy-local': '',
      'post-deploy':
        'cd /root/apps/nestjs-wanago && NODE_ENV=production npm run --production=false;npm run build;pm2 startOrReload ecosystem.config.js',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
