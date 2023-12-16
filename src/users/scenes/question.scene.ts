import { Markup } from 'telegraf';
import { UseFilters } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Ctx, Message } from 'nestjs-telegraf';
import { Context, SceneState } from 'src/interfaces/context.interface';
import { SCENE_SETTINGS } from 'src/common/config/scene';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';
import { SanityService } from 'src/sanity/sanity.service';

@Scene('question', SCENE_SETTINGS)
@UseFilters(TelegrafExceptionFilter)
export class QuestionScene {
  constructor(private readonly sanityService: SanityService) {}

  @SceneEnter()
  async onSceneEnter(ctx: Context) {
    await ctx.replyWithPhoto({
      url: (ctx.scene.state as SceneState).speaker.photoUrl,
    });

    ctx.replyWithHTML(
      `📗 Напишіть запитання для спікера:`,
      Markup.inlineKeyboard([
        [{ text: `↩️ Повернутись назад `, callback_data: 'back' }],
      ]),
    );
  }

  @On('text')
  async onText(@Ctx() ctx: Context, @Message('text') question: string) {
    await this.sanityService.addQuestionToSpeaker(
      (ctx.scene.state as SceneState).speaker.name,
      question,
    );

    ctx.replyWithHTML(
      `✅ Дякуємо, ваше питання додано!`,
      Markup.inlineKeyboard([
        {
          text: `↩️ Повернутись назад `,
          callback_data: 'back',
        },
      ]),
    );

    ctx.scene.leave();
  }

  @Action('back')
  async onBack(ctx: Context): Promise<void> {
    ctx.answerCbQuery();

    ctx.scene.enter('speakers', { ...(ctx.scene.state as SceneState) });
  }

  @On('message')
  async onMessage(ctx: Context): Promise<void> {
    ctx.scene.reenter();
  }
}
