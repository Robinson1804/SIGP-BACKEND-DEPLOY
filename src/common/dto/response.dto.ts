import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiPropertyOptional()
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };

  @ApiProperty()
  timestamp: string;
}

export class ErrorResponseDto {
  @ApiProperty({ default: false })
  success: boolean;

  @ApiProperty()
  error: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty()
  timestamp: string;
}
