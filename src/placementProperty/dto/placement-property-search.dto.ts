import { Expose, Transform, Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsInt,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PlacementPropertyStatus } from "./placement-property-status-update.dto";

// Accepts either a single value or an array in the request body and normalizes to an array,
// matching the array + In() filter convention cohort search uses for parentId/status/cohortId.
const toArray = ({ value }) => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.length === 0 ? undefined : value;
  return [value];
};

export class SearchPlacementPropertyDto {
  @ApiPropertyOptional({
    type: [String],
    description: "State Id(s)",
  })
  @Expose()
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  stateId?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: "District Id(s)",
  })
  @Expose()
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  districtId?: string[];

  @ApiPropertyOptional({ type: String, description: "Pincode" })
  @Expose()
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ type: String, description: "Industry" })
  @Expose()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ type: String, description: "Domain" })
  @Expose()
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ type: String, description: "Property name (partial match)" })
  @Expose()
  @IsOptional()
  @IsString()
  propertyName?: string;

  @ApiPropertyOptional({ enum: PlacementPropertyStatus, description: "Status" })
  @Expose()
  @IsOptional()
  @IsEnum(PlacementPropertyStatus, {
    message: "Status must be one of: active, inactive",
  })
  status?: PlacementPropertyStatus;

  @ApiPropertyOptional({ type: Number, description: "Page number", default: 1 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ type: Number, description: "Page size", default: 20 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
