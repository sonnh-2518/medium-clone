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

export function refreshJwtConfig(): {
  secret: string;
  expiresIn: JwtSignOptions['expiresIn'];
} {
  return {
    secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as JwtSignOptions['expiresIn'],
  };
}
