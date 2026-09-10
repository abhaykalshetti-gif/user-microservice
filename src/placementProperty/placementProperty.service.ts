import { HttpStatus, Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Response } from "express";
import { PlacementProperty } from "./entities/placement-property.entity";
import { CreatePlacementPropertyDto } from "./dto/placement-property-create.dto";
import { UpdatePlacementPropertyDto } from "./dto/placement-property-update.dto";
import { UpdatePlacementPropertyStatusDto } from "./dto/placement-property-status-update.dto";
import { SearchPlacementPropertyDto } from "./dto/placement-property-search.dto";
import APIResponse from "src/common/responses/response";
import { APIID } from "src/common/utils/api-id.config";
import { API_RESPONSES } from "@utils/response.messages";
import { LoggerUtil } from "src/common/logger/LoggerUtil";

@Injectable()
export class PlacementPropertyService {
  constructor(
    @InjectRepository(PlacementProperty)
    private readonly placementPropertyRepository: Repository<PlacementProperty>
  ) {}

  async createPlacementProperty(
    tenantId: string,
    userId: string,
    dto: CreatePlacementPropertyDto,
    response: Response
  ): Promise<Response> {
    const apiId = APIID.PLACEMENT_PROPERTY_CREATE;
    try {
      const placementProperty = this.placementPropertyRepository.create({
        ...dto,
        status: "active",
        createdBy: userId,
        updatedBy: userId,
      });
      const result = await this.placementPropertyRepository.save(placementProperty);

      return APIResponse.success(
        response,
        apiId,
        result,
        HttpStatus.CREATED,
        API_RESPONSES.PLACEMENT_PROPERTY_CREATED_SUCCESSFULLY
      );
    } catch (e) {
      return this.handleError(response, apiId, e);
    }
  }

  async updatePlacementProperty(
    tenantId: string,
    userId: string,
    dto: UpdatePlacementPropertyDto,
    response: Response
  ): Promise<Response> {
    const apiId = APIID.PLACEMENT_PROPERTY_UPDATE;
    try {
      const existing = await this.placementPropertyRepository.findOne({
        where: { placementPropertyId: dto.placementPropertyId },
      });
      if (!existing) {
        return APIResponse.error(
          response,
          apiId,
          API_RESPONSES.PLACEMENT_PROPERTY_NOT_FOUND,
          "Not Found",
          HttpStatus.NOT_FOUND
        );
      }

      const { placementPropertyId, ...updateFields } = dto;
      await this.placementPropertyRepository.update(
        { placementPropertyId: dto.placementPropertyId },
        { ...updateFields, updatedBy: userId }
      );

      const updated = await this.placementPropertyRepository.findOne({
        where: { placementPropertyId: dto.placementPropertyId },
      });

      return APIResponse.success(
        response,
        apiId,
        updated,
        HttpStatus.OK,
        API_RESPONSES.PLACEMENT_PROPERTY_UPDATED_SUCCESSFULLY
      );
    } catch (e) {
      return this.handleError(response, apiId, e);
    }
  }

  async updatePlacementPropertyStatus(
    tenantId: string,
    userId: string,
    dto: UpdatePlacementPropertyStatusDto,
    response: Response
  ): Promise<Response> {
    const apiId = APIID.PLACEMENT_PROPERTY_STATUS_UPDATE;
    try {
      const existing = await this.placementPropertyRepository.findOne({
        where: { placementPropertyId: dto.placementPropertyId },
      });
      if (!existing) {
        return APIResponse.error(
          response,
          apiId,
          API_RESPONSES.PLACEMENT_PROPERTY_NOT_FOUND,
          "Not Found",
          HttpStatus.NOT_FOUND
        );
      }

      await this.placementPropertyRepository.update(
        { placementPropertyId: dto.placementPropertyId },
        { status: dto.status, updatedBy: userId }
      );

      const updated = await this.placementPropertyRepository.findOne({
        where: { placementPropertyId: dto.placementPropertyId },
      });

      return APIResponse.success(
        response,
        apiId,
        updated,
        HttpStatus.OK,
        API_RESPONSES.PLACEMENT_PROPERTY_STATUS_UPDATED_SUCCESSFULLY
      );
    } catch (e) {
      return this.handleError(response, apiId, e);
    }
  }

  async searchPlacementProperty(
    tenantId: string,
    userId: string,
    dto: SearchPlacementPropertyDto,
    response: Response
  ): Promise<Response> {
    const apiId = APIID.PLACEMENT_PROPERTY_SEARCH;
    try {
      const page = dto.page && dto.page > 0 ? dto.page : 1;
      const limit = dto.limit && dto.limit > 0 ? dto.limit : 20;

      const query = this.placementPropertyRepository.createQueryBuilder("placementProperty");

      if (dto.stateId?.length) {
        query.andWhere("placementProperty.stateId IN (:...stateId)", { stateId: dto.stateId });
      }
      if (dto.districtId?.length) {
        query.andWhere("placementProperty.districtId IN (:...districtId)", { districtId: dto.districtId });
      }
      if (dto.pincode) {
        query.andWhere("placementProperty.pincode = :pincode", { pincode: dto.pincode });
      }
      if (dto.industry) {
        query.andWhere("placementProperty.industry ILIKE :industry", { industry: `%${dto.industry}%` });
      }
      if (dto.domain) {
        query.andWhere("placementProperty.domain ILIKE :domain", { domain: `%${dto.domain}%` });
      }
      if (dto.propertyName) {
        query.andWhere("placementProperty.propertyName ILIKE :propertyName", {
          propertyName: `%${dto.propertyName}%`,
        });
      }
      if (dto.status) {
        query.andWhere("placementProperty.status = :status", { status: dto.status });
      }

      query.skip((page - 1) * limit).take(limit);

      const [results, total] = await query.getManyAndCount();

      const data = results.map((property) => {
        return {
          placementPropertyId: property.placementPropertyId,
          propertyName: property.propertyName,
          stateId: property.stateId,
          districtId: property.districtId,
          pincode: property.pincode,
          industry: property.industry,
          domain: property.domain,
          propertyContact: property.propertyContact,
          propertyEmail: property.propertyEmail,
          medicalInsurance: property.medicalInsurance,
          medicalAssistance: property.medicalAssistance,
          propertySanitised: property.propertySanitised,
          transportationFacility: property.transportationFacility,
          status: property.status,
        };
      });

      return APIResponse.success(
        response,
        apiId,
        { data, total, page, limit },
        HttpStatus.OK,
        API_RESPONSES.PLACEMENT_PROPERTY_LIST_SUCCESSFULLY
      );
    } catch (e) {
      return this.handleError(response, apiId, e);
    }
  }

  private handleError(response: Response, apiId: string, e: any): Response {
    LoggerUtil.error(`Error in ${apiId}`, e?.message, apiId);
    if (e instanceof BadRequestException) {
      return APIResponse.error(
        response,
        apiId,
        e.message,
        "Bad Request",
        HttpStatus.BAD_REQUEST
      );
    }
    return APIResponse.error(
      response,
      apiId,
      API_RESPONSES.INTERNAL_SERVER_ERROR,
      e?.message || "Internal Server Error",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
