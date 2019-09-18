const MUITheme = {
	palette: {
		input: {
			bottomLine: '#4A9CA6',
		},
		text: {
			primary: '#371C63',
		},
	},
	overrides: {
		MuiFormControl: {
			root: {
				minWidth: null
			}
		},
		MuiPaper: {
			rounded: {
				borderRadius: '6px',
			},
		},
		MuiButton: {
			root: {
				minWidth: 'auto'
			},
		},
		MuiIconButton: {
			root: {
				color: '#371C63',
				boxShadow: 'none',
			},
		},
		MuiInputLabel: {
			root: {
				whiteSpace: 'nowrap',
			}
		},
		MuiPickersDay: {
			day: {
				boxShadow: 'none',
			},
			selected: {
				backgroundColor: '#371C63',
			},
		},
		MuiPickersToolbar: {
			toolbar: {
				backgroundColor: '#371C63',
			},
		},
		MuiInput: {
			root: {
				marginRight: '10px'
			},
		},
		MuiSvgIcon: {
			root: {
				fill: '#371C63',
			},
		},
	},
	typography: {
		fontSize: 14,
		button: {
			textTransform: 'none',
		},
	},
};

export {
	MUITheme
};
