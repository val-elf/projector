import React from "react";
import PropTypes from "prop-types";
import template from "./project-documents.template.rt";
import { DocumentsService } from "~/api/models/document.model";

export class ProjectDocuments extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	alert = React.createRef();
	galleryRef = React.createRef();

	state = {
		selectedCategory: null,
		categories: [],
	};

	documentsService = DocumentsService;

	get gallery() { return this.galleryRef.current; }

	get project() { return this.props.project; }

	prepareTreeView(categories) {
		return [
			{
				id: this.project.id,
				name: this.project.name,
				category: this.project,
				children: categories
			}
		];
	}

	async selectCategory(category) {
		if (!category) return;
		await this.setState({
			selectedCategory: category.category || category
		});
		if (this.gallery) this.gallery.refreshGallery();
	}

	async prepareOwner(url, file) {
		//we should be created new document Item there
		const owner = this.state.selectedCategory.category || this.state.selectedCategory;
		var doc = DocumentsService.createDocument(file, owner);
		const savedDoc = await doc.save();
		return url.replace(/owner=.*/, `owner=${savedDoc.id}`);
	}

	deleteSelected() {
		this.alert.current.open(true, undefined, {
			beforeClose: (state) => {
				if (state) {
					const { selectedDocuments } = this.state;
					return Promise.all(Object.keys(selectedDocuments).map(did => {
						return selectedDocuments[did].delete();
					}));
				}
			}
		}).then(() => {
			this.refresh();
		}, () => {});
	}

	openFileInfo(document) {
		this.detailsModal.open(document);
	}

	render() {
		return template.call(this);
	}
}
