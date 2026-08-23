import type { AdminAbuseReportDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdminService } from './admin.service';
import { CreateAbuseReportDto } from './dto/admin.dto';
export declare class ReportsController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createReport(user: JwtPayload, dto: CreateAbuseReportDto): Promise<AdminAbuseReportDto>;
}
