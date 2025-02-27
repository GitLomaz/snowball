let scores = ['High Score', 'Highest Yeti Level Reached', 'Most Yetis Killed']

var url =
  window.location != window.parent.location
    ? document.referrer
    : document.location.href;
if (url.includes("kongregate")) {
  $.ajax({
    url: "https://cdn1.kongregate.com/javascripts/kongregate_api.js",
    dataType: "script",
    success: function () {
      kongregateAPI.loadAPI(function () {
        window.kongregate = kongregateAPI.getAPI();
        let username = window.kongregate.services._username;
        if (username && username !== "" && username !== "Guest") {
          animal = username;
        }
        if (window.kongregate && typeof Storage !== "undefined" && localStorage) {
          _.each(scores, function(id) {
            let val = localStorage.getItem(id)
            submitScore(id, val)
          })
        }
      });
    },
  });
}

function submitScore(id, value) {
  try {
    if (typeof Storage !== "undefined" && localStorage) {
      let val = localStorage.getItem(id)
      if (!val || val > value || val === null || val === "null") {
        console.log('setting ite')
        localStorage.setItem(id, value)
      }
    }
  } catch (err) {}
  if (window.kongregate) {
    console.log("Submitting score:" + value + " for leaderboard: " + id)
    window.kongregate.stats.submit(id, value);
  } else {
    console.log("no kong API!");
  }
}
