// ------- Browser check ------- //

function checkBrowser() {
  var isChromium = window.chrome;
  var winNav = window.navigator;
  var vendorName = winNav.vendor;
  var isOpera = typeof window.opr !== "undefined";
  var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
  var isIOSChrome = winNav.userAgent.match("CriOS");

  if (isIOSChrome) {
    // is Google Chrome on IOS
  } else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    // is Google Chrome
  } else {
    // not Google Chrome
    browserAlert(
      "Šios svetainės peržiūrai rekomenduojame naudoti Chrome naršyklę.<br>Jei naudojate kitą naršyklę, dalis funkcionalumo gali neveikti arba veikti nekorektiškai."
    );
  }
}

function browserAlert(message) {
  var alert = "";
  alert +=
    '<div class="alert alert-dark alert-dismissable" id="browser-alert">';
  alert += '<button class="close" type="button" data-dismiss="alert">';
  alert += "<span>&times;</span>";
  alert += "</button>";
  alert += "<p>" + message + "</p>";
  alert += "</div>";
  $("#browser").html(alert);
  $("#browser").removeClass("hidden");
}

// ------- URL modification without refresh ------- //

// get URL param
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return null;
}

// change URL without refreshing the page
//get querystring value
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//add or modify querystring
function changeUrl(key, value) {
  //Get query string value
  var searchUrl = location.search;
  if (searchUrl.indexOf("?") == "-1") {
    var urlValue = "?" + key + "=" + value;
    history.pushState({ state: 1, rand: Math.random() }, "", urlValue);
  } else {
    //Check for key in query string, if not present
    if (searchUrl.indexOf(key) == "-1") {
      var urlValue = searchUrl + "&" + key + "=" + value;
    } else {
      //If key present in query string
      oldValue = getParameterByName(key);
      if (searchUrl.indexOf("?" + key + "=") != "-1") {
        urlValue = searchUrl.replace(
          "?" + key + "=" + oldValue,
          "?" + key + "=" + value
        );
      } else {
        urlValue = searchUrl.replace(
          "&" + key + "=" + oldValue,
          "&" + key + "=" + value
        );
      }
    }
    history.pushState({ state: 1, rand: Math.random() }, "", urlValue);
  }
}

//remove querystring
function removeQString(key) {
  var urlValue = document.location.href;

  //get query string value
  var searchUrl = location.search;

  if (key != "") {
    oldValue = getParameterByName(key);
    removeVal = key + "=" + oldValue;
    if (searchUrl.indexOf("?" + removeVal + "&") != "-1") {
      urlValue = urlValue.replace("?" + removeVal + "&", "?");
    } else if (searchUrl.indexOf("&" + removeVal + "&") != "-1") {
      urlValue = urlValue.replace("&" + removeVal + "&", "&");
    } else if (searchUrl.indexOf("?" + removeVal) != "-1") {
      urlValue = urlValue.replace("?" + removeVal, "");
    } else if (searchUrl.indexOf("&" + removeVal) != "-1") {
      urlValue = urlValue.replace("&" + removeVal, "");
    }
  } else {
    var searchUrl = location.search;
    urlValue = urlValue.replace(searchUrl, "");
  }
  history.pushState({ state: 1, rand: Math.random() }, "", urlValue);
}

// ------- Loading and generating content ------- //

// load category buttons data
function generatePageContent() {
  $.getJSON("php/generate_category_btn.php")
    .done(function(data) {
      drawBtns(data);
      loadData();
    })
    .fail(function() {
      showAlert("Deja, šiuo metu duomenys nepasiekiami.", "alert-danger");
    });
}

// draw category buttons
function drawBtns(data) {
  var newBtnContent = "";
  for (var i = 0; i < data.length; i++) {
    newBtnContent +=
      '<button type="button" data-show="' +
      data[i].c +
      '" class="btn btn-light btn-sm">';
    newBtnContent += data[i].name;
    newBtnContent += "<span> (" + data[i].number + ")</span>";
    newBtnContent += "</button>";
  }
  $("#categories").html(newBtnContent);
  showActiveButton();
}

// change button to active according to current URL
function showActiveButton() {
  var category = getQueryVariable("tema");
  var show = getQueryVariable("rodyti");
  var search = getQueryVariable("s");
  var dataShow = category != null ? category : show;
  var target = $('button[data-show ="' + dataShow + '"]');
  target.addClass("active");
  if (category == null && show == null && search == null) {
    $('button[data-show ="visi"]').addClass("active");
  }
  $("#additional-nav-opener").addClass("active");
}

