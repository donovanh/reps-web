"use strict";

const fs = require("fs");
const pathModule = require("path");
// const slugify = require("slugify");

function pad(n, width, z) {
	z = z || "0";
	n = n + "";
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const dt = new Date();
const today = `${dt.getFullYear()}-${pad(dt.getMonth() + 1, 2)}-${pad(
	dt.getDate(),
	2
)}`;

function findLatestDevDiaryNumber() {
	const blogPath = "./content/blog/";

	// Read the list of folders in the blogPath
	const folders = fs
		.readdirSync(blogPath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
		.filter((name) => name.includes("dev-diary-"))
		.sort((a, b) => {
			// Sort folders based on the date embedded in the folder name
			const regex = /dev-diary-(\d+)/;
			const matchA = regex.exec(a);
			const matchB = regex.exec(b);

			if (matchA && matchB) {
				return parseInt(matchB[1]) - parseInt(matchA[1]);
			}

			return 0;
		});

	if (folders.length > 0) {
		const latestFolder = folders[0];
		const regex = /dev-diary-(\d+)/;
		const match = regex.exec(latestFolder);

		if (match) {
			const devDiaryNumber = parseInt(match[1]);
			return devDiaryNumber;
		}
	}

	// If no matching folder is found
	return null;
}

const devDiaryNum = findLatestDevDiaryNumber();
const path = `./content/blog/TEST-${today}-dev-diary-${devDiaryNum}/index.md`;

const fileContent = `---
title: "Reps Dev Diary #${devDiaryNum}: TITLE HERE"
permalink: /dev-diary-${devDiaryNum}/
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
