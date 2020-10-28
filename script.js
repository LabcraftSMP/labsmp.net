let channels = [
	"UU5yp071-EwMIvsm807zmHmw", //Opticality
	"UU9DhlhRVyuGAMxIA9rYxIsw", //rebot333
	"UU8eLK3cRQ8xfBS-cpynkh-g", //The Sound Barrier
	"UUOe2LA-NMlPQur2YiTOOJRw", //Oranje Joose
	"UUDuIdq9epBul4AhVq68RF2w", //Alyk
	"UUuQ1xCChyfC4m5ruoimdXPQ", //Story Time With Gay
	"UU9byPIhh5sIF8zhcZXnzIag"  //I T F
];

let channelNames = [
	"Opticality",
	"rebot333",
	"The Sound Barrier",
	"Oranje Joose",
	"Alyk",
	"Story Time With Gay",
	"I T F",
];

let loaded = false;
let videos = [];
let videoIds = [];
let today = new Date();
let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let months = ['January','February','March','April','May','June','July','August','Septemeber','October','November','December'];
let API_KEY = "AIzaSyAU73frIGvXb2MXohjB27SB6m687eXjOh4";

for (let i = 0; i < channels.length; i++) {
	$(function () {
		let PLAYLIST_ID = channels[i];

		let GOOGLE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=id%2C+snippet%2C+contentDetails&playlistId=' + PLAYLIST_ID + '&key=' + API_KEY + '&callback=getPlaylistInfo';

		$.ajax({
			url: GOOGLE_API_URL,
			dataType: 'jsonp',
			crossDomain: true
		});
	});
}

let prepped = 0;
window.getPlaylistInfo = function (data) {
	prepped += 1;
	if (data.items) {
		for (let j = 0; j < data.items.length; j++) {
			videoIds.push(data.items[j].contentDetails.videoId);
		}
	} else {
		console.log("Youtube returned with nothing? Rude. Anyways here's what they sent:");
		console.log(data);
	}
	
}

let totalToLoad = 0;
function loadVidInfo() {
	if (prepped == channels.length) {
		$(function () {
			while (videoIds.length > 0) {
				videosString = '';
				let exists = null;
				for (let j = 0; j < 8; j++) {
					if (videoIds[j]) {
						exists = j + 1;
						if (j > 0) {
							videosString += "%2C";
						}
						videosString += videoIds[j];
					}
				}
				if (exists) {
					videoIds.splice(0, exists);
				}
				totalToLoad++;
				let GOOGLE_API_URL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=' + videosString + '&key=' + API_KEY + '&callback=getVideoInfo';
				$.ajax({
					url: GOOGLE_API_URL,
					dataType: 'jsonp',
					crossDomain: true
				});
			}
		});
	} else {
		setTimeout(loadVidInfo, 250);
	}
}
loadVidInfo();

function parseISODuration(duration) {
    let matches = duration.match(/(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/);
    return {
        sign: matches[1] === undefined ? '+' : '-',
        years: matches[2] === undefined ? 0 : matches[2],
        months: matches[3] === undefined ? 0 : matches[3],
        weeks: matches[4] === undefined ? 0 : matches[4],
        days: matches[5] === undefined ? 0 : matches[5],
        hours: matches[6] === undefined ? 0 : matches[6],
        minutes: matches[7] === undefined ? 0 : matches[7],
        seconds: matches[8] === undefined ? 0 : matches[8]
    };
};

let loadedTotal = 0;
window.getVideoInfo = function (data) {
	console.log(data);
	for (let j = 0; j < data.items.length; j++) {
		let item = data.items[j];
		let str = "<a href='https://youtu.be/"
		str += item.id;
		str +="'><div class='video'><img src='";
		str += item.snippet.thumbnails.medium.url;
		str += "'><div class='desc'><h3>";
		str += item.snippet.title;
		str += "</h3><h4>";
		str += item.snippet.channelTitle;
		str += "</h4><p>";
		if (item.snippet.description.length > 100) {
			let newDesc = item.snippet.description.substring(0, 99) + "...";
			str += newDesc;
		} else {
			str += item.snippet.description;
		}
		str += "</p><p>" + item.statistics.viewCount + " views &#8226; ";
		let date = new Date(new Date(item.snippet.publishedAt.slice(0, -1)).toLocaleString());
		if (today.getMonth() == date.getMonth() && today.getFullYear() == date.getFullYear()) {
			let difference = today.getTime() - date.getTime();
			let amt = null;
			let type = null;
			if (difference < 86400000) {
				if (difference < 3600000) {
					if (difference < 60000) {
						amt = Math.floor(difference / 1000);
						type = "second";
					} else {
						amt = Math.floor(difference / 60000);
						type = "minute";
					}
				} else {
					amt = Math.floor(difference / 3600000);
					type = "hour";
				}
			} else {
				amt = Math.floor(difference / 86400000);
				type = "day";
			}
			str += amt;
			if (amt !== 1) {
				str += " " + type + "s ago";
			} else {
				str += " " + type + " ago";
			}
		} else if (today.getMonth() !== date.getMonth() || today.getFullYear() !== date.getFullYear()) {
			str += days[date.getDay()] + " ";
			str += months[date.getMonth()] + " ";
			str += date.getDate();
			if (today.getFullYear() !== date.getFullYear()) {
				str += ", "
				str += date.getFullYear();
			}
		}
		let duration = parseISODuration(item.contentDetails.duration);
		if (duration.days > 0) {
			if (String(duration.hours).length < 2) {
				duration.hours = "0" + duration.hours;
			}
			if (String(duration.minutes).length < 2) {
				duration.minutes = "0" + duration.minutes;
			}
			if (String(duration.seconds).length < 2) {
				duration.seconds = "0" + duration.seconds;
			}
			duration = duration.days + ":" + duration.hours + ":" + duration.minutes + ":" + duration.seconds;
		} else if (duration.hours > 0) {
			if (String(duration.minutes).length < 2) {
				duration.minutes = "0" + duration.minutes;
			}
			if (String(duration.seconds).length < 2) {
				duration.seconds = "0" + duration.seconds;
			}
			duration = duration.hours + ":" + duration.minutes + ":" + duration.seconds;
		} else {
			if (String(duration.seconds).length < 2) {
				duration.seconds = "0" + duration.seconds;
			}
			duration = duration.minutes + ":" + duration.seconds;
		}
		str += " &#8226; " + duration;
		str += "</p></div></div></a>";
		videos.push({
			html: str,
			date: date
		});
	}
	loadedTotal++;
	if (loadedTotal == totalToLoad) {
		loaded = true;
	}
}

function displayVideos() {
	if (loaded == true) {
		videos = videos.sort((a, b) => b.date - a.date);
		for (i = 0; i < videos.length; i++) {
			document.querySelector(".videos").innerHTML += videos[i].html;
		}
	} else {
		setTimeout(displayVideos, 250);
	}
}
displayVideos();
