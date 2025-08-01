// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import { Config } from "../synth/SynthConfig";
import { ChannelType } from "../synth/synth";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { SongDocument } from "./SongDocument";
import { Prompt } from "./Prompt";
import { ChangeGroup } from "./Change";
import { ChangePatternsPerChannel, ChangeInstrumentsFlags } from "./changes";

const { button, div, label, br, h2, input } = HTML;

export class ChannelSettingsPrompt implements Prompt {
	private readonly _patternsStepper: HTMLInputElement = input({
		style: "width: 3em; margin-left: 1em;",
		type: "number",
		step: "1",
	});
	private readonly _pitchChannelStepper: HTMLInputElement = input({
		style: "width: 3em; margin-left: 1em;",
		type: "number",
		step: "1",
	});
	private readonly _drumChannelStepper: HTMLInputElement = input({
		style: "width: 3em; margin-left: 1em;",
		type: "number",
		step: "1",
	});
	private readonly _modChannelStepper: HTMLInputElement = input({
		style: "width: 3em; margin-left: 1em;",
		type: "number",
		step: "1",
	});
	private readonly _layeredInstrumentsBox: HTMLInputElement = input({
		style: "width: 3em; margin-left: 1em;",
		type: "checkbox",
	});
	private readonly _patternInstrumentsBox: HTMLInputElement = input({
		style: "width: 3em; margin-left: 1em;",
		type: "checkbox",
	});

	private readonly _cancelButton: HTMLButtonElement =
		button({ class: "cancelButton" });
	private readonly _okayButton: HTMLButtonElement = button(
		{ class: "okayButton", style: "width:45%;" },
		"Okay"
	);

	public readonly container: HTMLDivElement = div(
		{
			class: "prompt noSelection",
			style: "width: 250px; text-align: right;",
		},
		h2("Channel Settings"),
		label(
			{
				style:
					"display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;",
			},
			"Pitch channels:",
			this._pitchChannelStepper
		),
		label(
			{
				style:
					"display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;",
			},
			"Drum channels:",
			this._drumChannelStepper
		),
		div(
			{
				style:
					"display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;",
			},
			"Mod channels:",
			this._modChannelStepper
		),
		label(
			{
				style:
					"display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;",
			},
			"Available patterns per channel:",
			this._patternsStepper
		),
		label(
			{
				style:
					"display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;",
			},
			"Simultaneous instruments",
			br(),
			"per channel:",
			this._layeredInstrumentsBox
		),
		label(
			{
				style:
					"display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;",
			},
			"Different instruments",
			br(),
			"per pattern:",
			this._patternInstrumentsBox
		),
		div(
			{
				style:
					"display: flex; flex-direction: row-reverse; justify-content: space-between;",
			},
			this._okayButton
		),
		this._cancelButton
	);

	constructor(private _doc: SongDocument) {
		this._patternsStepper.value = this._doc.song.patternsPerChannel + "";
		this._patternsStepper.min = "1";
		this._patternsStepper.max = Config.barCountMax + "";

		this._pitchChannelStepper.value = this._doc.song.pitchChannelCount + "";
		this._pitchChannelStepper.min = Config.pitchChannelCountMin + "";
		this._pitchChannelStepper.max = Config.pitchChannelCountMax + "";

		this._drumChannelStepper.value = this._doc.song.noiseChannelCount + "";
		this._drumChannelStepper.min = Config.noiseChannelCountMin + "";
		this._drumChannelStepper.max = Config.noiseChannelCountMax + "";

		this._modChannelStepper.value = this._doc.song.modChannelCount + "";
		this._modChannelStepper.min = Config.modChannelCountMin + "";
		this._modChannelStepper.max = Config.modChannelCountMax + "";

		this._layeredInstrumentsBox.checked = this._doc.song.layeredInstruments;
		this._patternInstrumentsBox.checked = this._doc.song.patternInstruments;
		this._pitchChannelStepper.select();
		setTimeout(() => this._pitchChannelStepper.focus());

		this._okayButton.addEventListener("click", this._saveChanges);
		this._cancelButton.addEventListener("click", this._close);
		this._patternsStepper.addEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._pitchChannelStepper.addEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._drumChannelStepper.addEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._modChannelStepper.addEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._patternsStepper.addEventListener("blur", this._validateNumber);
		this._pitchChannelStepper.addEventListener("blur", this._validateNumber);
		this._drumChannelStepper.addEventListener("blur", this._validateNumber);
		this._modChannelStepper.addEventListener("blur", this._validateNumber);
		this.container.addEventListener("keydown", this._whenKeyPressed);
	}

