import { Markup, Telegraf } from 'telegraf';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { On, Update, Ctx, Action, InjectBot } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';
import { AdminGuard } from 'src/admin/admin.guard';
import { SanityService } from 'src/sanity/sanity.service';
import { InputMediaPhoto } from 'telegraf/typings/core/types/typegram';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class UsersUpdate {
  constructor(private readonly sanityService: SanityService) {}
  @On(['message', 'callback_query'])
  async onMessage(@Ctx() ctx: Context) {
    if (ctx.updateType === 'callback_query') ctx.answerCbQuery();

    const user = await this.sanityService.getUserByChatId(ctx.from.id);

    if (!user) await this.sanityService.createUser(ctx.from.id);

    ctx.scene.enter('welcome');
  }
}
