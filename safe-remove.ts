// 去除src/env/文件下的.env.*文件中的邮箱和密码

import * as fs from 'fs';
import * as path from 'path';

function removePassword() {
  const envPath = path.resolve(__dirname, './src/env');
  const files = fs.readdirSync(envPath);
  files.forEach((file) => {
    if (file.includes('.env')) {
      const filePath = path.resolve(envPath, file);
      const data = fs.readFileSync(filePath, 'utf-8');
      // 将邮箱和密码对应的value替换为xxx
      const newData = data.replace(
        /(nodemailer_auth_user|nodemailer_auth_pass) = .*/g,
        '$1 = xxx',
      );
      fs.writeFileSync(filePath, newData);
    }
  });
}

function main() {
  removePassword();
  console.log('Done!');
}

main();
