import {
  Controller,
  Post,
  Patch,
  Body,
  Res,
  Headers,
  UseGuards,
  UseFilters,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBody, ApiHeader, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiForbiddenResponse } from "@nestjs/swagger";
import { Response } from "express";
import { isUUID } from "class-validator";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { AllExceptionsFilter } from "src/common/filters/exception.filter";
import { APIID } from "src/common/utils/api-id.config";
import { API_RESPONSES } from "@utils/response.messages";
import { GetUserId } from "src/common/decorators/getUserId.decorator";
import { PlacementPropertyService } from "./placementProperty.service";
import { CreatePlacementPropertyDto } from "./dto/placement-property-create.dto";
import { UpdatePlacementPropertyDto } from "./dto/placement-property-update.dto";
import { UpdatePlacementPropertyStatusDto } from "./dto/placement-property-status-update.dto";
import { SearchPlacementPropertyDto } from "./dto/placement-property-search.dto";

@ApiTags("Placement Property")
@Controller("placement-property")
@UseGuards(JwtAuthGuard)
export class PlacementPropertyController {
  constructor(private readonly placementPropertyService: PlacementPropertyService) {}

  private getTenantId(headers): string {
    const tenantId = headers["tenantid"];
    if (!tenantId || !isUUID(tenantId)) {
      throw new BadRequestException(API_RESPONSES.TENANTID_VALIDATION);
    }
    return tenantId;
  }

  @UseFilters(new AllExceptionsFilter(APIID.PLACEMENT_PROPERTY_CREATE))
  @Post("/create")
  @ApiBody({ type: CreatePlacementPropertyDto })
  @ApiCreatedResponse({ description: "Placement Property created successfully" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @ApiForbiddenResponse({ description: "Only Central Admin can perform this action" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiHeader({ name: "tenantid" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  public async createPlacementProperty(
    @Headers() headers,
    @Body() dto: CreatePlacementPropertyDto,
    @Res() response: Response,
    @GetUserId("userId", ParseUUIDPipe) userId: string
  ) {
    const tenantId = this.getTenantId(headers);
    return this.placementPropertyService.createPlacementProperty(tenantId, userId, dto, response);
  }

  @UseFilters(new AllExceptionsFilter(APIID.PLACEMENT_PROPERTY_UPDATE))
  @Patch("/update")
  @ApiBody({ type: UpdatePlacementPropertyDto })
  @ApiOkResponse({ description: "Placement Property updated successfully" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @ApiForbiddenResponse({ description: "Only Central Admin can perform this action" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiHeader({ name: "tenantid" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  public async updatePlacementProperty(
    @Headers() headers,
    @Body() dto: UpdatePlacementPropertyDto,
    @Res() response: Response,
    @GetUserId("userId", ParseUUIDPipe) userId: string
  ) {
    const tenantId = this.getTenantId(headers);
    return this.placementPropertyService.updatePlacementProperty(tenantId, userId, dto, response);
  }

  @UseFilters(new AllExceptionsFilter(APIID.PLACEMENT_PROPERTY_STATUS_UPDATE))
  @Patch("/status")
  @ApiBody({ type: UpdatePlacementPropertyStatusDto })
  @ApiOkResponse({ description: "Placement Property status updated successfully" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @ApiForbiddenResponse({ description: "Only Central Admin can perform this action" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiHeader({ name: "tenantid" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  public async updatePlacementPropertyStatus(
    @Headers() headers,
    @Body() dto: UpdatePlacementPropertyStatusDto,
    @Res() response: Response,
    @GetUserId("userId", ParseUUIDPipe) userId: string
  ) {
    const tenantId = this.getTenantId(headers);
    return this.placementPropertyService.updatePlacementPropertyStatus(tenantId, userId, dto, response);
  }

  @UseFilters(new AllExceptionsFilter(APIID.PLACEMENT_PROPERTY_SEARCH))
  @Post("/search")
  @ApiBody({ type: SearchPlacementPropertyDto })
  @ApiOkResponse({ description: "Placement Property list" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @ApiForbiddenResponse({ description: "Not authorized to search Placement Properties" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiHeader({ name: "tenantid" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  public async searchPlacementProperty(
    @Headers() headers,
    @Body() dto: SearchPlacementPropertyDto,
    @Res() response: Response,
    @GetUserId("userId", ParseUUIDPipe) userId: string
  ) {
    const tenantId = this.getTenantId(headers);
    return this.placementPropertyService.searchPlacementProperty(tenantId, userId, dto, response);
  }
}
