import { Markup } from 'telegraf';
import { UseFilters } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Ctx, Message } from 'nestjs-telegraf';
import { Context, SceneState } from 'src/interfaces/context.interface';
import { SCENE_SETTINGS } from 'src/common/config/scene';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';
import { SanityService } from 'src/sanity/sanity.service';

@Scene('speakers', SCENE_SETTINGS)
@UseFilters(TelegrafExceptionFilter)
export class SpeakersScene {
  @SceneEnter()
  async onSceneEnter(ctx: Context) {
    const { speakers } = ctx.scene.state as SceneState;

    ctx.replyWithHTML(
      `🔭 Оберіть спікера, якому хочете задати запитання:`,
      Markup.inlineKeyboard([
        ...speakers.reverse().map(({ name }) => [
          {
            text: name,
            callback_data: name,
          },
        ]),
        [{ text: `↩️ Повернутись назад`, callback_data: 'back' }],
      ]),
    );
  }

  @Action('back')
  async onBack(ctx: Context): Promise<void> {
    ctx.answerCbQuery();

    ctx.scene.enter('welcome');
  }

  @On('callback_query')
  async onSubjectChoosing(ctx: Context) {
    await ctx.scene.enter('question', {
      ...ctx.scene.state,
      speaker: (ctx.scene.state as SceneState).speakers.find(
        (speaker) => speaker.name === (ctx.callbackQuery as any).data,
      ),
    });

    ctx.answerCbQuery();
  }

  @On('message')
  async onMessage(ctx: Context): Promise<void> {
    ctx.scene.reenter();
  }
}
