import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    private minioClient: Minio.Client;
    private readonly bucketName = 'fragrances';

    constructor(configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: configService.get('MINIO_END_POINT'),
            port: configService.get('MINIO_PORT'),
            useSSL: false,
            accessKey: configService.get('MINIO_ACCESS_KEY'),
            secretKey: configService.get('MINIO_SECRET_KEY'),
        });
    }

    async onModuleInit() {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, '');
            console.log(`Bucket ${this.bucketName} created successfully.`);
        }
    }

    async uploadFile(file: Express.Multer.File, folderName: string): Promise<string> {
        try {
            const objectName = ${ folderName }/${Date.now()}-${file.originalname};

            await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size, {
                'Content-Type': file.mimetype,
            });

            return http://127.0.0.1:9000/${this.bucketName}/${objectName};
        } catch (error) {
            console.error('Minio Upload Error:', error);
            throw new Error('Failed to upload file to Minio');
        }
    }

}