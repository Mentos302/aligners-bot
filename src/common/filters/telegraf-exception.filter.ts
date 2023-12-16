import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from 'src/interfaces/context.interface';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const telegrafHost = TelegrafArgumentsHost.create(host);
    const ctx = telegrafHost.getContext<Context>();

    console.log(exception);

    await ctx.replyWithHTML(`⚙️ Щось пішло не так, <b>спробуйте пізніше</b>`);
  }
}
