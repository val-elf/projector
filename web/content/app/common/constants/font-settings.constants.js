(function(){
	'use strict';
	angular.module('projector.constants')
		.constant('TextStyles',
		{
			heading1style: {format:'h1', title: 'Heading 1'},
			heading2style: {format:'h2', title: 'Heading 2'},
			heading3style: {format:'h3', title: 'Heading 3'},
			heading4style: {format:'h4', title: 'Heading 4'},
			heading5style: {format:'h5', title: 'Heading 5'},
			heading6style: {format:'h6', title: 'Heading 6'},
			paragraph6style: {format: 'p', title: 'Paragraph'}
		})
		.constant('FontNames', 
		{
			arialFont: {inline: 'span', styles: {fontFamily : 'Arial'}, title: 'Arial'},
			calibriFont: {inline: 'span',styles: {fontFamily : 'Calibri'}, title: 'Calibri'},
			comicFont: {inline: 'span', styles: {fontFamily : 'Comic Sans Ms'}, title: 'Comic Sans'},
			tahomaFont: {inline: 'span', styles: {fontFamily : 'Tahoma'}, title: 'Tahoma'},
			verdanaFont: {inline: 'span', styles: {fontFamily : 'Verdana'}, title: 'Verdana'},
			timesFont: {inline: 'span', styles: {fontFamily : 'Times New Roman'}, title: 'Times New Roman'}
		})
		.constant('FontSizes', 
		{
			'size8px': {inline: 'span', styles: {fontSize : '8px'}, title: '8px'},
			'size9px': {inline: 'span', styles: {fontSize : '9px'}, title: '9px'},
			'size10px': {inline: 'span', styles: {fontSize : '10px'}, title: '10px'},
			'size11px': {inline: 'span', styles: {fontSize : '11px'}, title: '11px'},
			'size12px': {inline: 'span', styles: {fontSize : '12px'}, title: '12px'},
			'size14px': {inline: 'span', styles: {fontSize : '14px'}, title: '14px'},
			'size16px': {inline: 'span', styles: {fontSize : '16px'}, title: '16px'},
			'size18px': {inline: 'span', styles: {fontSize : '18px'}, title: '18px'},
			'size20px': {inline: 'span', styles: {fontSize : '20px'}, title: '20px'},
			'size24px': {inline: 'span', styles: {fontSize : '24px'}, title: '24px'},
			'size28px': {inline: 'span', styles: {fontSize : '28px'}, title: '28px'},
			'size32px': {inline: 'span', styles: {fontSize : '32px'}, title: '32px'},
			'size40px': {inline: 'span', styles: {fontSize : '40px'}, title: '40px'},
			'size64px': {inline: 'span', styles: {fontSize : '64px'}, title: '64px'},
			'size72px': {inline: 'span', styles: {fontSize : '72px'}, title: '72px'}
		})
	;

})();
