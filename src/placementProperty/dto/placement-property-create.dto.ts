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

export class CreatePlacementPropertyDto {
  @ApiProperty({ type: String, description: "Name of the placement property" })
  @Expose()
  @IsNotEmpty({ message: "Property name is required" })
  propertyName: string;

  @ApiProperty({ type: String, description: "State Id" })
  @Expose()
  @IsNotEmpty({ message: "State Id is required" })
  stateId: string;

  @ApiProperty({ type: String, description: "District Id" })
  @Expose()
  @IsNotEmpty({ message: "District Id is required" })
  districtId: string;

  @ApiProperty({ type: String, description: "Pincode of the property" })
  @Expose()
  @IsNotEmpty({ message: "Pincode is required" })
  @Matches(/^[0-9]{6}$/, { message: "Pincode must be exactly 6 digits" })
  pincode: string;

  @ApiPropertyOptional({ type: String, description: "Industry" })
  @Expose()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ type: String, description: "Domain" })
  @Expose()
  @IsOptional()
  domain?: string;

  @ApiProperty({ type: String, description: "Contact number of the property" })
  @Expose()
  @IsNotEmpty({ message: "Property contact is required" })
  @Matches(/^[0-9]{10}$/, { message: "Property contact must be exactly 10 digits" })
  propertyContact: string;

  @ApiProperty({ type: String, description: "Email of the property" })
  @Expose()
  @IsNotEmpty({ message: "Property email is required" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  propertyEmail: string;

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
  createdBy: string;

  @Expose()
  updatedBy: string;

  constructor(obj?: Partial<CreatePlacementPropertyDto>) {
    if (obj) {
      Object.assign(this, obj);
    }
  }
}
