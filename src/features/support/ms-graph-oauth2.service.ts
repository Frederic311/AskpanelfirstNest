import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MsGraphOAuth2Service {
  private readonly tokenUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tenantId: string;
  private readonly scope: string;

  constructor() {
    this.clientId = process.env['microsoft.graph.client-id'];
    this.clientSecret = process.env['microsoft.graph.client-secret'];
    this.tenantId = process.env['microsoft.graph.tenant-id'];
    this.scope = process.env['microsoft.graph.scope'];
    this.tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
  }

  async getAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('scope', this.scope);
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(this.tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data.access_token;
  }
}
