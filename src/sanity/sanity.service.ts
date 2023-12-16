import { Injectable } from '@nestjs/common';
import { SanityClient, createClient } from '@sanity/client';

@Injectable()
export class SanityService {
  private client: SanityClient;

  constructor() {
    this.client = createClient({
      useCdn: false,
      projectId: 'sofrqv1r',
      dataset: 'production',
      token:
        'sk4w7iVj6R2lS4ky1rwlQQuisFR05ExBHLWj8VbWXFLQxWWdUDS4hB54rssb0HvNP8BXeMwB7AaQGw3z2x10THWjiCPzmyVWTA1ix2f3WzgnUkn8Fwl0HotGS4xhxaIghtI1uRCiSt29jnywpTtPLpvJZ02pTE7gFaRAK5Yf5oq3OcSpzPYT',
    });
  }

  async getUserByChatId(chatId: number): Promise<User> {
    const query = `*[_type == "user" && chat_id == $chatId]{
      name,
      chat_id
    }[0]`;

    return this.client.fetch(query, { chatId });
  }

  async createUser(chatId: number) {
    const user = {
      _type: 'user',
      chat_id: chatId,
    };

    return this.client.create(user);
  }

  async getSpeakers() {
    const query = `*[_type == "speaker"]{
      name,
      "photoUrl": photo.asset->url
    }`;

    return this.client.fetch(query);
  }

  async addQuestionToSpeaker(speakerName: string, question: string) {
    const query = `*[_type == "speaker" && name == $speakerName]`;

    const speakers = await this.client.fetch(query, { speakerName });

    if (speakers && speakers.length > 0) {
      const speaker = speakers[0];

      if (!speaker.questions) {
        speaker.questions = [];
      }

      speaker.questions.push(String(question));

      await this.client
        .patch(speaker._id)
        .set({ questions: speaker.questions })
        .commit();

      return speaker;
    }

    throw new Error('Speaker not found or "questions" field does not exist.');
  }
}
