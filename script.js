let channels = [
	"UU5yp071-EwMIvsm807zmHmw", //Opticality
	"UU9DhlhRVyuGAMxIA9rYxIsw", //rebot333
	"UU8eLK3cRQ8xfBS-cpynkh-g", //The Sound Barrier
	"UUOe2LA-NMlPQur2YiTOOJRw", //Oranje Joose
	"UUDuIdq9epBul4AhVq68RF2w", //Alyk
	"UUuQ1xCChyfC4m5ruoimdXPQ", //Story Time With Gay
	"UU9byPIhh5sIF8zhcZXnzIag"  //I T F
];

let loaded = 0;
let videos = [];

for (let i = 0; i < channels.length; i++) {
	$(function () {
		let API_KEY = "AIzaSyAU73frIGvXb2MXohjB27SB6m687eXjOh4";
		let PLAYLIST_ID = channels[i];

		let GOOGLE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=id%2C+snippet%2C+contentDetails&playlistId=' + PLAYLIST_ID + '&key=' + API_KEY + '&callback=showVideos';

		$.ajax({
			url: GOOGLE_API_URL,
			dataType: 'jsonp',
			crossDomain: true
		});

		window.showVideos = function (data) {
			loaded += 1;
			for (let j = 0; j < data.items.length; j++) {
                console.log(data);
				let item = data.items[j].snippet;
                let str = "<a href='https://youtu.be/"
                str += data.items[j].contentDetails.videoId;
                str +="'><div class='video'><img src='";
				str += item.thumbnails.medium.url;
				str += "'><div class='desc'><h3>";
				str += item.title;
				str += "</h3><h4>";
				str += item.channelTitle;
				str += "</h4><p>";
				if (item.description.length > 100) {
					let newDesc = item.description.substring(0, 99) + "...";
					str += newDesc;
				} else {
					str += item.description;
				}
				str += "</p></div></div></a>";
				videos.push({
					html: str,
					date: new Date(item.publishedAt.slice(0, -1))
				});
			}
		}
	});
}

function displayVideos() {
	if (loaded == channels.length) {
		videos = videos.sort((a, b) => b.date - a.date);
		for (i = 0; i < videos.length; i++) {
			document.querySelector(".videos").innerHTML += videos[i].html;
		}
	} else {
		setTimeout(displayVideos, 250);
	}
}
displayVideos();