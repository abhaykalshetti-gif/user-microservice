import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlacementPropertyController } from "./placementProperty.controller";
import { PlacementPropertyService } from "./placementProperty.service";
import { PlacementProperty } from "./entities/placement-property.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([PlacementProperty]),
  ],
  controllers: [PlacementPropertyController],
  providers: [PlacementPropertyService],
  exports: [PlacementPropertyService],
})
export class PlacementPropertyModule {}
