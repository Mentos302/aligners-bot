import { Markup, Telegraf } from 'telegraf';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  On,
  Update,
  Ctx,
  Action,
  InjectBot,
  Scene,
  SceneEnter,
  Command,
} from 'nestjs-telegraf';
import { Context } from '../../interfaces/context.interface';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';
import { AdminGuard } from 'src/admin/admin.guard';
import { SanityService } from 'src/sanity/sanity.service';
import { InputMediaPhoto } from 'telegraf/typings/core/types/typegram';
import { SCENE_SETTINGS } from 'src/common/config/scene';
import { GoogleSheetsService } from 'src/services/google-sheets/google-sheets.service';

@Scene('welcome', SCENE_SETTINGS)
@UseFilters(TelegrafExceptionFilter)
export class WelcomeScene {
  constructor(
    private readonly sanityService: SanityService,
    private readonly googleSheets: GoogleSheetsService,
  ) {}

  @Action('schedule')
  async onSchedule(ctx: Context): Promise<void> {
    await ctx.replyWithPhoto(
      { url: 'https://iili.io/JuWIwLF.jpg' },
      Markup.inlineKeyboard([
        [{ text: 'Задати питання спікеру  ❓', callback_data: 'question' }],
        [{ text: 'Важлива інформація ℹ️', callback_data: 'info' }],
      ]),
    );

    ctx.answerCbQuery();
  }

  @Action('question')
  async onQuestion(ctx: Context): Promise<void> {
    const speakers = await this.sanityService.getSpeakers();

    ctx.scene.enter('speakers', { speakers });

    ctx.answerCbQuery();
  }

  @Action('info')
  async onInfo(ctx: Context): Promise<void> {
    await ctx.replyWithPhoto({ url: 'https://iili.io/JuWAUkx.jpg' });

    await ctx.replyWithPhoto(
      { url: 'https://iili.io/JuWAS7j.jpg' },
      Markup.inlineKeyboard([
        [{ text: 'Програма заходу  📅', callback_data: 'schedule' }],
        [{ text: 'Задати питання спікеру  ❓', callback_data: 'question' }],
      ]),
    );

    ctx.answerCbQuery();
  }

  @Command('feedback')
  @UseGuards(AdminGuard)
  async onFeedback(@Ctx() ctx: Context) {
    const sheets = await this.googleSheets.getSheetNames();

    ctx.replyWithHTML(
      `💫 Оберіть опитування, яке відправити користувачам боту:`,
      Markup.inlineKeyboard([
        ...sheets.map((sheet) => [
          {
            text: sheet,
            callback_data: sheet,
          },
        ]),
        [{ text: `↩️ Повернутись назад`, callback_data: 'rndmsht' }],
      ]),
    );
  }

  @SceneEnter()
  @On(['message', 'callback_query'])
  async onMessage(@Ctx() ctx: Context) {
    if (ctx.updateType === 'callback_query') ctx.answerCbQuery();

    ctx.replyWithHTML(
      `👋 Всім привіт! \n\nМи раді вітати вас на Другому Всеукраїнському конгресі з елайнерів! 🫶\n\n<i>Оберіть, що Вас цікавить:</i>`,
      Markup.inlineKeyboard([
        [{ text: 'Програма заходу  📅', callback_data: 'schedule' }],
        [{ text: 'Задати питання спікеру  ❓', callback_data: 'question' }],
        [{ text: 'Важлива інформація ℹ️', callback_data: 'info' }],
      ]),
    );
  }
}
