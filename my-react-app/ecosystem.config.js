// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'react-app',
      script: 'cmd',
      args: '/c "npx sirv build --single --host 0.0.0.0 --port 3000"',
      cwd: 'C:/New folder/clinic_update_new/pos/my-react-app',
      interpreter: 'cmd.exe',
      windowsHide: true
    },
    {
      name: 'backend',
      script: 'server.js',
      cwd: 'C:/New folder/clinic_update_new/pos',
      interpreter: 'node',
      watch: true
    }
  ]
};
