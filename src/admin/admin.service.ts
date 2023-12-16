import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class AdminService {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
  ) {}
}
