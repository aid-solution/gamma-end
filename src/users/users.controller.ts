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
import { UsersService } from './users.service';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import { UserDTO } from 'src/dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() userDto: UserDTO) {
    delete userDto._id;
    const createUserDto = userDto as unknown as CreateUserDTO;
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.usersService.findUser(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.usersService.findOneWithLogin(search);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  async updateUser(@Body() userDto: UserDTO) {
    const { _id, ...user } = userDto;
    const createUserDto = user as unknown as CreateUserDTO;
    try {
      return await this.usersService.update(_id, createUserDto);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
