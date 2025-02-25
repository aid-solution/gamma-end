import { BadRequestException, Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('connection')
  async getConnection(@Req() request: Request): Promise<any> {
    const tenantName = (request.headers['X-TENANT-NAME'] ||
      request.headers['x-tenant-name'] ||
      request.headers['X-Tenant-Name']) as string;
    if (!tenantName) new BadRequestException('x-tenant-name_header_is_missed');
    const connection = await this.appService.getConnection(tenantName);
    return { name: connection.name, readyState: connection.readyState };
  }
}
