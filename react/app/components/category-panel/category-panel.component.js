import React from "react";
import PropTypes from "prop-types";
import template from "./category-panel.template";
import { CategoriesService } from "api";

export class CategoryPanel extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired,
		stateService: PropTypes.object.isRequired,
		router: PropTypes.object.isRequired
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { owner } = props;
		if (owner !== newState.owner) newState.owner = owner;
		return newState;
	}

	state = {
		categories: []
	};

	setFilter(value) {
		if (!value){
			this.setState({ match: null });
			return;
		}

		const reg = new RegExp(`(${value})`, 'ig');
		const categories = CategoriesService.flatList(this.state.categories);
		const match = categories.filter(cat => reg.test((cat.category || cat).name)).map(_cat => {
			const res = {
				category: _cat,
				pattern: reg
			}
			return res;
		});

		this.setState({
			match
		});
	}

	applyFilter(event) {
		const { key } = event.nativeEvent;
		switch(key) {
			case "Enter":
				const { match, selected} = this.state;
				if (match) {
					let startIndex = selected ? match.findIndex(({category}) => selected === category) : -1;
					if (startIndex === match.length - 1) startIndex = -1;
					const { category: nextCat } = match[startIndex + 1];
					if (nextCat && nextCat !== selected) this.selectCategory(nextCat);
				}
			break;
		}
	}

	getMatchedName(category, node) {
		if (this.state.match && this.searchFocused) {
			const { match } = this.state;
			const item = match.find(el => el.category === category);
			if (item) {
				const parts = category.name.split(item.pattern);
				setTimeout(() => {
					if (!node.expanded) node.expandParentBranch();
				});
				return parts.map((part, index) => {
					if (index % 2) return (<span key={index} className="highlight">{ part }</span>)
					return (<span key={index}>{ part }</span>)
				});
			}
		}
		return (<span>{category.name}</span>);
	}

	get searchFocused() {
		return this.state.searchFocused;
	}

	set searchFocused(searchFocused) {
		this.setState({ searchFocused });
	}

	async initState() {
		const { owner } = this.state;
		const state = {};
		if (!owner) return;
		const { stateService } = this.context;
		const { category: categoryId } = stateService.params;
		await this.freshCategories(state);
		const { categories } = state;
		if (categories) {
			const selected = categoryId && this.categories.find(cat => cat.id === categoryId) || categories[0];
			this.defineSelected(selected, state);
		}
		this.setState(state);
	}

	componentDidMount() {
		this.initState();
	}

	async componentDidUpdate(pprops, pstate) {
		const { owner, selected } = this.state;
		if (pstate.owner !== owner) {
			await this.initState();
		}
		if (pstate.selected !== selected) {
			if (this.props.onSelect) this.props.onSelect(selected);
		}
	}

	async freshCategories(state) {
		let { owner, categories } = this.state;
		if (!owner) return categories;
		this.categories = await CategoriesService.getList({}, this.state.owner);
		categories = this.categories.prepareTreeView();
		if (this.props.prepareTree) categories = this.props.prepareTree(categories);
		Object.assign(state, { categories });
	}

	async defineSelected(category, state) {
		Object.assign(state, { selected: category });
	}

	async selectCategory(category) {
		const { stateService } = this.context;
		const { selected } = this.state;
		let { category: categoryId } = stateService.params;
		if (!categoryId) categoryId = selected && selected.id || undefined;
		const same = category.id === categoryId
		if (!same) {
			await stateService.go(stateService.current.name, { category: category.id });
			this.setState({ selected: category });
		}
		else if (this.props.onSelect) this.props.onSelect && this.props.onSelect(category);
	}

	async addNewCategory(parent, event) {
		event && event.stopPropagation();
		const category = CategoriesService.create({ parent }, this.props.owner);
		try {
			await this.createCategoryWindow.open(true, { category });
			await category.save();
			this.categories.flush();
			const state = { };
			await this.freshCategories(state);
			state.selected = this.categories.find(cat => cat.id === category.id);
			this.setState(state);
		} catch (error) { }
	}

	render() {
		return template.call(this);
	}
}