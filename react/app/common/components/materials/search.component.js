import React from "react";
import { InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import template from "./search.template";

export class Search extends React.Component {
	get searchProps() {
		return {
			inputProps: {
				size: 1
			},
			startAdornment: (
				<InputAdornment position="start">
					<SearchIcon />
				</InputAdornment>
			)
		};
	}
	render() {
		return template.call(this);
	}
}