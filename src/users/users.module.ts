import { Module } from '@nestjs/common';
import { SanityService } from 'src/sanity/sanity.service';
import { SpeakersScene } from './scenes/speakers.scene';
import { QuestionScene } from './scenes/question.scene';
import { SanityModule } from 'src/sanity/sanity.module';
import { WelcomeScene } from './scenes/welcome.scene';
import { GoogleSheetsService } from 'src/services/google-sheets/google-sheets.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [SanityModule],
  providers: [
    ConfigService,
    SpeakersScene,
    QuestionScene,
    WelcomeScene,
    GoogleSheetsService,
  ],
})
export class UsersModule {}
