import React from "react";
import { InputAdornment } from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
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