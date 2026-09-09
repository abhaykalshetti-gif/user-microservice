import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlacementPropertyController } from "./placementProperty.controller";
import { PlacementPropertyService } from "./placementProperty.service";
import { PlacementProperty } from "./entities/placement-property.entity";
import { State } from "src/cohort/entities/state.entity";
import { Location } from "src/location/entities/location.entity";
import { UserRoleMapping } from "src/rbac/assign-role/entities/assign-role.entity";
import { Role } from "src/rbac/role/entities/role.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([PlacementProperty, State, Location, UserRoleMapping, Role]),
  ],
  controllers: [PlacementPropertyController],
  providers: [PlacementPropertyService],
  exports: [PlacementPropertyService],
})
export class PlacementPropertyModule {}
