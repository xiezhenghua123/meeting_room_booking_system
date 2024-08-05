import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';

const storage = (pathUrl: string) => {
  if (!pathUrl) {
    throw new Error('文件路径不能为空');
  }
  if (pathUrl[pathUrl.length - 1] !== '/') {
    pathUrl = pathUrl + '/';
  }

  if (pathUrl[0] === '/') {
    pathUrl = pathUrl.slice(1);
  }
  return diskStorage({
    destination: (req, file, cb) => {
      try {
        // 判断文件夹是否存在，不存在则创建
        if (!existsSync(pathUrl)) mkdirSync(pathUrl);
        cb(null, pathUrl);
      } catch (e) {
        cb(new Error('文件夹创建失败'), '');
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() +
        '-' +
        Math.round(Math.random() * 1e9) +
        '-' +
        file.originalname;
      cb(null, uniqueSuffix);
    },
  });
};

export default storage;
