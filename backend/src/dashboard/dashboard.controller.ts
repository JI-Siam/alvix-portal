import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { ADMIN_ROLES } from '../common/enums';
import { DashboardService } from './dashboard.service';

@Roles(...ADMIN_ROLES)
@Controller('dashboard')
export class DashboardController {
  constructor(private s: DashboardService) {}
  @Get('stats') stats() { return this.s.stats(); }
}
