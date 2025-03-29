"use strict";

// initialize DOM elements
const controlDOM =
{
	container: document.getElementById("idControlContainer"),

	state: document.getElementById("idMediaState"),
	progress: document.getElementById("idMediaProgress"),
	duration: document.getElementById("idMediaLength"),
	durationEmpty: document.getElementById("idMediaLengthEmpty"),
	durationMax: document.getElementById("idMediaLengthMax"),
	title: document.getElementById("idTitle"),
	titleDisc: document.getElementById("idMediaDisc"),

	// volume
	volume: document.getElementById("idVolume"),
	volumeContainer: document.getElementById("idVolumeContainer"),
	volumeStatus: document.getElementById("idVolumeStatus"),
	volumeText: document.getElementById("idVolumeT"),
	volumeTextEmpty: document.getElementById("idVolumeTEmpty"),

	videoBar: document.getElementById("idVideoControls"),
	videoHide: document.getElementById("idButtonVideo"),

	mediaLoop: document.getElementById("idButtonLoop"),

	infoFormat: document.getElementById("idInfoFormat"),
	infoSize: document.getElementById("idInfoSize"),
	infoRes: document.getElementById("idInfoRes"),

	load: document.getElementById("idLoad"),
	loadText: document.getElementById("idLoadText"),
	loadDiv: document.getElementById("idLoadDiv")
};

controlDOM.volume.addEventListener("mousedown", function() { this.active = true });
controlDOM.volume.addEventListener("mouseup",   function() { this.active = false });
controlDOM.volume.addEventListener("mousemove", function()
{
	if (this.active)
	{
		media.setVolume(this.value);
	}
});
controlDOM.volume.addEventListener("click", () => media.setVolume(controlDOM.volume.value));
// controlDOM.container.addEventListener("wheel", () => media.changeVolume(Math.round(event.deltaY / -2)), { passive: true });
// document.body.addEventListener("wheel", event => media.changeVolume((-5 * Math.round(Math.abs(event.deltaY) / 400) - 5) * Math.sign(event.deltaY)), { passive: true });
controlDOM.container.addEventListener("wheel", event => media.changeVolume(-5 * Math.sign(event.deltaY)), { passive: true });


// === SEEKING FUNCTIONS ===
controlDOM.progress.addEventListener("mousedown", function()
{
	this.active = true;
	media.statePreSeek = media.state;
	media.seeking(this.value);
});
controlDOM.progress.addEventListener("mouseup", function()
{
	this.active = false;
	media.seeked(this.value);
});
controlDOM.progress.addEventListener("mousemove", function()
{
	if (this.active)
	{
		media.seeking(this.value);
	}
});

// MEDIA MUTE BUTTON
controlDOM.volumeStatus.addEventListener("click", function()
{
	if (!media.muted)
	{
		media.muted = true;
		media.setVolume(0, true);
		this.temp = media.volume;

		this.title = "Media muted. Click to un-mute.";
		this.src = "img/volume-mute.svg";
	}
	else
	{
		media.muted = false;

		this.title = "Click to mute volume.";
		this.src = "img/volume.svg";

		if (this.temp !== undefined)
		{
			media.setVolume(this.temp, true);
		}
	}
});
// MEDIA LOOP BUTTON
controlDOM.mediaLoop.addEventListener("click", function()
{
	if (!media.loop)
	{
		media.loop = true;
		localStorage.setItem("ttpm/loop", true);

		this.title = "Media will loop when done. Click to disable.";
		this.classList = "on";

		if (media.state !== "empty")
		{
			media.container.loop = true;
		}
	}
	else
	{
		media.loop = false;
		localStorage.setItem("ttpm/loop", false);
		
		this.title = "Media will NOT loop when done. Click to enable.";
		this.classList = "off";

		if (media.state !== "empty")
		{
			media.container.loop = false;
		}
	}
});
// VIDEO HIDE BUTTON
controlDOM.videoHide.addEventListener("click", function()
{
	if (!media.videoHide)
	{
		media.videoHide = true;
		localStorage.setItem("ttpm/video-hide", true);

		this.title = "Video is hidden. Click to show.";
		this.classList = "on";
		media.videoDOM.style.display = "none";
	}
	else
	{
		media.videoHide = false;
		localStorage.setItem("ttpm/video-hide", false);

		this.title = "Video is shown. Click to hide.";
		this.classList = "off";

		if (media.state !== "empty")
		{
			media.videoDOM.style.display = "block";
		}
	}
});


// === DRAG AND DROP ===
fileArea.addEventListener("dragover", event =>
{
	event.stopPropagation();
  event.preventDefault();

  event.dataTransfer.dropEffect = "copy";
});

fileArea.addEventListener("drop", event =>
{
  event.stopPropagation();
  event.preventDefault();

  media.open(event.dataTransfer.files, true);
});


controlDOM.volumeStatus.addEventListener("mouseover", () => controlDOM.volumeContainer.style.display = "block");
//controlDOM.volumeText.addEventListener("mouseover", () => controlDOM.volumeContainer.style.display = "block");
   controlDOM.container.addEventListener("mouseout",  () => controlDOM.volumeContainer.style.display = "");



// lemocha - lemocha7.github.io