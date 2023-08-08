import { EMethod, Route, Router } from '~/network';
import { Timespots } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';

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
    // description: Update timespot
    @Route(EMethod.PUT, '/timespots/:timespotId')
    public async updateTimespot(key, timespot) {
        console.warn('[API] Update timespot', key);
        return this.model.update(key.timespotId, timespot);
    }

    // @OA:route
    // description: Create timespot
    @Route(EMethod.POST, '/timeline/:timelineId/timespots')
    public async createTimespot(key, timespot) {
        console.warn('[API] Create single timespot', key);
        return await this.model.createTimespot(key.timelineId, timespot);
    }

    // @OA:route
    // description: Get timespots
    @Route(EMethod.DELETE, '/timespots/:timespotId')
    public async deleteTimespot(key) {
        console.warn('[API] Delete timespot', key.timespotId);
        await this.model.deleteTimespot(key.timespot);
        return { delete: true };
    }
}
