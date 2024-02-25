"use strict";

const fs = require("fs");
const pathModule = require("path");
const slugify = require("slugify");

function pad(n, width, z) {
	z = z || "0";
	n = n + "";
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const title = process.argv[2];
const dt = new Date();
const today = `${dt.getFullYear()}-${pad(dt.getMonth() + 1, 2)}-${pad(
	dt.getDate(),
	2
)}`;

function titleCase(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map(function (word) {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}

const path = `./content/blog/${today}-${slugify(title.toLowerCase())}/index.md`;

const fileContent = `---
title: ${titleCase(title)}
permalink: /${slugify(title.toLowerCase())}/
description: A description that will show as subtitle and also on social sharing
date: ${today}
tags:
  - dev
  - dev-diary
---

Content to go here

## Current TODO list


`;

if (fs.existsSync(path)) {
	console.log("A post with that name already exists");
} else {
	const directory = pathModule.dirname(path);

	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
		console.log(`Created directory: ${directory}`);
	}

	fs.writeFile(path, fileContent, function (err) {
		if (err) return console.log(err);
		console.log(`Writing ${path}`);
	});
}
