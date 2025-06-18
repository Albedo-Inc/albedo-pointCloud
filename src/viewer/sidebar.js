import * as THREE from '../../libs/three.js/build/three.module.js';
import { Utils } from '../utils.js';

export class Sidebar {
	constructor(viewer) {
		this.viewer = viewer;
		this.dom = $('#sidebar_root');
	}

	init() {
		this.initAccordion();
		this.initAppearance();

		$('#potree_version_number').html(
			Potree.version.major + '.' + Potree.version.minor + Potree.version.suffix
		);
	}

	initAccordion() {
		$('.accordion > h3').each(function () {
			let header = $(this);
			let content = header.next();

			//header.addClass('ui-accordion-header');
			content.addClass('ui-accordion-content');

			content.hide();

			header.click(function () {
				content.slideToggle();
			});
		});

		// let languages = [
		// 	["en", "English"],
		// 	["fr", "Français"],
		// 	["de", "Deutsch"],
		// 	["jp", "日本語"],
		// 	["es", "Español"],
		// 	["cn", "中文"],
		// 	["pt", "Português"]
		// ];
		// let languageSelection = $('#potree_languages');
		// for(let i = 0; i < languages.length; i++){
		// 	let [key, value] = languages[i];
		// 	let element = $(`<a>${value}</a>`);
		// 	element.click(() => this.viewer.setLanguage(key));
		// 	languageSelection.append(element);
		// 	if(i < languages.length - 1){
		// 		languageSelection.append($(', '));
		// 	}
		// }

		$('#menu_appearance').trigger('click');
	}

	initAppearance() {
		const sldPointBudget = this.dom.find('#sldPointBudget');

		sldPointBudget.slider({
			value: this.viewer.getPointBudget(),
			min: 100 * 1000,
			max: 10 * 1000 * 1000,
			step: 1000,
			slide: (event, ui) => {
				this.viewer.setPointBudget(ui.value);
			},
		});

		this.dom.find('#sldFOV').slider({
			value: this.viewer.getFOV(),
			min: 20,
			max: 100,
			step: 1,
			slide: (event, ui) => {
				this.viewer.setFOV(ui.value);
			},
		});

		this.dom.find('#sldPointSize').slider({
			value: this.viewer.getPointSize(),
			min: 0.1,
			max: 10.0,
			step: 0.1,
			slide: (event, ui) => {
				this.viewer.setPointSize(ui.value);
			},
		});

		$('#sldEDLRadius').slider({
			value: this.viewer.getEDLRadius(),
			min: 1,
			max: 4,
			step: 0.01,
			slide: (event, ui) => {
				this.viewer.setEDLRadius(ui.value);
			},
		});

		$('#sldEDLStrength').slider({
			value: this.viewer.getEDLStrength(),
			min: 0,
			max: 5,
			step: 0.01,
			slide: (event, ui) => {
				this.viewer.setEDLStrength(ui.value);
			},
		});

		$('#sldEDLOpacity').slider({
			value: this.viewer.getEDLOpacity(),
			min: 0,
			max: 1,
			step: 0.01,
			slide: (event, ui) => {
				this.viewer.setEDLOpacity(ui.value);
			},
		});

		this.viewer.addEventListener('point_budget_changed', event => {
			$('#lblPointBudget')[0].innerHTML = Utils.addCommas(this.viewer.getPointBudget());
			sldPointBudget.slider({ value: this.viewer.getPointBudget() });
		});

		this.viewer.addEventListener('fov_changed', event => {
			$('#lblFOV')[0].innerHTML = parseInt(this.viewer.getFOV());
			$('#sldFOV').slider({ value: this.viewer.getFOV() });
		});

		this.viewer.addEventListener('point_size_changed', event => {
			$('#lblPointSize')[0].innerHTML = this.viewer.getPointSize().toFixed(1);
			$('#sldPointSize').slider({ value: this.viewer.getPointSize() });
		});

		this.viewer.addEventListener('use_edl_changed', event => {
			$('#chkEDLEnabled')[0].checked = this.viewer.getEDLEnabled();
		});

		this.viewer.addEventListener('edl_radius_changed', event => {
			$('#lblEDLRadius')[0].innerHTML = this.viewer.getEDLRadius().toFixed(1);
			$('#sldEDLRadius').slider({ value: this.viewer.getEDLRadius() });
		});

		this.viewer.addEventListener('edl_strength_changed', event => {
			$('#lblEDLStrength')[0].innerHTML = this.viewer.getEDLStrength().toFixed(1);
			$('#sldEDLStrength').slider({ value: this.viewer.getEDLStrength() });
		});

		this.viewer.addEventListener('edl_opacity_changed', event => {
			$('#lblEDLOpacity')[0].innerHTML = this.viewer.getEDLOpacity().toFixed(2);
			$('#sldEDLOpacity').slider({ value: this.viewer.getEDLOpacity() });
		});

		this.viewer.addEventListener('background_changed', event => {
			$("input[name=background][value='" + this.viewer.getBackground() + "']").prop(
				'checked',
				true
			);
		});

		$('#lblPointBudget')[0].innerHTML = Utils.addCommas(this.viewer.getPointBudget());
		$('#lblFOV')[0].innerHTML = parseInt(this.viewer.getFOV());
		$('#lblPointSize')[0].innerHTML = this.viewer.getPointSize().toFixed(1);
		$('#lblEDLRadius')[0].innerHTML = this.viewer.getEDLRadius().toFixed(1);
		$('#lblEDLStrength')[0].innerHTML = this.viewer.getEDLStrength().toFixed(1);
		$('#lblEDLOpacity')[0].innerHTML = this.viewer.getEDLOpacity().toFixed(2);
		$('#chkEDLEnabled')[0].checked = this.viewer.getEDLEnabled();

		{
			let elBackground = $(`#background_options`);
			elBackground.selectgroup();

			elBackground.find('input').click(e => {
				this.viewer.setBackground(e.target.value);
			});

			let currentBackground = this.viewer.getBackground();
			$(`input[name=background_options][value=${currentBackground}]`).trigger('click');
		}

		$('#chkEDLEnabled').click(() => {
			this.viewer.setEDLEnabled($('#chkEDLEnabled').prop('checked'));
		});

		// Settings
		{
			$('#sldMinNodeSize').slider({
				value: this.viewer.getMinNodeSize(),
				min: 0,
				max: 1000,
				step: 0.01,
				slide: (event, ui) => {
					this.viewer.setMinNodeSize(ui.value);
				},
			});

			this.viewer.addEventListener('minnodesize_changed', event => {
				$('#lblMinNodeSize').html(parseInt(this.viewer.getMinNodeSize()));
				$('#sldMinNodeSize').slider({ value: this.viewer.getMinNodeSize() });
			});
			$('#lblMinNodeSize').html(parseInt(this.viewer.getMinNodeSize()));
		}

		{
			let elSplatQuality = $('#splat_quality_options');
			elSplatQuality.selectgroup({ title: 'Splat Quality' });

			elSplatQuality.find('input').click(e => {
				if (e.target.value === 'standard') {
					this.viewer.useHQ = false;
				} else if (e.target.value === 'hq') {
					this.viewer.useHQ = true;
				}
			});

			let currentQuality = this.viewer.useHQ ? 'hq' : 'standard';
			elSplatQuality.find(`input[value=${currentQuality}]`).trigger('click');
		}

		$('#show_bounding_box').click(() => {
			this.viewer.setShowBoundingBox($('#show_bounding_box').prop('checked'));
		});

		$('#set_freeze').click(() => {
			this.viewer.setFreeze($('#set_freeze').prop('checked'));
		});
	}
}