// configure params for requesting and loading data
function configureFilter() {
  // change URL after clicking the button with query
  var filter = $(this).attr("data-show");
  var param = "";
  if (filter === "search") {
    param = "?s=" + $("#search-text").val();
  } else if (
    filter !== "visi" &&
    filter !== "naujausi" &&
    filter !== "geriausi" &&
    filter !== "atsitiktinis"
  ) {
    param = "?tema=" + filter;
    $("#search-text").val("");
  } else {
    param = "?rodyti=" + filter;
    $("#search-text").val("");
  }

  if (history.pushState) {
    var newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      param;
    window.history.pushState("", "", newurl);
  }

  // generate data
  loadData();

  // add active class to button
  $("button[data-show], a[data-show]").removeClass("active");
  $(this).addClass("active");

  $("#ip-alert").addClass("hidden");
}

// get data according to query
function loadData() {
  $.getJSON("php/load_data.php" + window.location.search)
    .done(function(data) {
      drawData(data);
      loadActivePoemImg();
      $("#ip-alert").removeClass("hidden");
      $("#about").removeClass("hidden");
      $("#footer").removeClass("hidden");
    })
    .fail(function() {
      showAlert("Deja, šiuo metu duomenys nepasiekiami.", "alert-danger");
    });
}

// show alert in main window
function showAlert(text, alertClass) {
  var alert = "";
  alert += '<div class="alert ' + alertClass + '">';
  alert += '<span id="alert">' + text + "</span>";
  alert += "</div>";
  $("#alert-box").html(alert);
}

// generate content in slider
function drawData(poems) {
  $("#alert-box").html("");
  $("#alert").html("");
  $("#arrows").html("");
  $("#carousel").html("");
  if (poems.length == 0) {
    showAlert(
      "Deja, pagal Jūsų paieškos kriterijus eilėraščių neradome.",
      "alert-warning"
    );
  }
  var category = "";
  if (getQueryVariable("tema") !== null) {
    category = 'eilėraščiai tema "' + poems[0].category + '"';
  } else if (
    getQueryVariable("rodyti") !== null &&
    getQueryVariable("rodyti") !== "atsitiktinis"
  ) {
    category = getQueryVariable("rodyti");
  } else if (getQueryVariable("rodyti") === "atsitiktinis") {
    category = "atsitiktinis";
    removeQString("rodyti");
  } else if (getQueryVariable("s") !== null) {
    category = 'atrinkti pagal žodį "' + getParameterByName("s") + '"';
  } else {
    category = "visi";
  }

  var newContent = "";
  var numberOfPoems = poems.length;
  for (var i = 0; i < poems.length; i++) {
    var poem = poems[i];
    var poemNumber = i + 1;
    newContent += '<div class="carousel-item" id="' + poems[i].poemId + '">';
    newContent += '<div class="container">';
    newContent += '<div class="card">';
    newContent += generateCardHeadAndBody(
      poem,
      numberOfPoems,
      poemNumber,
      category
    );
    newContent += '<div id="card-footer' + poems[i].poemId + '">';
    newContent += generateCardFooter(poem, "slider");
    newContent += "</div>";
    newContent += "</div>";
    newContent += "</div>";
    newContent += "</div>";
  }

  $("#carousel-inner").html(newContent);

  showIdInURL();

  // Show slider arrows, if more than 1 poem
  var arrows = "";
  if (poems.length > 1) {
    arrows +=
      '<a href="#myCarousel" class="carousel-control-prev" data-slide="prev">';
    arrows += '<span class="carousel-control-prev-icon"></span>';
    arrows += "</a>";
    arrows +=
      '<a href="#myCarousel" class="carousel-control-next" data-slide="next">';
    arrows += '<span class="carousel-control-next-icon"></span>';
    arrows += "</a>";

    $("#arrows").html(arrows);
  }
}

// show active poem id in URL and add active class accordingly
function showIdInURL() {
  var id = getQueryVariable("id");

  if ($("#" + id).length) {
    $('.carousel-item[id="' + id + '"').addClass("active");
  } else {
    $(".carousel-item")
      .first()
      .addClass("active");
  }
  var poemId = $(".carousel-item.active").attr("id");
  changeUrl("id", poemId);
}

// lazy load img when refreshing the page
function loadActivePoemImg() {
  var active;
  active = $(".carousel-item.active").find("img[data-src]");
  active.attr("src", active.data("src"));
  active.removeAttr("data-src");
}

