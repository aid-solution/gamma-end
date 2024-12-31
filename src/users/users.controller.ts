import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import { UserDTO } from 'src/dto/user.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';
import { AffectationService } from 'src/affectation/affectation.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly affectationService: AffectationService,
  ) {}

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
      const users: any[] = await this.usersService.findAll();
      const usersWithFonction: any[] = [];
      for (const user of users) {
        const last = await this.affectationService.latestByAgentWithPopulate(
          user.agent as unknown as string,
        );
        usersWithFonction.push({
          identifiant: user.login,
          nomPrenom: `${user.agent.nom} ${user.agent.prenom}`,
          fonction: last[0].fonction.libelle,
          profil: user.profil.libelle,
          _id: user._id,
        });
      }
      return usersWithFonction;
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
  @UsePipes(ConvertToOriginalTypePipe)
  async updateUser(@Body() userDto: UserDTO) {
    const { _id, ...user } = userDto;
    const createUserDto = user as unknown as CreateUserDTO;
    try {
      return await this.usersService.update(_id, createUserDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
