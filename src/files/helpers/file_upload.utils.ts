import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname?.toLowerCase()?.match(/\.(jpg|jpeg|png|gif|HEIC)$/)) {
    return callback(
      new HttpException(
        `Unsupported file type ${extname(file.originalname)}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
      false,
    );
  }
  // if (file.size > 100) return callback(new Error('too large'), false);
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  callback(null, file.originalname);
  // const name = file.originalname.split('.')[0];
  // const fileExtName = extname(file.originalname);
  // const randomName = new Date().getTime();
  // callback(null, `${name}-${randomName}${fileExtName}`);
};

export const destination = (req, file, callback) => {
  callback(null, './files/');
};
