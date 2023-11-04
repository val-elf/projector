import { EMethod, Route, Router } from '~/network';
import { Timespots } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { IInitTimeline, IInitTimespot, ITimespot } from '~/backend/entities/models';

// @OA:tag
// name: Timespots
// description: Timespots management API
@Router()
export class TimespotsRouter implements IRouter {
    model: Timespots;

    configure(app: Service) {
        this.model = new Timespots(app);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Update timespot
    // parameters: [timespotId: Timespot ID]
    // requestBody: [item: IInitTimespot]
    // responses: [200: Timespot instance]
    @Route(EMethod.PUT, '/timespots/:timespotId')
    public async updateTimespot(key, timespot: IInitTimespot): Promise<ITimespot> {
        console.warn('[API] Update timespot', key);
        return this.model.update(key.timespotId, timespot);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // parameters: [timelineId: Timeline ID]
    // requestBody: [item: IInitTimespot]
    // responses: [200: Timespot instance]
    // description: Create timespot
    @Route(EMethod.POST, '/timeline/:timelineId/timespots')
    public async createTimespot(key, timespot: IInitTimespot): Promise<ITimespot> {
        console.warn('[API] Create single timespot', key);
        return await this.model.createTimespot(key.timelineId, timespot);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Get timespots
    // parameters: [timespotId: Timespot ID]
    // responses: [200: Deleted timespot flat]
    @Route(EMethod.DELETE, '/timespots/:timespotId')
    public async deleteTimespot(key): Promise<{ delete: boolean }> {
        console.warn('[API] Delete timespot', key.timespotId);
        const isDelete = await this.model.deleteTimespot(key.timespot);
        return { delete: isDelete };
    }
}
