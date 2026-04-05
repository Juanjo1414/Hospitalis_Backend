import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles/roles.decorator";
import { RolesGuard } from "../auth/roles/roles.guard";
import { Role } from "../auth/roles/roles.enum";
import { AuditLogService } from "./audit-log.service";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles(Role.ADMIN)
@Controller("audit")
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  /** GET /audit  — solo admin */
  @Get()
  findAll(@Query() q: any) {
    return this.service.findAll({
      userId:   q.userId,
      resource: q.resource,
      action:   q.action,
      from:     q.from,
      to:       q.to,
      page:     q.page  ? +q.page  : 1,
      limit:    q.limit ? +q.limit : 30,
    });
  }
}