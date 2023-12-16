import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SanityService } from './sanity/sanity.service';
import { UsersUpdate } from './users/users.update';
import { GoogleSheetsService } from './services/google-sheets/google-sheets.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
      middlewares: [session()],
    }),
    UsersModule,
    AdminModule,
  ],
  providers: [SanityService, UsersUpdate, GoogleSheetsService],
})
export class AppModule {}
