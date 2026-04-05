import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditLog, AuditLogDocument, AuditAction } from "./audit-log.schema";

export interface CreateAuditLogDto {
  userId?:       string | null;
  userFullName?: string;
  action:        AuditAction;
  resource:      string;
  resourceId?:   string | null;
  description?:  string;
  ipAddress?:    string;
  statusCode?:   number | null;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly model: Model<AuditLogDocument>,
  ) {}

  /** Registra una entrada en el log (no lanza errores para no romper el flujo) */
  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.model.create({
        ...dto,
        userId: dto.userId ? new Types.ObjectId(dto.userId) : null,
      });
    } catch {
      // El audit log nunca debe romper la operación principal
    }
  }

  async findAll(query: {
    userId?:    string;
    resource?:  string;
    action?:    string;
    from?:      string;
    to?:        string;
    page?:      number;
    limit?:     number;
  }) {
    const filter: Record<string, any> = {};

    if (query.userId)   filter.userId   = new Types.ObjectId(query.userId);
    if (query.resource) filter.resource = query.resource;
    if (query.action)   filter.action   = query.action;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to)   filter.createdAt.$lte = new Date(query.to);
    }

    const page  = Math.max(1, query.page  ?? 1);
    const limit = Math.min(100, query.limit ?? 30);
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .populate("userId", "fullname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }
}