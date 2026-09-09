import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "PlacementProperty" })
export class PlacementProperty {
  @PrimaryGeneratedColumn("uuid")
  placementPropertyId: string;

  @Column()
  propertyName: string;

  @Column()
  propertyContact: string;

  @Column()
  propertyEmail: string;

  @Column("uuid")
  stateId: string;

  @Column("uuid")
  districtId: string;

  @Column()
  pincode: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ type: "boolean", default: false })
  medicalInsurance: boolean;

  @Column({ type: "boolean", default: false })
  medicalAssistance: boolean;

  @Column({ type: "boolean", default: false })
  propertySanitised: boolean;

  @Column({ type: "boolean", default: false })
  transportationFacility: boolean;

  @Column({ default: "active" })
  status: string;

  @CreateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;
}
