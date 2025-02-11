import dbInit, { ITestDb } from '../../helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('metrics_serial', getLogger, {
        experimental: { flags: { newApplicationList: true } },
    });
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                newApplicationList: true,
            },
        },
    });
});

beforeEach(async () => {
    await app.services.clientInstanceService.createApplication({
        appName: 'demo-app-1',
        strategies: ['default'],
        //@ts-ignore
        announced: true,
    });
    await app.services.clientInstanceService.createApplication({
        appName: 'demo-app-2',
        strategies: ['default', 'extra'],
        description: 'hello',
        //@ts-ignore
        announced: true,
    });
    await app.services.clientInstanceService.createApplication({
        appName: 'deletable-app',
        strategies: ['default'],
        description: 'Some desc',
        //@ts-ignore
        announced: true,
    });

    await db.stores.clientInstanceStore.insert({
        appName: 'demo-app-1',
        instanceId: 'test-1',
    });
    await db.stores.clientInstanceStore.insert({
        appName: 'demo-seed-2',
        instanceId: 'test-2',
    });
    await db.stores.clientInstanceStore.insert({
        appName: 'deletable-app',
        instanceId: 'inst-1',
    });

    await app.services.clientInstanceService.createApplication({
        appName: 'usage-app',
        strategies: ['default'],
        description: 'Some desc',
        project: 'default',
        environment: 'dev',
    });
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    await db.reset();
});

test('should get application details', async () => {
    return app.request
        .get('/api/admin/metrics/applications/demo-app-1')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.appName).toBe('demo-app-1');
            expect(res.body.instances).toHaveLength(1);
        });
});

test('should get list of applications', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.applications).toHaveLength(4);
        });
});

test('should delete application', async () => {
    expect.assertions(2);
    await app.request
        .delete('/api/admin/metrics/applications/deletable-app')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
    return app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.applications).toHaveLength(3);
        });
});

test('deleting an application should be idempotent, so expect 200', async () => {
    expect.assertions(1);
    return app.request
        .delete('/api/admin/metrics/applications/unknown')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
});

test('should get list of application usage', async () => {
    const { body } = await app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(200);
    const application = body.applications.find(
        (selectableApp) => selectableApp.appName === 'usage-app',
    );
    expect(application).toMatchObject({
        appName: 'usage-app',
        usage: [{ project: 'default', environments: ['dev'] }],
    });
});
