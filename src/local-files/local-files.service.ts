import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { LocalFiles, LocalFilesDocument } from './local-files.chema';
import LocalFileDto from './local-files.dto';

@Injectable()
export class LocalFilesService {
  constructor(
    @InjectModel(LocalFiles.name)
    private localFilesModel: Model<LocalFilesDocument>,
  ) {}

  async saveLocalFileData(fileData: LocalFileDto, author: User) {
    const createdFileDdata = new this.localFilesModel({
      ...fileData,
      author,
    });
    return createdFileDdata.save();
  }

  async getFileById(fieldId: string) {
    const file = await this.localFilesModel.findById(fieldId);
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }
}
