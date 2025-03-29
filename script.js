"use strict";

// initialize important DOM elements
const input = document.getElementById("idInput");
const fileArea = document.getElementsByClassName("file-area")[0];
const squigContainer = document.getElementsByClassName("squigContainer")[0];
const point = document.getElementsByClassName("point")[0];

const app =
{
	// DOM link
	docIcon: document.getElementsByTagName("link")[0],

	// change icon of HTML document
	//		img (str):		path to new icon
	iconChange: function(img)
	{
		appIcon.src = `img/${img}.png`;
		this.docIcon.href = `img/${img}.png`;
	},
	name: "Tab that plays media"
};

const media =
{
	state: "empty",  // is media "empty", "play"ing, or "pause"d?
	statePreSeek: undefined,
	type: undefined,  // is it "audio" or "video"?
	container: undefined,  // DOM of <audio> or <video> element
	rescued: false,  // if media was rescued due to closing then re-opening tab

	volume: 100,  // playing volume of media
	titleScrolling: false,  // whether title in window name is currently scrolling
	displayMinutes: false,  // should the time duration display time based on seconds or minutes?

	// button settings (default: FALSE)
	muted: true,  // is the audio muted?
	loop: true,  // if media loops when done
	videoHide: true,  // does video display to the screen?

	// file data
	duration: undefined,  // length of media
	format: undefined,
	formatExt: undefined,
	size: -1,  // file size
	name: undefined,  // name of media
	nameCycle: 0,  // which character title scrolling is on

	// timer functions
	timeout: undefined,
	interval: undefined,  // progressUpdate() every 1s / .1s
	timeoutTemp: undefined,  // offset this.interval
	nameInterval: undefined,  // setInterval() for title scrolling

	audioDOM: document.getElementById("idAudio"),
	videoDOM: document.getElementById("idVideo"),


	// toggle between play and pause
	stateToggle: function()
	{
		switch (this.state)
		{
			case "play": this.pause(); break;
			case "pause": this.play(); break;
		}
	},

	// play current media
	play: function()
	{
		// do not run if no media is loaded
		if (this.state === "empty") { return; }

		// set media as playing
		this.state = "play";
		controlDOM.state.src = "img/pause.svg";
		controlDOM.titleDisc.classList.add("show");

		// play media, add timer function
		this.container.play();
		this.container.loop = this.loop;
		window.clearInterval(this.interval);
		this.timeoutTemp = window.setTimeout(() =>
		{
			this.progressUpdate(this.container.currentTime);

			this.interval = window.setInterval(() => this.progressUpdate(this.container.currentTime),
			(this.displayMinutes) ? 1000 : 100);
		}, (this.container.currentTime - Math.floor(this.container.currentTime) - 1) * ((this.displayMinutes) ? -1000 : -100));
		


		this.titleScrollCheck();
	},
	// pause current media
	pause: function()
	{
		if (this.state === "empty") { return; }

		// pause media, remove timer function
		this.container.pause();
		window.clearInterval(this.interval);
		window.clearInterval(this.timeoutTemp);

		this.state = "pause";
		controlDOM.state.src = "img/play.svg";
		controlDOM.titleDisc.classList.remove("show");

		this.progressUpdate(this.container.currentTime);


		// if title scrolling is currently active
		if (this.titleScrolling)
		{
			// stop title scrolling, return name to default
			this.titleScrolling = false;
			window.clearInterval(this.nameInterval);
			this.setTitle();
		}
	},

	// open new media, prompt user for a file via filePrompt()
	//	fileDrag [file]:			file dropped on drag / drop operation
	//	skipPrompt [bool]:		should filePrompt() prompt for a file?
	open: async function(fileDrag, skipPrompt)
	{
		// if using drag / drop, set file to that result
		if (fileDrag !== undefined) { input.files = fileDrag; }

		// open file prompt and wait for input
		const file = await filePrompt(skipPrompt);


		// get media type (audio or video)
		this.type = input.files[0].type.split("/")[0];
		switch (this.type)
		{
			case "audio":
				app.iconChange("audio");
				this.container = this.audioDOM;

				// hide video and video controls
				this.videoDOM.style.display = "none";
				controlDOM.videoBar.style.display = "";
				break;

			case "video":
				app.iconChange("video");
				this.container = this.videoDOM;

				// show video controls and hide video if set to hidden
				this.videoDOM.style.display = (this.videoHide) ? "none" : "block";
				controlDOM.videoBar.style.display = "block";
				break;
		}


		// add media file into media container
		controlDOM.loadText.innerText = "Adding media element...";
		this.container.src = file;
		this.container.load();

		// copy media attributes
		this.name = input.files[0].name.slice(0, input.files[0].name.lastIndexOf("."));
		this.size = input.files[0].size;
		this.format = input.files[0].type.split("/")[1];
		const splitExt = input.files[0].name.split(".");
		this.formatExt = splitExt[splitExt.length - 1];

		// set status bar info
		controlDOM.infoRes.textContent = "";
		controlDOM.infoFormat.textContent = this.formatExt.toUpperCase() + " (" + input.files[0].type + ")";
		if (this.size < 999)
		{
			controlDOM.infoSize.textContent = this.size + " bytes";
		}
		else if (this.size < 999999)
		{
			controlDOM.infoSize.textContent = Math.round(this.size / 100) / 10 + " KB";
		}
		else
		{
			controlDOM.infoSize.textContent = Math.round(this.size / 100000) / 10 + " MB";
		}
		// format with thousands separator
		controlDOM.infoSize.title = new Intl.NumberFormat("en-US").format(this.size) + " bytes";

		controlDOM.loadDiv.style.display = "none";
		controlDOM.progress.disabled = false;
		controlDOM.container.classList.remove("disabled");
		menu.DOM.dropButton.open = false;


		// AWAIT for file to load
		await new Promise(resolve => this.container.addEventListener("loadeddata", resolve));


		// set media element properties
		this.container.volume = this.volume / 100;

		// set progress bar defaults
		this.duration = this.container.duration;
		this.displayMinutes = (this.duration > 60);
		this.progressUpdate(0);
		controlDOM.durationMax.textContent = this.timeFormatLength(this.duration);
		controlDOM.progress.max = this.duration;

		menu.DOM.dropOptions[1].disabled = false;


		// ready video for playing
		this.state = "pause";
		this.container.addEventListener("ended", () => this.pause());
		if (!this.rescued)
		{
			this.play();
		}
		this.rescued = false;

		// get media ID3 metadata
		ID3.get(file);
	},
	// close media and reset variables to default
	close: function()
	{
		// do not run if no media is loaded
		if (this.state === "empty") { return; }

		// set media as closed
		this.pause();
		media.container.src = "";
		this.state = "empty";
		this.type = undefined;
		app.iconChange("empty");

		// reset UI to default state
		fileArea.style.display = "";
		controlDOM.loadDiv.style.display = "none";
		controlDOM.progress.disabled = true;
		controlDOM.container.classList.add("disabled");
		menu.DOM.id3Empty.style.display = "";

		controlDOM.duration.textContent = "0";
		controlDOM.durationEmpty.textContent = "0:0";
		controlDOM.durationMax.textContent = "0:00";

		menu.DOM.dropOptions[1].disabled = true;
		menu.DOM.dropOptions[2].disabled = false;
		menu.DOM.dropOptions[3].disabled = true;

		ID3.imageDOM.src = "";
		ID3.imageContainer.style.display = "";

		this.videoDOM.style.display = "none";
		controlDOM.videoBar.style.display = "none";


		// clear status bar info
		controlDOM.infoFormat.textContent = "No media open";
		controlDOM.infoSize.textContent = "";
		controlDOM.infoRes.textContent = "";

		menu.DOM.dropButton.open = false;
		//controlDOM.sizeButton.open = false;


		// clear title
		this.setTitle("close");
		this.titleScrolling = false;
	},
	// re-open media if it was recently closed
	rescue: function()
	{
		// if no media is loaded and there was something previously loaded
		if (media.state === "empty" && input.files[0] !== undefined)
		{
			// open media present in <input>
			this.rescued = true;
			this.open(undefined, true);
		}
	},
	setTitle: function(state, scroll)
	{
		if (this.state === "empty" && state !== "close") { return; }

		let title;
		if (state !== "close")
		{
			if (!settings.ignoreTitle && ID3.valid)
			{
				// set title to id3 stuff
				if (ID3.attrib.title !== undefined)
				{
					title = ID3.attrib.artist + " - " + ID3.attrib.title;
				}
				else { title = this.name; }
			}
			else
			{ title = this.name; }
		}

		// console.log(title, state, scroll)
		switch (state)
		{
			case "load":
				if (media.state === "empty") { return; }

				document.title = title;
				controlDOM.title.innerText = title;
				controlDOM.title.title = title;
				controlDOM.titleDisc.style.marginRight = (40 + controlDOM.title.clientWidth) + "px";
				break;

			case "scroll":
				document.title = title.slice(scroll) + " | " + title.slice(0, this.scroll);
				break;

			case "close":
				document.title = app.name;
				controlDOM.title.textContent = app.name;
				controlDOM.title.title = "";
				break;

			default:
				document.title = title;
		}
	},


	// progress bar seeking
	seeking: function(time)
	{
		// console.log("seeking");
		this.timeFormat(time)

		if (this.type === "video")
		{
			this.container.currentTime = time;
		}

		// pause media while seeking
		if (this.state === "play")
		{
			this.pause();
		}
	},
	seeked: function(time)
	{
		// console.log("seeked");
		this.container.currentTime = time;
		this.progressUpdate(time);

		// resume play if media was previously playing
		if (this.statePreSeek === "play")
		{
			this.play();
		}
	},

	// update media time and progress bar UI
	//	time [int]:				how far in the video is the user?
	progressUpdate: function(time)
	{
		if (this.state !== "empty")
		{
			this.timeFormat(time);
			// console.log(time);
			controlDOM.progress.value = time;
		}
		controlDOM.progress.style = "--value: " + Math.round(time / this.duration * 100) + "%";
		// if (this.displayMinutes)
		// {
		// }
		// else
		// {
		// 	// controlDOM.progress.style = "--value: " + Math.round(time / this.duration * 1000) / 10 + "%";
		// }
	},

	// seek media forwards / backwards, then run this.progressUpdate()
	//	change [int]:			how much to seek media
	progressChange: function(change)
	{
		if (this.state !== "empty")
		{
			// clamp value back if progress is out of bounds
			let time = media.container.currentTime + change;
			if (time < 0) { time = 0; }
			if (time > this.duration) { time = this.duration; }

			media.container.currentTime = time;
			media.progressUpdate(time);

			if (this.state === "play")
			{
				this.pause();
				window.clearTimeout(this.timeout);
				this.timeout = window.setTimeout(() => this.play(), 200);

				// do not loop media if progress is navigated this way
				this.container.loop = false;
			}
		}
	},

	// format video progress into minutes and seconds
	//	num [int]:				current video progress
	timeFormat: function(num)
	{
		// display minutes if media is a minute or longer (format: 9:59)
		if (this.displayMinutes)
		{
			let minutes = Math.floor(num / 60);
			let minutesMax = Math.floor(this.duration / 60);
			let seconds = Math.round(num % 60);
			let str = "";
			let empty = "";
			if (seconds === 60)
			{
				minutes++;
				seconds = 0;
			}

			if (minutes === 0)
			{
				empty = "0".repeat(minutesMax.toString().length);
				empty += ":";
				str = seconds;

				if (10 > seconds)
				{
					empty += "0";
				}
			}
			else
			{
				empty = "0".repeat(minutesMax.toString().length - minutes.toString().length);
				str = minutes + ":";

				if (10 > seconds)
				{
					str += "0";
				}
				str += seconds;
			}

			controlDOM.duration.textContent = str;
			controlDOM.durationEmpty.textContent = empty;
		}
		// else, display seconds (format: 59.9)
		else
		{
			let str = Math.round(num * 10) / 10;
			const strMax = Math.round(this.duration * 10) / 10;

			// if no decimal is present, add ".0" to the end
			if (Math.floor(str) === str) { str += ".0"; }
			controlDOM.duration.textContent = str;

			// add empty zero if media length is over 10 seconds and current time is below 10 seconds
			controlDOM.durationEmpty.textContent = (10 > str && 10 < strMax) ? "0" : "";
		}
	},
	// returns length of video formatted minutes and seconds
	//	num [int]:				total video length
	timeFormatLength: function(num)
	{
		// display minutes if media is a minute or longer (format: 9:59)
		if (this.displayMinutes)
		{
			let sec = Math.round(num % 60);
			if (10 > sec) { sec = "0" + sec; }

			return Math.floor(num / 60) + ":" + sec;
		}
		// else, display seconds (format: 59.9)
		else
		{
			return Math.round(num * 10) / 10;
		}
	},

	// update volume and update volume UI
	//	vol [int]:				value to set volume to
	//	fromClick [bool]:		is this function accessed via clicking volume button?
	setVolume: function(vol, fromClick)
	{
		// if volume is actually changing
		if (this.volume !== vol)
		{
			// set media volume and update volume text
			this.volume = vol;
			controlDOM.volume.value = vol;
			controlDOM.volumeText.innerText = vol;
			controlDOM.volumeTextEmpty.innerText = "0".repeat(3 - vol.toString().length);
			controlDOM.volume.style = `--value: ${vol}%`;

			// if media is loaded
			if (this.state !== "empty")
			{
				this.container.volume = vol / 100;
			}
			if (this.muted && !fromClick)
			{
				controlDOM.volumeStatus.temp = 0;
				controlDOM.volumeStatus.click();
			}

			// update local storage
			localStorage.setItem("ttpm/volume", vol);
		}
	},
	// add value to volume, then run this.setVolume()
	//	change [int]:			how much to change current volume
	changeVolume: function(change)
	{
		let vol = Number(this.volume) + change;
		if (vol > 100) { vol = 100; }
		if (vol < 0) { vol = 0; }

		this.setVolume(vol);
	},

	titleScrollCheck: function()
	{
		window.clearInterval(this.nameInterval);

		if (this.state !== "play") { return; }

		// run title scrolling if media name is 20 characters or greater
		if (settings.titleScroll && this.name.length >= 20)
		{
			this.titleScrolling = true;
			this.nameCycle = 0;

			// every 1.25 seconds...
			this.nameInterval = window.setInterval(() =>
			{
				const name = this.name;
				this.nameCycle++;

				// skip spaces
				if (name[this.nameCycle] === " ")
				{
					this.nameCycle++;
				}
				if (this.nameCycle >= name.length)
				{
					this.nameCycle = 0;
				}

				// crop title based on character counter
				this.setTitle("scroll", this.nameCycle);
			}, 1250);
		}
	}
};

