import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { AdminProfile } from './entities/admin-profile.entity';
import { SeedModule } from './seed/seed.module';
import { EmailModule } from './email/email.module';
import { InvitationModule } from './invitation/invitation.module';
import { AdminModule } from './admin/admin.module';
import { StudentModule } from './student/student.module';
import { BatchModule } from './batch/batch.module';
import { ProgramModule } from './program/program.module';
import { PloModule } from './plo/plo.module';
import { CoursesModule } from './courses/courses.module';

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
        TypeOrmModule.forFeature([User, AdminProfile]),

    UserModule,
    AuthModule,
    SeedModule,
    EmailModule, 
    InvitationModule,  // Add this
    AdminModule,   
    StudentModule,
    BatchModule,
    ProgramModule,
    PloModule,
    CoursesModule,
  ],  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
