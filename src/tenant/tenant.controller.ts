import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDTO } from 'src/dto/createTenant.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get(':subdomain')
  async findOne(@Param('subdomain') subdomain: string) {
    try {
      return await this.tenantService.findOne(subdomain);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  async update(@Body() updateTenant: CreateTenantDTO) {
    try {
      const { _id, ...updateDto } = updateTenant;
      return await this.tenantService.update(_id, updateDto as CreateTenantDTO);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
