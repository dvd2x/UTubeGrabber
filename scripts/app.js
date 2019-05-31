"use strict";

//truncates a string to a length with html elipses
String.prototype.trunc = function(n) {
  return this.substr(0, n - 1) + (this.length > n ? "&hellip;" : "");
};

// using apiKey for youtube api
const apiKey = "AIzaSyCGKrLxvpot6hrekFHQTPaCGeOFj92T3ao";
const searchURL = "https://www.googleapis.com/youtube/v3/search";

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

//Display results of youtube search
function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $("#results-list").empty();
  $("#results-list").append(
    `<li><img src="${responseJson.thumbnail}" alt="thumbnail for ${
      responseJson.title
    }" class="thumbnail"></li>`
  );
  $("#results-list").append(
    `<li><p>${responseJson.title.trunc(128)}"</p></li>`
  );

  $("#results-list").append(
    `<li class=" audio-dl"><button class="w3-button w3-black w3-round audio-dl"><a href="${
      responseJson.audio
    }" download><i class="fa fa-download"></i> Mp3 Audio Download</a></button></li>`
  );
  $("#results-list").append(
    `<li class="video-dl"><button class="w3-button w3-black w3-round video-dl"><a href="${
      responseJson.video
    }" download><i class="fa fa-download"></i> Mp4 Video Download</a></button></li>`
  );
  //display the results section
  $("#results").removeClass("hidden");
}

//initiate youtube download
function downloadVideo(videoId) {
  console.log(videoId);
  return fetch(
    `https://getvideo.p.rapidapi.com/?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}`,
    {
      headers: {
        "X-RapidAPI-Host": "getvideo.p.rapidapi.com",
        "X-RapidAPI-Key": "d390d7b0e9msh42dc09f4e07e285p1486c4jsne0a4edb9e61e"
      }
    }
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.dir(data);
      if (!data.streams) {
        throw new Error(
          "Error retrieving download URL, try a different video!"
        );
      }
      return {
        audio: data.streams.filter(stream => {
          return stream.format === "audio only";
        })[0].url,
        video: data.streams.filter(stream => {
          return stream.format !== "audio only";
        })[0].url,
        thumbnail: data.thumbnail,
        title: data.description
      };
    });
}

function getYouTubeVideos(query) {
  const params = {
    key: apiKey,
    q: query,
    part: "snippet"
  };
  const queryString = formatQueryParams(params);
  const url = searchURL + "?" + queryString;

  console.log(url);

  $("#js-error-message").text("");

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => downloadVideo(responseJson.items[0].id.videoId))
    .then(download => displayResults(download))
    // .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

//submit button push
function watchForm() {
  $("form").submit(event => {
    event.preventDefault();
    const searchTerm = $("#js-search-term").val();
    //const maxResults = $("#js-max-results").val();
    getYouTubeVideos(searchTerm);
    console.log(searchTerm);
    $("#results-list")
      .append("<li>searching for video</li>")
      .show(); //waiting search
  });
}

$(watchForm);
