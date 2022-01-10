import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { S3 } from 'aws-sdk';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Files, FilesDocument } from './files.schema';

@Injectable()
class FilesService {
  constructor(
    @InjectModel(Files.name) private fileModel: Model<FilesDocument>,
    private readonly configService: ConfigService,
  ) {}

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();

    const createdFiles = new this.fileModel({
      key: uploadResult.Key,
      url: uploadResult.Location,
    });
    return createdFiles.save();
    // return newFile;
  }

  async deletePublicFile(fileId: string) {
    const file = await this.fileModel.findById(fileId);
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      })
      .promise();
    await this.fileModel.findByIdAndDelete(fileId);
  }
}

export default FilesService;
