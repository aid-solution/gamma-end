import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Get('/:user_id')
  async findById(@Param('user_id') id: string) {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'An unknown error arised');
    }
  }

  @Get()
  async all() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error, 'An unknown error arised');
    }
  }
}
