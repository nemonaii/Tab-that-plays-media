"use strict";

const menu =
{
	current: undefined,
	currentEle: undefined,
	opener: undefined,
	width: 476,

	DOM:
	{
		id3: document.getElementById("idMenuID3"),
		id3Table: document.getElementById("idID3Table"),
		id3Empty: document.getElementById("idID3Empty"),
		controls: document.getElementById("idMenuControls"),
		settings: document.getElementById("idMenuSettings"),
		about: document.getElementById("idMenuAbout"),

		dropButton: document.getElementById("idDropButton"),
		dropMenu: document.getElementById("idDropMenu"),
		dropOptions: document.getElementById("idDropMenu").getElementsByTagName("button")
	},
	ID3Make: function(title, value)
	{
		const tr = document.createElement("tr");
		let td = document.createElement("td");
		td.classList.add("id3-attrib");
		// const div = document.createElement("div");
		// const div = document.createElement("div");
		td.appendChild(document.createTextNode(title));
		tr.appendChild(td);

		// use table syntax instead!!!
		if (value !== undefined)
		{
			let td = document.createElement("td");

			const inputt = document.createElement("input");
			inputt.value = value;
			inputt.readOnly = true;
			td.appendChild(inputt);
			tr.appendChild(td);
		}

		this.DOM.id3Table.appendChild(tr);
	},

	open: function(type, ele, opener)
	{
		// if no menu is open
		if (this.current === undefined)
		{
			// open prompted menu
			this.pass(type, ele, opener);
		}
		// else, if menu is open
		else
		{
			// if prompted menu is different from open
			this.currentEle.style.display = "none";
			if (this.current !== type)
			{
				// open prompted menu
				this.pass(type, ele, opener);
			}
			// else, if prompted menu is same as open
			else
			{
				// close menu, do not open another
				this.current = undefined;
				squigContainer.style.display = "none";
				point.style.display = "none";
			}
		}
	},
	close: function()
	{
		if (this.currentEle !== undefined)
		{
			this.currentEle.style.display = "none";
		}
		this.current = undefined;
		squigContainer.style.display = "none";
		point.style.display = "none";
	},
	pass: function(type, ele, opener)
	{
		// open prompted menu
		if (type !== undefined)
		{
			// console.log(this.current !== undefined);
			this.current = type;
			this.currentEle = ele;
			ele.style.display = "block";
			this.opener = opener;

			menu.DOM.dropButton.open = false;
		}

		if (this.current !== undefined)
		{
			squigContainer.style.display = "block";
			point.style.display = "block";

			const rect = this.opener.getBoundingClientRect();
			// console.log(rect.x, window.innerWidth);

			point.style.left = (rect.x + rect.width / 2) + "px";

			// if window overflows on right
			if (rect.x + 200 > window.innerWidth)
			{
				// snap to right edge
				menuContainer.style.left = "";
				menuContainer.style.right = "2px";
			}
			// if window overflows on left
			else if (rect.x - 4 < 0)
			{
				// snap to left edge
				menuContainer.style.left = "0";
				menuContainer.style.right = "";
				point.style.left = (rect.x + 12 + rect.width / 2) + "px";
			}
			// else, if not overflowing on edges
			else
			{
				menuContainer.style.left = (rect.x - 2 - rect.width) + "px";
				menuContainer.style.right = "";
			}
			this.runSquig();
		}
	},

	runSquig: function()
	{
		const squig = squigContainer.getElementsByTagName("img");
		const rect = menuContainer.getBoundingClientRect();

		squigContainer.style.left = (rect.left - 15) + "px";
		squigContainer.style.top = (rect.top - 15) + "px";
		for (let i = 1; i <= 3; i++)
		{
			if (i !== 2)
			{
				squig[i].style.left = (rect.right - rect.left) + "px";
			}
			if (i !== 1)
			{
				squig[i].style.top = (rect.bottom - rect.top) + "px";
			}
		}
	}
};



// lemocha - lemocha7.github.io