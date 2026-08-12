import request from 'supertest';
import app from '../src/app.js';

describe('GET /health (events-service)', () => {
  it('doit retourner le statut UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
    expect(res.body.service).toEqual('events-service');
  });
});
