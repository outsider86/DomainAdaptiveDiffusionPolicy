window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
      $('#interpolation-value').text(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-value').text(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    // --- Unsup interpolation: folder selector + slider binding ---
    var repManifest = {
      "walker": {
        "images": [
          "walker_embedding_embeddings_data_t=1_ud.png",
          "walker_embedding_embeddings_data_t=4_ud.png",
          "walker_embedding_embeddings_data_t=16_ud.png",
          "walker_embedding_embeddings_data_t=32_ud.png",
          "walker_embedding_embeddings_data_t=inf_ud.png"
        ],
        "labels": [
          "Historically Offset $\\Delta t$ =1 in Walker2d",
          "Historically Offset $\\Delta t$ =4 in Walker2d",
          "Historically Offset $\\Delta t$ =16 in Walker2d",
          "Historically Offset $\\Delta t$ =32 in Walker2d",
          "Historically Offset $\\Delta t$ =∞ in Walker2d"
        ]
      },
      "hc": {
        "images": [
        "hc_embedding_embeddings_data_t=1_ud.png",
        "hc_embedding_embeddings_data_t=4_ud.png",
        "hc_embedding_embeddings_data_t=16_ud.png",
        "hc_embedding_embeddings_data_t=32_ud.png",
        "hc_embedding_embeddings_data_t=inf_ud.png"
        ],
        "labels": [
          "Historically Offset $\\Delta t$ =1 in HalfCheetah",
          "Historically Offset $\\Delta t$ =4 in HalfCheetah",
          "Historically Offset $\\Delta t$ =16 in HalfCheetah",
          "Historically Offset $\\Delta t$ =32 in HalfCheetah",
          "Historically Offset $\\Delta t$ =∞ in HalfCheetah"
        ]
      }
    };
    var unsupImageCache = {}; // folder -> [Image]

    function populateFolderSelect(keys) {
      // optional: page may not have a folder select (we use slider data-folder)
      var $sel = $('#unsup-interpolation-folder');
      if ($sel.length === 0) return;
      $sel.empty();
      keys.forEach(function(k) {
        $sel.append($('<option>').attr('value', k).text(k));
      });
    }

    function setUnsupImage(folder, idx) {
      var imgs = unsupImageCache[folder] || [];
      var img = imgs[idx];
      if (!img) return;
      img.ondragstart = function() { return false; };
      img.oncontextmenu = function() { return false; };
      $('#unsup-interpolation-image-wrapper').empty().append(img);
    }

    function loadFolderImages(folder) {
      var $slider = $('#unsup-interpolation-slider');
      loadFolderImagesForSlider($slider, folder);
    }
    
    function loadFolderImagesForSlider($slider, folder) {
      if (!repManifest || !repManifest[folder]) return;
      var folderData = repManifest[folder];
      var list = Array.isArray(folderData) ? folderData : folderData.images;
      var labels = Array.isArray(folderData) ? null : folderData.labels;
      
      unsupImageCache[folder] = [];
      list.forEach(function(fname, i) {
        var path = './static/representation/' + folder + '/subplots/' + fname;
        var im = new Image();
        im.src = path;
        unsupImageCache[folder].push(im);
      });
      
      // store labels for this folder
      if (labels && labels.length === list.length) {
        $slider.data('labels', labels);
      } else {
        $slider.removeData('labels');
      }
      
      // configure slider
      var max = Math.max(0, unsupImageCache[folder].length - 1);
      $slider.prop('max', max);
      $slider.val(0);
      
      // get corresponding value display element
      var sliderId = $slider.attr('id');
      var valueId = sliderId.replace('-slider', '-value');
      var $valueDiv = $('#' + valueId);
      
      // show initial label or index
      var initialLabel = labels && labels[0] ? labels[0] : '0';
      $valueDiv.empty();
      
      // Render LaTeX if present in initial label
      if (typeof katex !== 'undefined' && initialLabel.indexOf('$') >= 0) {
        try {
          var rendered = initialLabel.replace(/\$([^$]+)\$/g, function(match, math) {
            return katex.renderToString(math, { throwOnError: false });
          });
          $valueDiv.html(rendered);
        } catch (e) {
          $valueDiv.text(initialLabel);
        }
      } else {
        $valueDiv.text(initialLabel);
      }
      
      // show first image when available - find corresponding wrapper
      var wrapperId = sliderId.replace('-slider', '-image-wrapper');
      setTimeout(function() { 
        var imgs = unsupImageCache[folder] || [];
        var img = imgs[0];
        if (!img) return;
        img.ondragstart = function() { return false; };
        img.oncontextmenu = function() { return false; };
        $('#' + wrapperId).empty().append(img);
      }, 50);
    }

    // load manifest and init UI (now using inline manifest)
    var keys = Object.keys(repManifest);
    if (keys.length > 0) {
      populateFolderSelect(keys);
      
      // Initialize all sliders with data-folder attribute
      $('[data-folder]').each(function() {
        var folder = $(this).attr('data-folder');
        if (folder && repManifest[folder]) {
          loadFolderImagesForSlider($(this), folder);
        }
      });
      
      // Bind input event to all sliders with data-folder (after initialization)
      $('[data-folder]').on('input', function() {
        var $slider = $(this);
        var idx = parseInt($slider.val(), 10) || 0;
        var folder = $slider.attr('data-folder');
        
        // get label from mapping or fallback to index
        var labels = $slider.data('labels');
        var displayValue = (labels && labels[idx]) ? labels[idx] : idx.toString();
        
        // get corresponding value display element
        var sliderId = $slider.attr('id');
        var valueId = sliderId.replace('-slider', '-value');
        var $valueDiv = $('#' + valueId);
        $valueDiv.empty();
        
        // Check if KaTeX is available and label contains $ delimiters
        if (typeof katex !== 'undefined' && displayValue.indexOf('$') >= 0) {
          try {
            // Replace inline math $...$ with KaTeX rendering
            var rendered = displayValue.replace(/\$([^$]+)\$/g, function(match, math) {
              return katex.renderToString(math, { throwOnError: false });
            });
            $valueDiv.html(rendered);
          } catch (e) {
            $valueDiv.text(displayValue);
          }
        } else {
          $valueDiv.text(displayValue);
        }
        
        // show corresponding image
        var imgs = unsupImageCache[folder] || [];
        var img = imgs[idx];
        if (!img) return;
        img.ondragstart = function() { return false; };
        img.oncontextmenu = function() { return false; };
        var wrapperId = sliderId.replace('-slider', '-image-wrapper');
        $('#' + wrapperId).empty().append(img);
      });
    }

    // events
    var $unsupSel = $('#unsup-interpolation-folder');
    if ($unsupSel.length) {
      $unsupSel.on('change', function() {
        var f = $(this).val();
        loadFolderImages(f);
      });
    }

    bulmaSlider.attach();

})
