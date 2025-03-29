"use strict";
// using jsmediatags lib (https://github.com/aadsm/jsmediatags)

const ID3 =
{
	type: undefined,
	ver: undefined,
	imageDOM: document.getElementById("idID3Img"),
	imageContainer: document.getElementById("idID3ImgContainer"),

	// ID3 metadata
	attrib:
	{
		title: undefined,  // TIT2
		artist: undefined,  // TCOM
		album: undefined,  // TALB
		track: undefined,  // TPOS
		disc: undefined,  // TPOS
		genre: undefined,  // TCON
		year: undefined,  // TDRC
		encoding: undefined  // TSSE
	},

	get: function(file)
	{
		// reset previous ID3 values
		this.valid = false;
		for (let x in this.attrib)
		{
			if (x !== "valid" && typeof this.attrib[x] !== "function")
			{
				this.attrib[x] = undefined;
			}
		}
		// remove all elements in ID3 menu
		while (menu.DOM.id3Table.hasChildNodes())
		{
			menu.DOM.id3Table.removeChild(menu.DOM.id3Table.firstChild);
		}


		if (media.type === "audio")
		{
			this.imageContainer.style.display = "block";
		}

		jsmediatags.read(input.files[0],
		{
			onError: error =>
			{
				this.imageDOM.src = "img/audio.png";
				ID3.imageDOM.style.imageRendering = "pixelated";
		   	console.log(error);

				// load title
				media.setTitle("load");

				menu.ID3Make("File Name", `${media.name}.${media.formatExt}`);
			},
			onSuccess: data =>
			{
				this.valid = true;
				this.type = data.type;
				this.version = data.version;
				menu.DOM.id3Empty.style.display = "none";
				menu.DOM.dropOptions[3].disabled = false;

				if (data.tags.picture === undefined)
				{
					this.imageDOM.src = "img/audio.png";
					ID3.imageDOM.style.imageRendering = "pixelated";
				}

				console.log(data);
				for (let x in data.tags)
				{
					switch(x)
					{
						case "title": this.attrib.title = data.tags[x]; break;
						case "artist":this.attrib.artist= data.tags[x]; break;
						case "track": this.attrib.track = data.tags[x]; break;
						case "album": this.attrib.album = data.tags[x]; break;
						case "genre": this.attrib.genre = data.tags[x]; break;


						case "TPOS": case "TRACKTOTAL":  // "part of a set???"
							this.attrib.disc = data.tags[x].data;
							break;


						case "DISCTOTAL":  // album track max
							this.attrib.track = data.tags[x].data;
							break;
						case "TCOM":  // song artist/composer
							this.attrib.artist = data.tags[x].data;
							break;
						case "TDRC": case "TDRL": case "TDOR": case "TYER":  // recording time [ALONG WITH TDRL]
							this.attrib.year = data.tags[x].data;
							break;
						case "TSSE":  // settings used for encoding
							this.attrib.encoding = data.tags[x].data;
							break;
						// case "WXXX":  // user url
							// menu.ID3Make("url", "URL", currentValue);
							// break;


						case "picture":
							// https://github.com/aadsm/jsmediatags?tab=readme-ov-file#picture-data
							let src = "";
							const l = data.tags[x].data.length;
							for (let i = 0; i < l; i++)
							{
								src += String.fromCharCode(data.tags[x].data[i]);
							}
							this.imageDOM.src = `data:${data.tags[x].format};base64,${window.btoa(src)}`;
							controlDOM.infoRes.title = "Format: " + data.tags[x].format;
							ID3.imageDOM.style.imageRendering = "";
							this.imageDOM.onload = () =>
							{
								controlDOM.infoRes.textContent = this.imageDOM.naturalWidth + "x" + this.imageDOM.naturalHeight;
								this.imageDOM.title = "Size: " +  controlDOM.infoRes.textContent + "\nFormat: "  + data.tags[x].format;
							}
							break;
					}
				}

				for (let x in this.attrib)
				{
					if (this.attrib[x] !== undefined)
					{
						menu.ID3Make(x, this.attrib[x]);
					}
				}

				// load title
				media.setTitle("load");

				menu.ID3Make("File Name", `${media.name}.${media.formatExt}`);
			}
		});
	}
};



// lemocha - lemocha7.github.io