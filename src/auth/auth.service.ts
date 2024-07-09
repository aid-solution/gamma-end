import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateValidationTokenDto } from '../dto/createValidatioToken.dto';
import { ChangePasswordDTO } from '../dto/changePassword.dto';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../schemas/users/user.schema';
import { ProfilDocument } from 'src/schemas/users/profil.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  private async decodeValidationToken(token: string) {
    return await this.jwtService.verifyAsync<CreateValidationTokenDto>(token, {
      secret: process.env.VALIDATION_TOKEN_SECRET,
    });
  }

  async decodeAuthToken(token: string) {
    return this.jwtService.verify<{ id: string; login: string }>(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async generateAccessToken(user: UserDocument) {
    const profil = user.profil as ProfilDocument;
    const payload = {
      id: user._id,
      login: user.login,
      profil: profil.libelle,
    };
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
    });
  }

  async generateRefreshToken(user: UserDocument) {
    const payload = { id: user._id, nom: user.login };
    return await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const user = await this.usersService.findOne(decodedToken.id);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.generateAccessToken(user);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async firstChangePassword(changePasswordDto: ChangePasswordDTO) {
    const data = await this.checkValidation(changePasswordDto.token);
    if (!data.success)
      return new UnauthorizedException('The token is not valid');

    const user = await this.usersService.findOneWithLogin(data.payload.login);
    //check user existence
    if (!user) return new NotFoundException('User not found');
    // check if the user already changed his password
    if (user.password)
      return new UnauthorizedException('User already set a password');

    // hach the password
    const saltRound = bcrypt.genSaltSync();
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.password,
      saltRound,
    );

    user.password = hashedPassword;
    //user.validated = true;
    await user.save();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async createValidationToken(
    createValidationTokenDto: CreateValidationTokenDto,
  ) {
    return await this.jwtService.signAsync(createValidationTokenDto, {
      secret: process.env.VALIDATION_TOKEN_SECRET,
      expiresIn: parseInt(process.env.VALIDATION_TOKEN_DURATION) || 60 * 30,
    });
  }

  async checkValidation(token: string) {
    try {
      const payload = await this.decodeValidationToken(token);
      return { payload, success: true };
    } catch (error) {
      return { success: false, payload: null };
    }
  }
}
