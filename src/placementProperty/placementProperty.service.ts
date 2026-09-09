import { HttpStatus, Injectable, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Response } from "express";
import { PlacementProperty } from "./entities/placement-property.entity";
import { State } from "src/cohort/entities/state.entity";
import { Location } from "src/location/entities/location.entity";
import { UserRoleMapping } from "src/rbac/assign-role/entities/assign-role.entity";
import { Role } from "src/rbac/role/entities/role.entity";
import { CreatePlacementPropertyDto } from "./dto/placement-property-create.dto";
import { UpdatePlacementPropertyDto } from "./dto/placement-property-update.dto";
import { UpdatePlacementPropertyStatusDto } from "./dto/placement-property-status-update.dto";
import { SearchPlacementPropertyDto } from "./dto/placement-property-search.dto";
import APIResponse from "src/common/responses/response";
import { APIID } from "src/common/utils/api-id.config";
import { API_RESPONSES } from "@utils/response.messages";
import { LoggerUtil } from "src/common/logger/LoggerUtil";

const CENTRAL_ADMIN_ROLE = "Central Admin";
const PLACEMENT_HEAD_ROLE = "Placement Head";

@Injectable()
export class PlacementPropertyService {
  constructor(
    @InjectRepository(PlacementProperty)
    private readonly placementPropertyRepository: Repository<PlacementProperty>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(UserRoleMapping)
    private readonly userRoleMappingRepository: Repository<UserRoleMapping>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  // Central Admin/Placement Head are role titles resolved via UserRoleMapping -> Roles,
  // the same lookup used by UserService.findUserRoles - no dedicated RBAC guard exists yet for role titles.
  private async getUserRoleTitle(userId: string, tenantId: string): Promise<string | null> {
    const mapping = await this.userRoleMappingRepository.findOne({
      where: { userId, tenantId },
    });
    if (!mapping) {
      return null;
    }
    const role = await this.roleRepository.findOne({
      where: { roleId: mapping.roleId },
      select: ["title"],
    });
    return role?.title || null;
  }

  private async assertRole(userId: string, tenantId: string, allowedRoles: string[]) {
    const roleTitle = await this.getUserRoleTitle(userId, tenantId);
    if (!roleTitle || !allowedRoles.some((r) => r.toLowerCase() === roleTitle.toLowerCase())) {
      throw new ForbiddenException(API_RESPONSES.ONLY_CENTRAL_ADMIN_ALLOWED);
    }
  }

  private async validateStateAndDistrict(stateId: string, districtId: string) {
    const state = await this.stateRepository.findOne({ where: { value: stateId } });
    if (!state) {
      throw new BadRequestException(API_RESPONSES.STATE_NOT_FOUND);
    }

    const district = await this.locationRepository.findOne({
      where: { id: districtId, type: "district" },
    });
    if (!district) {
      throw new BadRequestException(API_RESPONSES.DISTRICT_NOT_FOUND);
    }

    if (district.parentid !== stateId) {
      throw new BadRequestException(API_RESPONSES.DISTRICT_STATE_MISMATCH);
    }
  }

  async createPlacementProperty(
    tenantId: string,
    userId: string,
    dto: CreatePlacementPropertyDto,
    response: Response
  ): Promise<Response> {
    const apiId = APIID.PLACEMENT_PROPERTY_CREATE;
    try {
      await this.assertRole(userId, tenantId, [CENTRAL_ADMIN_ROLE]);
      await this.validateStateAndDistrict(dto.stateId, dto.districtId);

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
      await this.assertRole(userId, tenantId, [CENTRAL_ADMIN_ROLE]);

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

      const stateId = dto.stateId ?? existing.stateId;
      const districtId = dto.districtId ?? existing.districtId;
      if (dto.stateId || dto.districtId) {
        await this.validateStateAndDistrict(stateId, districtId);
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
      await this.assertRole(userId, tenantId, [CENTRAL_ADMIN_ROLE]);

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
      await this.assertRole(userId, tenantId, [CENTRAL_ADMIN_ROLE, PLACEMENT_HEAD_ROLE]);

      const page = dto.page && dto.page > 0 ? dto.page : 1;
      const limit = dto.limit && dto.limit > 0 ? dto.limit : 20;

      const query = this.placementPropertyRepository.createQueryBuilder("placementProperty");

      if (dto.stateId) {
        query.andWhere("placementProperty.stateId = :stateId", { stateId: dto.stateId });
      }
      if (dto.districtId) {
        query.andWhere("placementProperty.districtId = :districtId", { districtId: dto.districtId });
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

      const stateIds = [...new Set(results.map((r) => r.stateId).filter(Boolean))];
      const districtIds = [...new Set(results.map((r) => r.districtId).filter(Boolean))];

      const states = stateIds.length
        ? await this.stateRepository.find({ where: { value: In(stateIds) } })
        : [];
      const districts = districtIds.length
        ? await this.locationRepository.find({ where: { id: In(districtIds) } })
        : [];

      const stateMap = new Map(states.map((s) => [s.value, s]));
      const districtMap = new Map(districts.map((d) => [d.id, d]));

      const data = results.map((property) => {
        const state = stateMap.get(property.stateId);
        const district = districtMap.get(property.districtId);
        return {
          placementPropertyId: property.placementPropertyId,
          propertyName: property.propertyName,
          state: state ? { id: state.value, name: state.name } : null,
          district: district ? { id: district.id, name: district.name } : null,
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
    if (e instanceof ForbiddenException) {
      return APIResponse.error(
        response,
        apiId,
        e.message,
        "Forbidden",
        HttpStatus.FORBIDDEN
      );
    }
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
