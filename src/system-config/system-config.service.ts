import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SystemConfig, SystemConfigDocument } from "./system-config.schema";

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectModel(SystemConfig.name)
    private readonly model: Model<SystemConfigDocument>,
  ) {}

  /** Obtiene la configuración global (o la crea con defaults si no existe) */
  async get() {
    let config = await this.model.findOne({ key: "global" });
    if (!config) {
      config = await this.model.create({ key: "global" });
    }
    return config;
  }

  /** Actualiza campos de la configuración global */
  async update(dto: Partial<SystemConfig>) {
    const config = await this.get();
    Object.assign(config, dto);
    return config.save();
  }
}