//	prompt user for file, then read it using fileReader
//	skipPrompt [bool]:		should open new file prompt be skipped?
async function filePrompt(skipPrompt)
{
	// file prompt
	media.pause();
	if (!skipPrompt)
	{
		console.log("file click");
		input.click();
	}
	else { console.log("file drag"); }

	return new Promise(resolve =>
	{
		input.onchange = () =>
		{
			// fileDrag === undefined &&
			if (input.files[0] === undefined) { return; }
			console.log("change");
			const reader = new FileReader();

			reader.addEventListener("load", event => resolve(event.target.result));
			reader.addEventListener("progress", event => controlDOM.load.value = event.loaded / event.total);

			// store file data
			const type = input.files[0].type.split("/")[0];
			if (type !== "audio" && type !== "video")
			{
				alert('Invalid file type. "' + input.files[0].type + '" was prompted but only "audio" or "video" is supported');
				return;
			}

			// media.close();
			fileArea.style.display = "none";
			controlDOM.loadDiv.style.display = "block";
			controlDOM.loadText.innerText = "Loading media from file...";

			// read file
			reader.readAsDataURL(input.files[0]);
		};

		// if skipPrompt is set, run immediately
		if (skipPrompt) { input.onchange(); }
	});
}


// keyboard handler
document.body.addEventListener("keydown", event =>
{
	if (event.ctrlKey)
	{
		switch(event.code)
		{
			// open media
			case "KeyO":
				event.preventDefault();
				media.open();
				break;
		}
		return;
	}

	// do not parse other shortcuts if <input> is currently being used
	if (document.activeElement.tagName === "INPUT") { return; }

	if (event.shiftKey)
	{
		switch(event.code)
		{
			// volume change (small)
			case "ArrowUp": case "KeyW":
				media.changeVolume(1);
				break;
			case "ArrowDown": case "KeyS":
				media.changeVolume(-1);
				break;
		}
	}
	else
	{
		switch(event.code)
		{
			// volume change
			case "ArrowUp": case "KeyW":
				media.changeVolume(5);
				break;
			case "ArrowDown": case "KeyS":
				media.changeVolume(-5);
				break;
		}
	}


	// !!! all shortcuts below only work when media is loaded !!!
	// do not parse other shortcuts if no media is loaded
	if (media.state === "empty") { return; }

	if (event.shiftKey)
	{
		switch(event.code)
		{
			// media seeking (small)
			case "ArrowLeft": case "KeyA": case "KeyJ":
				media.progressChange(-1);
				break;
			case "ArrowRight": case "KeyD": case "KeyL":
				media.progressChange(1);
				break;
		}
	}
	else
	{
		switch(event.code)
		{
			// media seeking
			case "ArrowLeft": case "KeyA": case "KeyJ":
				media.progressChange(-5);
				break;
			case "ArrowRight": case "KeyD": case "KeyL":
				media.progressChange(5);
				break;

			// play / pause
			case "Space": case "KeyK":
				event.preventDefault();
				media.stateToggle();
				break;

			// mute media
			case "KeyM":
				controlDOM.volumeStatus.click();
				break;
		}
	}
});

const settings =
{
	titleScroll: true,
	ignoreTitle: false,

	// check / uncheck specified setting
	//	type [str]:				which of the above settings to change
	//	checkbox [DOM]:		DOM of checkbox contained in settings button
	click: function(type, checkbox)
	{
		checkbox.click();
		this[type] = checkbox.checked;

		localStorage.setItem("ttpm/set-" + type, checkbox.checked);
	}
};



// lemocha - lemocha7.github.io