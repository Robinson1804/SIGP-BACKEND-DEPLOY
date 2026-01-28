import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Nombre del campo en el request (puede ser email o username)
      passwordField: 'password',
      passReqToCallback: true, // Necesario para acceder a todo el body
    });
  }

  async validate(
    req: Request,
    emailOrUsername: string,
    password: string,
  ): Promise<any> {
    // Determinar si se envio email o username
    const body = req.body as { email?: string; username?: string };
    const identifier = body.email || body.username;

    if (!identifier) {
      throw new UnauthorizedException(
        'Email or username is required',
      );
    }

    const user = await this.authService.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
