import { TimelinePage } from "./timeline-page.component";
import { store } from "~/index";
import { TimelinesService } from "~/api/models/timeline.model";

const routes = [
	{
		name: 'timeline',
		description: 'TIMELINE',
		url: '/:timelineId?:timespot',
		component: TimelinePage,
		onExit: function(trans) {
			const from = trans.from();
			const to = trans.to();
			if (from.name === to.name) return;
			store.dispatch({
				type: 'SET_TIMELINE',
				timeline: undefined
			});
		},
		resolve: [
			{
				token: 'timeline',
				deps: ['project', '$transition$'],
				resolveFn: async (project, trans) => {
					const { timelineId, timespot } = trans.params();
					const tl = await TimelinesService.getItem(timelineId, true, project);
					return tl;
				}
			},
			{
				token: 'timespot',
				deps: ['timeline', '$transition$'],
				resolveFn: (timeline, trans) => {
					const { timespot } = trans.params();
					if (!timespot) return;
					return timeline.timespots.find(ts => ts.id === timespot);
				}
			}
		]
	}
];

export const TimelineModule = {
	routes,
};