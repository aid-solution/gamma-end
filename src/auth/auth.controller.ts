import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SignInDTO } from '../dto/signin.dto';
import { AuthService } from './auth.service';
import { ChangePasswordDTO } from '../dto/changePassword.dto';
import { CreateValidationTokenDto } from '../dto/createValidatioToken.dto';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import { compare } from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    //private mailService: MailService,
    private usersService: UsersService,
  ) {}
  @Post('/sign-in')
  @HttpCode(201)
  async signIn(@Body() signInDto: SignInDTO, @Res() response: Response) {
    try {
      const user = await this.usersService.findOneWithLogin(signInDto.login);
      if (!user) throw new NotFoundException(`user_not_found`);

      //check password matching
      const isPasswordMatch = await compare(signInDto.password, user.password);
      if (!isPasswordMatch)
        throw new UnauthorizedException(`Incorrect password`);
      const token = await this.authService.generateAccessToken(user);
      return response.send({ success: true, token });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error, 'something went wrong');
    }
  }

  @Post('/change-pass')
  async firstChangePassword(@Body() changePasswordDto: ChangePasswordDTO) {
    try {
      return await this.authService.firstChangePassword(changePasswordDto);
    } catch (error) {
      throw new InternalServerErrorException(error, 'something went wrong');
    }
  }

  @Get('/token/validity/:token')
  async checkTokenValidity(@Param('token') token: string) {
    try {
      return await this.authService.checkValidation(token);
    } catch (error) {
      throw new InternalServerErrorException(error, 'something went wrong');
    }
  }

  @Post('/token/new')
  @HttpCode(200)
  async resend(@Body() createValidationTokenDto: CreateValidationTokenDto) {
    try {
      const user = await this.usersService.findOneWithLogin(
        createValidationTokenDto.login,
      );

      // check for user existence
      if (!user) throw new NotFoundException(`user_not_found`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const token = await this.authService.createValidationToken(
        createValidationTokenDto,
      );
      //await this.mailService.sendUserConfirmation(user, token);
      return { success: true, message: 'email set successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error, 'something went wrong');
    }
  }

  @UseGuards(AuthGuard)
  @Get('/self')
  async getSelf(@Req() request: Request) {
    return request['user'];
  }

  @Get('/refresh-token')
  async refreshAccessToken(@Req() request: Request) {
    try {
      const refreshToken = request.cookies['refreshToken'];
      const { accessToken } =
        await this.authService.refreshAccessToken(refreshToken);
      return { success: true, accessToken };
    } catch (error) {
      throw new InternalServerErrorException('Invalid refresh token');
    }
  }
}
