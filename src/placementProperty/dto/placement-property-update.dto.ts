import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEmail,
  IsBoolean,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePlacementPropertyDto {
  @ApiProperty({ type: String, description: "Placement Property Id to update" })
  @Expose()
  @IsNotEmpty({ message: "Placement Property Id is required" })
  @IsUUID(undefined, { message: "Placement Property Id must be a valid UUID" })
  placementPropertyId: string;

  @ApiPropertyOptional({ type: String, description: "Name of the placement property" })
  @Expose()
  @IsOptional()
  @IsNotEmpty({ message: "Property name cannot be empty" })
  propertyName?: string;

  @ApiPropertyOptional({ type: String, description: "State Id" })
  @Expose()
  @IsOptional()
  @IsNotEmpty({ message: "State Id cannot be empty" })
  stateId?: string;

  @ApiPropertyOptional({ type: String, description: "District Id" })
  @Expose()
  @IsOptional()
  @IsNotEmpty({ message: "District Id cannot be empty" })
  districtId?: string;

  @ApiPropertyOptional({ type: String, description: "Pincode of the property" })
  @Expose()
  @IsOptional()
  @Matches(/^[0-9]{6}$/, { message: "Pincode must be exactly 6 digits" })
  pincode?: string;

  @ApiPropertyOptional({ type: String, description: "Industry" })
  @Expose()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ type: String, description: "Domain" })
  @Expose()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ type: String, description: "Contact number of the property" })
  @Expose()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: "Property contact must be exactly 10 digits" })
  propertyContact?: string;

  @ApiPropertyOptional({ type: String, description: "Email of the property" })
  @Expose()
  @IsOptional()
  @IsEmail({}, { message: "Please provide a valid email address" })
  propertyEmail?: string;

  @ApiPropertyOptional({ type: Boolean, description: "Medical insurance available" })
  @Expose()
  @IsOptional()
  @IsBoolean({ message: "medicalInsurance must be a boolean value" })
  medicalInsurance?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: "Medical assistance available" })
  @Expose()
  @IsOptional()
  @IsBoolean({ message: "medicalAssistance must be a boolean value" })
  medicalAssistance?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: "Property is sanitised" })
  @Expose()
  @IsOptional()
  @IsBoolean({ message: "propertySanitised must be a boolean value" })
  propertySanitised?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: "Transportation facility available" })
  @Expose()
  @IsOptional()
  @IsBoolean({ message: "transportationFacility must be a boolean value" })
  transportationFacility?: boolean;

  @Expose()
  updatedBy: string;

  constructor(obj?: Partial<UpdatePlacementPropertyDto>) {
    if (obj) {
      Object.assign(this, obj);
    }
  }
}
