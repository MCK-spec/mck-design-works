module.exports = {
  apps: [
    {
      name: 'mck-design-works',
      script: 'server/index.cjs',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
