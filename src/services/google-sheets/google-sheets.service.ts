import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleSheetsService {
  private sheets: any;
  private sheetId: string; // Replace with your Google Sheet ID

  constructor(private configService: ConfigService) {
    this.sheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    this.setupGoogleSheetsAPI();
  }

  private setupGoogleSheetsAPI() {
    const keyPath = path.join(__dirname, '..', '..', '..', 'key.json');
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/spreadsheets'],
    );

    jwtClient.authorize((err, tokens) => {
      if (err) {
        throw err;
      }
      this.sheets = google.sheets({ version: 'v4', auth: jwtClient });
    });
  }

  async getSheetNames(): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId,
        fields: 'sheets.properties.title',
      });

      const sheetsList = response.data.sheets.map(
        (sheet) => sheet.properties.title,
      );

      const prefix = '✓'; // Specify the static prefix here
      const filteredSheetNames = sheetsList.filter(
        (name) => !name.startsWith(prefix),
      );

      return filteredSheetNames;
    } catch (error) {
      console.error('Error fetching sheet names from Google Sheet:', error);
      return [];
    }
  }

  async renameSheet(sheetIndex: number, newName: string): Promise<void> {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheetIndex,
                  title: newName,
                },
                fields: 'title',
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error renaming sheet in Google Sheet:', error);
      throw error;
    }
  }
}