// Generate card body
function generateCardHeadAndBody(poem, numberOfPoems, poemNumber, category) {
  var newContent = "";
  newContent += '<div class="card-header">';
  newContent += '<div class="d-flex flex-wrap">';
  if (category === "atsitiktinis") {
    newContent += "<span>Rodomas " + category + " eilėraštis</span>";
  } else {
    newContent += "<span>Rodomi " + category + "</span>";
  }
  newContent +=
    '<span class="ml-auto pl-2">' +
    poemNumber +
    " / " +
    numberOfPoems +
    "</span>";
  newContent += "</div>";
  newContent += "</div>";
  newContent += '<div class="card-body">';
  newContent += '<div class="row">';
  newContent += '<div class="col-md-6 border-right">';
  newContent += '<div class="card-block">';
  newContent += '<h6 class="card-title text-muted">' + poem.date + "</h6>";
  newContent += '<h4 class="card-title">' + poem.name + "</h4>";

  newContent += '<div class="card-text mb-4 pl-3">';
  var formattedPoem = formatPoem(poem.content);
  newContent += formattedPoem;
  newContent += "</div>";
  newContent += "</div>";
  newContent += "</div>";
  newContent += '<div class="col-md-6">';
  newContent += '<div class="card-img-bottom card-image">';
  if (poemNumber == 1) {
    newContent += '<img src="' + poem.image + '" alt="" class="img-fluid">';
  } else {
    newContent +=
      '<img data-src="' + poem.image + '" alt="" class="img-fluid">';
  }
  newContent += "</div>";
  newContent += "</div>";
  newContent += "</div>";
  newContent += "</div>";
  return newContent;
}

function generateCardFooter(poem) {
  var newContent = "";
  newContent += '<div class="card-footer" id="card-footer' + poem.poemId + '">';
  newContent += '<div class="d-flex flex-wrap rating-data">';
  newContent += '<div class="icons rating">';
  if (poem.ratingAvg == null) {
    for (let x = 0; x < 5; x++) {
      newContent += '<i class="fas fa-feather empty" id="' + (5 - x) + '"></i>';
    }
    newContent += "</div>";
    newContent +=
      '<span class="message ml-3" id="message-' +
      poem.poemId +
      '"> Dar niekas nevertino, būkite pirma(-as)</span>';
  } else {
    for (let y = 5; y > 0; y--) {
      if (y > Math.round(poem.ratingAvg)) {
        newContent += '<i class="fas fa-feather empty" id="' + y + '"></i>';
      } else {
        newContent += '<i class="fas fa-feather" id="' + y + '"></i>';
      }
    }
    newContent += "</div>";
    newContent +=
      '<span class="ml-3">' +
      (Math.round(poem.ratingAvg * 10) / 10).toFixed(1) +
      " (" +
      poem.noOfVotes +
      ")" +
      "</span>";
    newContent +=
      '<span class="message ml-3" id="message-' + poem.poemId + '"></span>';
  }
  newContent += "</div>";
  newContent += "</div>";
  return newContent;
}

// split poem to an array of lines and stanzas and format the poem
// (important for displaying the poem without scrollbars on small screens)
function formatPoem(poem) {
  var stanzas = poem.split("\r\n\r\n");
  var lines = [];
  for (let i = 0; i < stanzas.length; i++) {
    lines.push(stanzas[i].match(/[^\r\n]+/g));
  }

  var formattedPoem = "";
  for (let i = 0; i < stanzas.length; i++) {
    if (lines[i] !== null) {
      formattedPoem += '<div class="stanza">';
      var fromattedStanza = "";

      for (let x = 0; x < lines[i].length; x++) {
        fromattedStanza += '<div class="line">' + lines[i][x] + "</div>";
      }
      formattedPoem += fromattedStanza;
      formattedPoem += "</div>";
    }
  }
  return formattedPoem;
}

// ------- Voting ------- //

function updateRatingData(id, rating) {
  $.ajax({
    url: "php/vote.php",
    type: "POST",
    data: {
      id: id,
      rating: rating
    },
    success: function(response) {
      // show updated rating information
      var data = JSON.parse(response);
      $("#card-footer" + data.poemId).html("");
      newContent = "";
      newContent += generateCardFooter(data);
      $("#card-footer" + data.poemId).html(newContent);
      $("#message-" + data.poemId).html("Jūsų vertinimas įrašytas");
    },
    error: function(response) {
      if (response.responseText === "alreadyVoted") {
        $("#message-" + id).html("Šį eilėraštį jau vertinote");
      } else {
        $("#message-" + id).html("Įvyko nenumatyta klaida");
      }
    }
  });
}
