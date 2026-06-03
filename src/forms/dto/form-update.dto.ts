import {
  IsOptional,
  IsString,
  IsObject,
  IsNotEmptyObject,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
export class FormUpdateDto {
  @ApiPropertyOptional({
    type: String,
    description: 'title',
    example: 'Sample Form',
  })
  @IsString()
  @IsOptional()
  title: string;
  @ApiPropertyOptional({
    type: String,
    description: 'context',
    example: 'Context',
  })
  @IsString()
  @IsOptional()
  context: string;
  @ApiPropertyOptional({
    type: String,
    description: 'contextType',
    example: 'ContextType',
  })
  @IsString()
  @IsOptional()
  contextType: string;
  @ApiPropertyOptional({
    description: 'fields',
  })
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  fields?: any;
  updatedBy: string;
}