	private _close = (): void => {
		this._doc.undo();
	};

	public cleanUp = (): void => {
		this._okayButton.removeEventListener("click", this._saveChanges);
		this._cancelButton.removeEventListener("click", this._close);
		this._patternsStepper.removeEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._pitchChannelStepper.removeEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._drumChannelStepper.removeEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._modChannelStepper.removeEventListener(
			"keypress",
			ChannelSettingsPrompt._validateKey
		);
		this._patternsStepper.removeEventListener("blur", this._validateNumber);
		this._pitchChannelStepper.removeEventListener("blur", this._validateNumber);
		this._drumChannelStepper.removeEventListener("blur", this._validateNumber);
		this._modChannelStepper.removeEventListener("blur", this._validateNumber);
		this.container.removeEventListener("keydown", this._whenKeyPressed);
	};

	private _whenKeyPressed = (event: KeyboardEvent): void => {
		if ((<Element>event.target).tagName != "BUTTON" && event.keyCode == 13) {
			// Enter key
			this._saveChanges();
		}
	};

	private static _validateKey(event: KeyboardEvent): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
			event.preventDefault();
			return true;
		}
		return false;
	}

	private _validateNumber = (event: Event): void => {
		const input: HTMLInputElement = <HTMLInputElement>event.target;
		input.value = String(ChannelSettingsPrompt._validate(input));
	};

	private static _validate(input: HTMLInputElement): number {
		return Math.floor(
			Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value)))
		);
	}

	private _saveChanges = (): void => {
		const group: ChangeGroup = new ChangeGroup();
		group.append(
			new ChangeInstrumentsFlags(
				this._doc,
				this._layeredInstrumentsBox.checked,
				this._patternInstrumentsBox.checked
			)
		);
		group.append(
			new ChangePatternsPerChannel(
				this._doc,
				ChannelSettingsPrompt._validate(this._patternsStepper)
			)
		);
		this._doc.record(group, false);

		const newPitchCount: number = ChannelSettingsPrompt._validate(
			this._pitchChannelStepper
		);
		const newNoiseCount: number = ChannelSettingsPrompt._validate(
			this._drumChannelStepper
		);
		const newModCount: number = ChannelSettingsPrompt._validate(
			this._modChannelStepper
		);

		const oldPitchCount: number = this._doc.song.pitchChannelCount;
		const oldNoiseCount: number = this._doc.song.noiseChannelCount;
		const oldModCount: number = this._doc.song.modChannelCount;

		const pitchDiff: number = newPitchCount - oldPitchCount;
		const noiseDiff: number = newNoiseCount - oldNoiseCount;
		const modDiff: number = newModCount - oldModCount;

		for (let i = 0; i < pitchDiff; i++)
			this._doc.song.addChannel(ChannelType.Pitch);
		for (let i = 0; i < noiseDiff; i++)
			this._doc.song.addChannel(ChannelType.Noise);
		for (let i = 0; i < modDiff; i++)
			this._doc.song.addChannel(ChannelType.Mod);

		for (let i = 0; i < -pitchDiff; i++)
			this._doc.song.removeChannelType(ChannelType.Pitch);
		for (let i = 0; i < -noiseDiff; i++)
			this._doc.song.removeChannelType(ChannelType.Noise);
		for (let i = 0; i < -modDiff; i++)
			this._doc.song.removeChannelType(ChannelType.Mod);

		this._doc.prompt = null;
		this._doc.notifier.changed();
	};
}