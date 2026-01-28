import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';
import * as Minio from 'minio';

// Mock MinIO Client
jest.mock('minio');

describe('MinioService', () => {
  let service: MinioService;
  let configService: jest.Mocked<ConfigService>;
  let mockMinioClient: jest.Mocked<Minio.Client>;

  beforeEach(async () => {
    mockMinioClient = {
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
      setBucketPolicy: jest.fn(),
      listBuckets: jest.fn(),
      presignedPutObject: jest.fn(),
      presignedGetObject: jest.fn(),
      putObject: jest.fn(),
      statObject: jest.fn(),
      getObject: jest.fn(),
      removeObject: jest.fn(),
      removeObjects: jest.fn(),
      copyObject: jest.fn(),
      listObjectsV2: jest.fn(),
      newPostPolicy: jest.fn(),
      presignedPostPolicy: jest.fn(),
    } as any;

    (Minio.Client as jest.Mock).mockImplementation(() => mockMinioClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                'storage.minio.endpoint': 'localhost',
                'storage.minio.port': 9000,
                'storage.minio.useSSL': false,
                'storage.minio.accessKey': 'minioadmin',
                'storage.minio.secretKey': 'minioadmin',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should create buckets if they do not exist', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(false);
      mockMinioClient.makeBucket.mockResolvedValue();
      mockMinioClient.setBucketPolicy.mockResolvedValue();

      await service.onModuleInit();

      expect(mockMinioClient.bucketExists).toHaveBeenCalledTimes(4);
      expect(mockMinioClient.makeBucket).toHaveBeenCalledTimes(4);
    });

    it('should not create buckets if they already exist', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(true);

      await service.onModuleInit();

      expect(mockMinioClient.bucketExists).toHaveBeenCalledTimes(4);
      expect(mockMinioClient.makeBucket).not.toHaveBeenCalled();
    });

    it('should set public read policy for avatares bucket', async () => {
      mockMinioClient.bucketExists.mockImplementation((bucket: string) => {
        return Promise.resolve(bucket !== service.BUCKETS.AVATARES);
      });
      mockMinioClient.makeBucket.mockResolvedValue();
      mockMinioClient.setBucketPolicy.mockResolvedValue();

      await service.onModuleInit();

      expect(mockMinioClient.setBucketPolicy).toHaveBeenCalledWith(
        service.BUCKETS.AVATARES,
        expect.any(String),
      );
    });

    it('should handle errors when creating buckets', async () => {
      mockMinioClient.bucketExists.mockRejectedValue(
        new Error('Connection error'),
      );

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status with bucket list', async () => {
      mockMinioClient.listBuckets.mockResolvedValue([
        { name: 'bucket1', creationDate: new Date() },
        { name: 'bucket2', creationDate: new Date() },
      ]);

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.buckets).toEqual(['bucket1', 'bucket2']);
    });

    it('should return unhealthy status on error', async () => {
      mockMinioClient.listBuckets.mockRejectedValue(new Error('Connection error'));

      const result = await service.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.buckets).toEqual([]);
    });
  });

  describe('getPresignedPutUrl', () => {
    it('should generate presigned PUT URL', async () => {
      const expectedUrl = 'https://minio.example.com/bucket/object?signature=...';
      mockMinioClient.presignedPutObject.mockResolvedValue(expectedUrl);

      const result = await service.getPresignedPutUrl('test-bucket', 'test-object');

      expect(result).toBe(expectedUrl);
      expect(mockMinioClient.presignedPutObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
        service.DEFAULT_PRESIGNED_TTL,
      );
    });

    it('should use custom TTL when provided', async () => {
      const expectedUrl = 'https://minio.example.com/bucket/object?signature=...';
      mockMinioClient.presignedPutObject.mockResolvedValue(expectedUrl);

      await service.getPresignedPutUrl('test-bucket', 'test-object', 7200);

      expect(mockMinioClient.presignedPutObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
        7200,
      );
    });
  });

  describe('getPresignedGetUrl', () => {
    it('should generate presigned GET URL', async () => {
      const expectedUrl = 'https://minio.example.com/bucket/object?signature=...';
      mockMinioClient.presignedGetObject.mockResolvedValue(expectedUrl);

      const result = await service.getPresignedGetUrl('test-bucket', 'test-object');

      expect(result).toBe(expectedUrl);
      expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
        service.DEFAULT_PRESIGNED_TTL,
      );
    });
  });

  describe('putObject', () => {
    it('should upload object successfully', async () => {
      const buffer = Buffer.from('test data');
      mockMinioClient.putObject.mockResolvedValue({
        etag: 'test-etag',
        versionId: 'test-version',
      });

      const result = await service.putObject(
        'test-bucket',
        'test-object',
        buffer,
        buffer.length,
      );

      expect(result.etag).toBe('test-etag');
      expect(result.versionId).toBe('test-version');
      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
        buffer,
        buffer.length,
        expect.objectContaining({
          'Content-Type': 'application/octet-stream',
        }),
      );
    });

    it('should use custom metadata when provided', async () => {
      const buffer = Buffer.from('test data');
      mockMinioClient.putObject.mockResolvedValue({
        etag: 'test-etag',
        versionId: null,
      });

      await service.putObject('test-bucket', 'test-object', buffer, buffer.length, {
        'Content-Type': 'application/pdf',
        'X-Custom-Header': 'custom-value',
      });

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
        buffer,
        buffer.length,
        expect.objectContaining({
          'Content-Type': 'application/pdf',
          'X-Custom-Header': 'custom-value',
        }),
      );
    });
  });

  describe('statObject', () => {
    it('should return object stats', async () => {
      const mockStats = {
        size: 1024,
        etag: 'test-etag',
        lastModified: new Date(),
      };
      mockMinioClient.statObject.mockResolvedValue(mockStats as any);

      const result = await service.statObject('test-bucket', 'test-object');

      expect(result).toEqual(mockStats);
      expect(mockMinioClient.statObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
      );
    });
  });

  describe('objectExists', () => {
    it('should return true if object exists', async () => {
      mockMinioClient.statObject.mockResolvedValue({} as any);

      const result = await service.objectExists('test-bucket', 'test-object');

      expect(result).toBe(true);
    });

    it('should return false if object does not exist', async () => {
      mockMinioClient.statObject.mockRejectedValue({ code: 'NotFound' });

      const result = await service.objectExists('test-bucket', 'test-object');

      expect(result).toBe(false);
    });

    it('should throw error for non-NotFound errors', async () => {
      mockMinioClient.statObject.mockRejectedValue(new Error('Network error'));

      await expect(
        service.objectExists('test-bucket', 'test-object'),
      ).rejects.toThrow('Network error');
    });
  });

  describe('getObject', () => {
    it('should return object stream', async () => {
      const mockStream = {} as any;
      mockMinioClient.getObject.mockResolvedValue(mockStream);

      const result = await service.getObject('test-bucket', 'test-object');

      expect(result).toBe(mockStream);
      expect(mockMinioClient.getObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
      );
    });
  });

  describe('getObjectAsBuffer', () => {
    it('should return object as buffer', async () => {
      const mockData = Buffer.from('test data');
      const mockStream: any = {
        on: jest.fn((event, handler) => {
          if (event === 'data') handler(mockData);
          if (event === 'end') handler();
          return mockStream;
        }),
      };
      mockMinioClient.getObject.mockResolvedValue(mockStream);

      const result = await service.getObjectAsBuffer('test-bucket', 'test-object');

      expect(result).toEqual(mockData);
    });

    it('should handle stream errors', async () => {
      const mockStream: any = {
        on: jest.fn((event, handler) => {
          if (event === 'error') handler(new Error('Stream error'));
          return mockStream;
        }),
      };
      mockMinioClient.getObject.mockResolvedValue(mockStream);

      await expect(
        service.getObjectAsBuffer('test-bucket', 'test-object'),
      ).rejects.toThrow('Stream error');
    });
  });

  describe('removeObject', () => {
    it('should remove object successfully', async () => {
      mockMinioClient.removeObject.mockResolvedValue();

      await service.removeObject('test-bucket', 'test-object');

      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-object',
      );
    });
  });

  describe('removeObjects', () => {
    it('should remove multiple objects successfully', async () => {
      const objectKeys = ['object1', 'object2', 'object3'];
      mockMinioClient.removeObjects.mockResolvedValue();

      await service.removeObjects('test-bucket', objectKeys);

      expect(mockMinioClient.removeObjects).toHaveBeenCalledWith(
        'test-bucket',
        objectKeys,
      );
    });
  });

  describe('copyObject', () => {
    it('should copy object successfully', async () => {
      mockMinioClient.copyObject.mockResolvedValue({
        etag: 'new-etag',
        lastModified: new Date(),
      } as any);

      const result = await service.copyObject(
        'source-bucket',
        'source-key',
        'dest-bucket',
        'dest-key',
      );

      expect(result.etag).toBeDefined();
      expect(result.lastModified).toBeDefined();
    });
  });

  describe('listObjects', () => {
    it('should list objects in bucket', async () => {
      const mockObjects = [
        { name: 'object1', size: 100 },
        { name: 'object2', size: 200 },
      ];
      const mockStream: any = {
        on: jest.fn((event, handler) => {
          if (event === 'data') {
            mockObjects.forEach((obj) => handler(obj));
          }
          if (event === 'end') handler();
          return mockStream;
        }),
      };
      mockMinioClient.listObjectsV2.mockReturnValue(mockStream);

      const result = await service.listObjects('test-bucket');

      expect(result).toEqual(mockObjects);
    });

    it('should handle stream errors', async () => {
      const mockStream: any = {
        on: jest.fn((event, handler) => {
          if (event === 'error') handler(new Error('List error'));
          return mockStream;
        }),
      };
      mockMinioClient.listObjectsV2.mockReturnValue(mockStream);

      await expect(service.listObjects('test-bucket')).rejects.toThrow('List error');
    });
  });

  describe('getBucketSize', () => {
    it('should calculate total bucket size', async () => {
      const mockObjects = [
        { name: 'object1', size: 100 },
        { name: 'object2', size: 200 },
        { name: 'object3', size: 300 },
      ];
      const mockStream: any = {
        on: jest.fn((event, handler) => {
          if (event === 'data') {
            mockObjects.forEach((obj) => handler(obj));
          }
          if (event === 'end') handler();
          return mockStream;
        }),
      };
      mockMinioClient.listObjectsV2.mockReturnValue(mockStream);

      const result = await service.getBucketSize('test-bucket');

      expect(result).toBe(600);
    });

    it('should return 0 for empty bucket', async () => {
      const mockStream: any = {
        on: jest.fn((event, handler) => {
          if (event === 'end') handler();
          return mockStream;
        }),
      };
      mockMinioClient.listObjectsV2.mockReturnValue(mockStream);

      const result = await service.getBucketSize('test-bucket');

      expect(result).toBe(0);
    });
  });

  describe('getPublicUrl', () => {
    it('should generate public URL', () => {
      const result = service.getPublicUrl('test-bucket', 'test-object');

      expect(result).toBe('http://localhost:9000/test-bucket/test-object');
    });

    it('should use HTTPS when SSL is enabled', () => {
      configService.get = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'storage.minio.useSSL') return true;
        if (key === 'storage.minio.endpoint') return 'minio.example.com';
        if (key === 'storage.minio.port') return 443;
        return defaultValue;
      });

      const result = service.getPublicUrl('test-bucket', 'test-object');

      expect(result).toBe('https://minio.example.com:443/test-bucket/test-object');
    });
  });

  describe('getClient', () => {
    it('should return MinIO client instance', () => {
      const client = service.getClient();

      expect(client).toBe(mockMinioClient);
    });
  });
});
