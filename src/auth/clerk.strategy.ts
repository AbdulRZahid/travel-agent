import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UserService } from '../user/user.service';
import { EnvConfig } from 'src/config/env.config';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private jwks: jwksClient.JwksClient;

  constructor(
    private readonly configService: ConfigService<EnvConfig>,
    private readonly userService: UserService,
  ) {
    super();

    const jwksUrl = configService.get('CLERK_JWKS_URL', { infer: true });
    if (!jwksUrl) {
      throw new Error('CLERK_JWKS_URL is not defined in the configuration');
    }
    this.jwks = jwksClient({
      jwksUri: jwksUrl,
    });
  }

  private getSigningKey = (header: any, callback: jwt.SigningKeyCallback) => {
    this.jwks.getSigningKey(header.kid, function (err, key) {
      const signingKey = key?.getPublicKey();
      callback(err, signingKey);
    });
  };

  async validate(req: Request): Promise<any> {
    const token = req.headers.authorization?.split(' ').pop();

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken: any = await new Promise((resolve, reject) => {
        jwt.verify(token, this.getSigningKey, {}, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        });
      });

      // if you want to sync user on each request, uncomment below and add the fields (e.g. syncedWithBackend) to the token's custom claims or in jwt templetes )
      // let syncAction = false;

      // // Check custom claim: only sync if not already synced
      // // This avoids DB queries on every request!
      // if (!decodedToken.syncedWithBackend) {
      //   console.log(
      //     `⚠️ User ${decodedToken.sub} not synced. Syncing from Clerk...`,
      //   );
      //   const { user, toBeSynced } =
      //     await this.userService.createClerkUserAndSync(decodedToken.sub);
      //   syncAction = toBeSynced;
      // }

      // return {
      //   decodedToken,
      //   syncAction,
      // };
      return { decodedToken };
    } catch (error) {
      console.error('Token validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
