export const States = {
	SET_TIMELINE: 'SET_TIMELINE',
	LOCATION_CHANGE_PARENT: 'LOCATION_CHANGE_PARENT'
};

const initialState = {
	timeline: undefined,
};

export function Project (state = initialState, action) {
	switch(action.type) {
		case States.SET_TIMELINE:
			return { ...state, timeline: action.timeline };
		case States.LOCATION_CHANGE_PARENT:
			return { ...state, parent: action.parent };
		default: return state;
	}
}