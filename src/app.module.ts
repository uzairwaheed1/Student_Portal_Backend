import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
 imports: [
    ConfigModule.forRoot({
      isGlobal: true, // so you can use process.env anywhere
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, // automatically loads entities
      synchronize: true, // only for development, not for production
    }),
    UserModule,
    AuthModule,
  ],  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
