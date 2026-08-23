import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { AdminAbuseReportDto } from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdminService } from './admin.service';
import { CreateAbuseReportDto } from './dto/admin.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  createReport(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAbuseReportDto,
  ): Promise<AdminAbuseReportDto> {
    return this.adminService.createAbuseReport(user.sub, dto);
  }
}
