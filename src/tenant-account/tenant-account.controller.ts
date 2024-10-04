import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TenantAccountService } from './tenant-account.service';
import { CreateTenantAccountDTO } from 'src/dto/createTenantAccount.dto';
import { TenantAccountDTO } from 'src/dto/TenantAccount.dto';
import { UpdateTenantAccountDTO } from 'src/dto/updateTenantAccount.dto';

@Controller('tenant-account')
export class TeanantAccountController {
  constructor(private readonly tenantAccountService: TenantAccountService) {}

  @Post()
  @HttpCode(201)
  async createAbsence(@Body() tentnatAccount: TenantAccountDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = tentnatAccount;
    const createAbsenceDto = rest as unknown as CreateTenantAccountDTO;
    try {
      return await this.tenantAccountService.create(createAbsenceDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.tenantAccountService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.tenantAccountService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateAbsence(@Body() updateTenantAccountDto: TenantAccountDTO) {
    try {
      return await this.tenantAccountService.update(
        updateTenantAccountDto as unknown as UpdateTenantAccountDTO,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
