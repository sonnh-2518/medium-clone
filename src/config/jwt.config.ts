import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export function jwtConfig(): JwtModuleOptions {
  return {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    signOptions: {
      expiresIn: (process.env.JWT_EXPIRES_IN ??
        '1d') as JwtSignOptions['expiresIn'],
    },
  };
}
