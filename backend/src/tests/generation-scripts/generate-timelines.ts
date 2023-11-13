import { ITimeline, ITimespot } from '~/backend/entities/models';
import { IGenerationScript } from '../model';
import { utils } from '../utils';
import { GenerateProjects } from './generate-projects';
import { core } from '../core';

type TClientTimespot = Omit<ITimespot, '_coretype' | '_hash'>;
type TClientTimeline = Omit<ITimeline, '_coretype' | '_hash'> & { timespots: TClientTimespot[] };

export class GenerateTimelines implements IGenerationScript {
    public async *generate() {
        const projects = await GenerateProjects.getRandomProjects(6);
        const projectIds = projects.map(p => p._id);

        for await(const projectId of projectIds) {
            yield *this.generateNewTimelines(projectId as string);
        }
    }

    private async *generateNewTimelines(projectId: string) {
        const timelinesCount = Math.round(Math.random() * 6) + 5;
        const timelines = await Promise.all(new Array(timelinesCount).fill(null).map(() => this.createTimelineInstance()));
        for await(const timeline of timelines) {
            yield *this.createTimeline(projectId, timeline);
        }
    }

    private async *createTimeline(projectId: string, timeline: TClientTimeline) {
        await core.post(`/projects/${projectId}/timelines`, timeline);
        yield true;
    }

    private async createTimelineInstance(): Promise<TClientTimeline> {
        const name = utils.textGenerator.genName(2, 3, true);
        const description = utils.textGenerator.getText(3);
        const startDate = utils.getRandomDate(new Date(2010, 0, 1), new Date(2040, 0, 1));
        const endDate = new Date(startDate.getTime() + Math.round(Math.random() * 63072000000));
        const timeline = {
            name,
            description,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            locked: false,
        } as TClientTimeline;
        const timespots = await this.createTimelineTimespots(timeline);
        timeline.timespots = timespots;
        return Promise.resolve(timeline);
    }

    private async createTimelineTimespots(timeline: TClientTimeline): Promise<TClientTimespot[]> {
        const timespotsCount = Math.round(Math.random() * 6) + 5;
        return await Promise.all(new Array(timespotsCount).fill(null).map(() => this.createTimespotInstance(timeline)));
    }

    private async createTimespotInstance(timeline: TClientTimeline): Promise<TClientTimespot> {
        const title = utils.textGenerator.genName(2, 3, true);
        const description = utils.textGenerator.getText(3);
        const minDate = new Date(timeline.startDate);
        const maxDate = new Date(timeline.endDate);
        const startDate = utils.getRandomDate(minDate, maxDate);
        const endDate = utils.getRandomDate(startDate, maxDate);
        return Promise.resolve({
            title,
            description,
            startDate: startDate.toISOString(),
            startOffsetX: startDate.getTime(),
            endDate: endDate.toISOString(),
            endOffsetX: endDate.getTime(),
            locked: false,
        });
    }
}