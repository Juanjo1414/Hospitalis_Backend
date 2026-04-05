import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditLogService } from "../../audit-log/audit-log.service";
import { AuditAction } from "../../audit-log/audit-log.schema";

/** Métodos HTTP mapeados a AuditAction */
const METHOD_ACTION: Record<string, AuditAction> = {
  POST:   AuditAction.CREATE,
  PUT:    AuditAction.UPDATE,
  PATCH:  AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

/** Rutas que NO queremos auditar */
const SKIP_PATHS = ["/auth/login", "/auth/register", "/audit"];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req    = context.switchToHttp().getRequest();
    const method = req.method as string;
    const path   = req.path as string;

    // Solo auditar POST / PUT / PATCH / DELETE
    const action = METHOD_ACTION[method];
    if (!action) return next.handle();

    // Saltamos rutas excluidas
    if (SKIP_PATHS.some(p => path.startsWith(p))) return next.handle();

    return next.handle().pipe(
      tap({
        next: (body) => {
          const user      = req.user;
          const resource  = path.split("/")[1] ?? path; // ej: "patients"
          const resourceId = body?._id?.toString() ?? req.params?.id ?? null;

          this.auditService.log({
            userId:       user?.sub ?? null,
            userFullName: user?.fullName ?? "",
            action,
            resource,
            resourceId,
            description:  `${method} ${path}`,
            ipAddress:    req.ip ?? "",
            statusCode:   200,
          });
        },
        error: (err) => {
          const user = req.user;
          const resource = path.split("/")[1] ?? path;
          this.auditService.log({
            userId:       user?.sub ?? null,
            userFullName: user?.fullName ?? "",
            action,
            resource,
            resourceId:  req.params?.id ?? null,
            description: `${method} ${path} — ERROR: ${err?.message ?? "unknown"}`,
            ipAddress:   req.ip ?? "",
            statusCode:  err?.status ?? 500,
          });
        },
      }),
    );
  }
}