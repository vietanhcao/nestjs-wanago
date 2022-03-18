import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { S3 } from 'aws-sdk';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Files, FilesDocument } from './files.schema';
import { PrivateFileDocument, PrivateFile } from './privateFiles.schema';

@Injectable()
class FilesService {
  constructor(
    @InjectModel(Files.name) private fileModel: Model<FilesDocument>,
    @InjectModel(PrivateFile.name)
    private privateFileModel: Model<PrivateFileDocument>,
    private readonly configService: ConfigService,
  ) {}

  async uploadPublicFile(
    dataBuffer: Buffer,
    filename: string,
    ownerId?: string,
  ) {
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
      owner: ownerId || null,
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

  async uploadPrivateFile(
    dataBuffer: Buffer,
    filename: string,
    ownerId: string,
  ) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();

    const createdFiles = new this.privateFileModel({
      key: uploadResult.Key,
      url: uploadResult.Location,
      owner: ownerId,
    });
    return createdFiles.save();
  }

  public async getPrivateFile(fileId: string, ownerId?: string) {
    const s3 = new S3();
    console.log(ownerId);
    const fileInfo = await this.privateFileModel.findById(fileId);
    // const fileInfo = await this.privateFileModel.findOne({
    //   _id: fileId,
    //   owner: ownerId,
    // });
    if (fileInfo) {
      const stream = await s3
        .getObject({
          Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
          Key: fileInfo.key,
        })
        .createReadStream();
      return {
        stream,
        info: fileInfo,
      };
    }
    throw new NotFoundException();
  }

  // URLs that allow access for a specific expiration time.
  public async generatePresignedUrl(key: string) {
    const s3 = new S3();
    //The default expiration time of a presigned URL is 15 minutes
    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
      Key: key,
      // Expires
    });
  }
}

export default FilesService;
