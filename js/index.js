/**
 * Theme interactions adapted for the Hr00 blog.
 */
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

document.addEventListener("DOMContentLoaded", function () {

  initPostToc();

  var zoomImgs = Array.prototype.slice.call(document.querySelectorAll('.entry-content img'));
  if (zoomImgs.length > 0) {

      var stripOssProcess = function (url) {
        if (!url || typeof url !== 'string' || url.indexOf('x-oss-process=') === -1) return url;
        var hashIndex = url.indexOf('#');
        var hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
        var beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
        var queryIndex = beforeHash.indexOf('?');
        if (queryIndex === -1) return url;
        var base = beforeHash.slice(0, queryIndex);
        var query = beforeHash.slice(queryIndex + 1);
        var params = query
          .split('&')
          .filter(function (param) {
            return param && param.indexOf('x-oss-process=') !== 0;
          });
        var cleaned = params.length ? base + '?' + params.join('&') : base;
        return cleaned + hash;
      };

      var stripCfResize = function (url) {
        if (!url || typeof url !== 'string') return url;
        // Strip Cloudflare image transformations before opening the original image.
        return url.replace(/\/cdn-cgi\/image\/[^/]+\//, '/');
      };

      var getOriginalSrc = function (img) {
        var dataSrc = img.getAttribute('data-pswp-src');
        if (dataSrc) return dataSrc;
        var src = img.getAttribute('data-src') || img.currentSrc || img.src;
        return stripCfResize(stripOssProcess(src));
      };

      var loadCSS = function (href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      };

      var assetV = window.ASSET_VERSION ? '?v=' + window.ASSET_VERSION : '';

      loadCSS("/css/photoswipe.css" + assetV);

      loadScript("/js/photoswipe.umd.min.js" + assetV, function () {
        loadScript("/js/photoswipe-lightbox.umd.min.js" + assetV, function () {
          if (typeof PhotoSwipeLightbox === 'undefined' || typeof PhotoSwipe === 'undefined') return;

          var lightbox = new PhotoSwipeLightbox({
            gallery: '.entry-content',
            children: 'img',
            pswpModule: PhotoSwipe,
            bgOpacity: 0.9,
            padding: { top: 20, bottom: 20, left: 20, right: 20 },
            mainClass: 'pswp--custom-bg pswp--minimal',
          });

          lightbox.addFilter('domItemData', function (itemData, element) {
            if (!element) return itemData;

            // Exclude small icons or specific excluded classes
            if (element.classList.contains('emoji') || element.classList.contains('no-zoom')) return null;

            var src = getOriginalSrc(element);

            // Filter out SVGs or other unwanted types if strictly needed (weekly does it)
            if (src && (src.indexOf('.svg') > -1 || src.indexOf('.gif') > -1)) {
                 // return null; // Removed strict filter to allow zooming gifs/svgs if desired, or keep to match weekly
            }

            // If we can't determine dimensions, PhotoSwipe v5 might struggle or just show it.
            // We can try to get natural dimensions if loaded, or simple attributes.
            // Ideally we need actual width/height.
            // Weekly uses naturalWidth || 1000.

            itemData.src = src;
            itemData.w = Number(element.getAttribute('data-width')) || element.naturalWidth || window.innerWidth;
            itemData.h = Number(element.getAttribute('data-height')) || element.naturalHeight || window.innerHeight;
            itemData.msrc = element.src;

            return itemData;
          });

          lightbox.on('uiRegister', function () {
            lightbox.pswp.ui.registerElement({
              name: 'custom-caption',
              order: 9,
              isButton: false,
              appendTo: 'root',
              html: 'Caption text',
              onInit: (el, pswp) => {
                pswp.on('change', () => {
                  const currSlideElement = pswp.currSlide.data.element;
                  let captionText = '';
                  if (currSlideElement) {
                    captionText = currSlideElement.getAttribute('alt') || '';
                  }
                  el.innerHTML = captionText ? '<div class="pswp-caption-content">' + captionText + '</div>' : '';
                });
              },
            });
          });

          lightbox.init();
        });
      });
  }

  addCodeCopy();

  if (!isPC()) {
    return;
  }
  var beforeScrollTop = document.documentElement.scrollTop;
  document.addEventListener("scroll", function () {
    var afterScrollTop = document.documentElement.scrollTop;
    var delta = afterScrollTop - beforeScrollTop;
    document.getElementById("J_header").setAttribute('class', (delta > 0 && afterScrollTop > 0) ? 'header-menu header-menu-overflow' : 'header-menu');
    beforeScrollTop = afterScrollTop;
  });

  var width = window.innerWidth;
  var height = 260;

  var canvas = document.getElementById('J_firework_canvas');
  if (!canvas) return; // Guard against missing canvas

  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d', { alpha: true });

  var points = [];
  var isAnimating = true;

  var mouse = {
    x: 0,
    y: 9999,
  };

  // Pause animation when canvas is not visible
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        isAnimating = entry.isIntersecting;
      });
    }, { threshold: 0 });
    observer.observe(canvas);
  }

  function Point(x, y, speed, width, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.color = color;
    this.alpha = Math.random() - 0.1;
    this.speed = speed;

    this.active = true;

    this.physx = function () {
      this.y += this.speed;
      if (this.y > canvas.height) this.kill();
    };

    this.kill = function () {
      points.splice(points.indexOf(this), 1);
      this.active = false;
    };

    this.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2, true);
      ctx.fillStyle = this.color;
      ctx.lineWidth = this.width;

      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.restore();
    };
  };

  function drawFirework() {
    if (!isAnimating) {
      requestAnimationFrame(drawFirework);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only create new points if mouse is in active area
    if (mouse.y < height) {
      for (var i = 0; i < 5; i++) {
        var posX = mouse.x + Math.random() * 10;
        var posY = mouse.y + Math.random() * 10;
        points.push(new Point(posX, posY, 1 + Math.random() * 2, 5, 'white'));
      }
    }

    for (var i in points) {
      if (points[i].active) {
        points[i].draw();
        points[i].physx();
      }
    }
    requestAnimationFrame(drawFirework);
  }

  // Check for prefers-reduced-motion
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    drawFirework();
  }

  document.onmousemove = function (e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  }
  document.onmouseout = function (e) {
    mouse.x = 0;
    mouse.y = 9999;
  }


  var qrTextEl = document.getElementById('J_qr_text');
  var isShowQr = qrTextEl && qrTextEl.offsetParent;
  isShowQr && loadScript('https://gw.alipayobjects.com/os/k/qa/qrcode.min.js', function () {
    QRCode && new QRCode(document.getElementById("J_qr_code"), {
      width: 128,
      height: 128,
      useSVG: true,
      text: window.location.href,
      correctLevel: QRCode.CorrectLevel.L
    });
  });

}, false);

function isPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone", "Windows Phone", "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

function loadScript(url, callback) {
  var script = document.createElement("script")
  script.type = "text/javascript";
  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" ||
        script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = function () {
      callback();
    };
  }
  script.src = url;
  document.body.appendChild(script);
}

function addCodeCopy() {
  var highlights = document.querySelectorAll('.highlighter-rouge > div.highlight');
  highlights.forEach(function (highlight) {
    if (highlight.querySelector('.highlight-header')) return;

    var code = highlight.querySelector('code');
    var parent = highlight.parentElement;
    var container = highlight.closest('.highlighter-rouge');
    var language = '';

    if (code) {
      language = code.getAttribute('data-lang') || '';
      if (!language && code.className) {
        var codeMatch = code.className.match(/language-([a-z0-9_+.-]+)/i);
        language = codeMatch ? codeMatch[1] : '';
      }
    }

    if (!language && parent && parent.className) {
      var parentMatch = parent.className.match(/language-([a-z0-9_+.-]+)/i);
      language = parentMatch ? parentMatch[1] : '';
    }

    if (!language && container && container.className) {
      var containerMatch = container.className.match(/language-([a-z0-9_+.-]+)/i);
      language = containerMatch ? containerMatch[1] : '';
    }

    var header = document.createElement('div');
    header.className = 'highlight-header';
    header.innerHTML = '<div class="highlight-dots"><span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span></div><span class="highlight-lang"></span><span class="copy-btn">Copy</span>';
    highlight.insertBefore(header, highlight.firstChild);

    var languageLabel = header.querySelector('.highlight-lang');
    if (language) {
      languageLabel.textContent = language.toUpperCase();
    } else {
      languageLabel.textContent = '';
      languageLabel.style.display = 'none';
    }

    var copyBtn = header.querySelector('.copy-btn');
    copyBtn.addEventListener('click', function () {
      var codeText = highlight.querySelector('pre').innerText;
      navigator.clipboard.writeText(codeText).then(function () {
        copyBtn.textContent = '✓ Copied';
        copyBtn.style.color = '#27c93f';
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
          copyBtn.style.color = '';
        }, 2000);
      })["catch"](function (err) {
        console.error('Failed to copy: ', err);
        copyBtn.textContent = '✗ Failed';
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
        }, 2000);
      });
    });
  });
}

function initPostToc() {
  if (!document.body || document.body.id !== 'post') return;

  var content = document.querySelector('.entry-content');
  var toc = document.getElementById('J_post_toc');
  var tocNav = document.getElementById('J_post_toc_nav');
  var tocMarker = document.getElementById('J_post_toc_marker');
  var progress = document.getElementById('J_post_toc_progress');
  var progressValue = document.getElementById('J_post_toc_progress_value');
  var progressFill = document.getElementById('J_post_toc_progress_fill');
  var topButton = document.getElementById('J_post_toc_top');
  if (!content || !toc || !tocNav || !tocMarker || !progress || !progressValue || !progressFill || !topButton) return;

  var headings = Array.prototype.slice.call(content.querySelectorAll('h1:not(.post-title), h2, h3, h4:not(.page-info), h5, h6')).filter(function (heading) {
    return heading.textContent && heading.textContent.trim();
  });

  if (headings.length < 5) return;

  var slugCounts = Object.create(null);

  var slugify = function (text, index) {
    var base = text
      .trim()
      .toLowerCase()
      .replace(/[^\w\u00C0-\u024F\u4E00-\u9FFF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!base) {
      base = 'section-' + (index + 1);
    }

    var nextCount = (slugCounts[base] || 0) + 1;
    slugCounts[base] = nextCount;
    return nextCount > 1 ? base + '-' + nextCount : base;
  };

  var tocItems = headings.map(function (heading, index) {
    var id = heading.id || slugify(heading.textContent, index);
    if (!heading.id) {
      heading.id = id;
    }

    return {
      element: heading,
      id: id,
      text: heading.textContent.trim(),
      level: heading.tagName.toLowerCase()
    };
  });

  var tocHierarchy = buildPostTocHierarchy(tocItems);
  var tocVisibleItems = tocHierarchy.visibleItems;

  var buildNav = function (target) {
    Array.prototype.slice.call(target.querySelectorAll('.post-toc-link')).forEach(function (link) {
      link.remove();
    });

    tocVisibleItems.forEach(function (item) {
      var link = document.createElement('a');
      link.className = 'post-toc-link' + (item.depth > 0 ? ' is-child' : '');
      link.style.setProperty('--toc-depth', item.depth);
      link.href = '#' + item.id;
      link.textContent = item.text;
      link.title = item.text;
      link.setAttribute('data-toc-id', item.id);
      link.setAttribute('data-toc-branch-id', item.branchId);
      target.appendChild(link);
    });
  };

  buildNav(tocNav);

  toc.hidden = false;

  document.body.classList.add('has-post-toc');

  var updateMarker = function (activeLink) {
    if (!activeLink || activeLink.offsetParent === null) {
      tocMarker.classList.remove('is-visible');
      return;
    }

    tocNav.style.setProperty('--toc-marker-y', activeLink.offsetTop + 'px');
    tocNav.style.setProperty('--toc-marker-height', activeLink.offsetHeight + 'px');
    tocMarker.classList.add('is-visible');
  };

  var setActive = function (id) {
    var activeItem = tocVisibleItems.find(function (item) {
      return item.id === id;
    });
    var activeBranchId = activeItem ? activeItem.branchId : tocVisibleItems[0].branchId;
    var activeLink = null;

    tocNav.querySelectorAll('.post-toc-link').forEach(function (link) {
      var isActive = link.getAttribute('data-toc-id') === id;
      var isInActiveBranch = link.getAttribute('data-toc-branch-id') === activeBranchId;

      link.classList.toggle('is-active', isActive);
      link.classList.toggle('is-in-active-branch', isInActiveBranch);

      if (isActive) {
        link.setAttribute('aria-current', 'location');
        activeLink = link;
      } else {
        link.removeAttribute('aria-current');
      }
    });

    window.requestAnimationFrame(function () {
      updateMarker(activeLink);
    });
  };

  var updateProgress = function () {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var contentRect = content.getBoundingClientRect();
    var articleTop = contentRect.top + scrollY;
    var percentage = getPostReadProgress(
      scrollY,
      articleTop,
      content.offsetHeight,
      window.innerHeight
    );
    var showTopButton = shouldShowPostTocTop(scrollY, window.innerHeight);

    progressValue.textContent = percentage + '%';
    progressFill.style.width = percentage + '%';
    progress.setAttribute('aria-valuenow', percentage);

    topButton.classList.toggle('is-visible', showTopButton);
    topButton.setAttribute('aria-hidden', String(!showTopButton));
    topButton.tabIndex = showTopButton ? 0 : -1;
  };

  var computeActiveHeading = function () {
    var pivot = window.innerHeight * 0.22;
    var activeId = tocVisibleItems[0].id;

    tocVisibleItems.forEach(function (item) {
      if (item.element.getBoundingClientRect().top <= pivot) {
        activeId = item.id;
      }
    });

    setActive(activeId);
    updateProgress();
  };

  var ticking = false;
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      computeActiveHeading();
      ticking = false;
    });
  };

  computeActiveHeading();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  topButton.addEventListener('click', function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  });
}

function buildPostTocHierarchy(items) {
  if (!items.length) {
    return { items: [], visibleItems: [] };
  }

  var headingLevels = items.map(function (item) {
    return Number(item.level.slice(1));
  });
  var shallowestLevel = Math.min.apply(null, headingLevels);
  var hierarchicalItems = items.map(function (item, index) {
    return {
      element: item.element,
      id: item.id,
      text: item.text,
      level: item.level,
      depth: headingLevels[index] - shallowestLevel
    };
  });
  var currentBranchId = hierarchicalItems[0].id;

  hierarchicalItems.forEach(function (item) {
    if (item.depth === 0) {
      currentBranchId = item.id;
    }

    item.branchId = currentBranchId;
  });

  return {
    items: hierarchicalItems,
    visibleItems: hierarchicalItems
  };
}

function getPostReadProgress(scrollY, articleTop, articleHeight, viewportHeight) {
  if (articleHeight <= viewportHeight) {
    return scrollY >= articleTop ? 100 : 0;
  }

  var readingDistance = articleHeight - viewportHeight;
  var percentage = ((scrollY - articleTop) / readingDistance) * 100;
  return Math.round(Math.min(Math.max(percentage, 0), 100));
}

function shouldShowPostTocTop(scrollY, viewportHeight) {
  return scrollY > viewportHeight * 0.75;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildPostTocHierarchy: buildPostTocHierarchy,
    getPostReadProgress: getPostReadProgress,
    shouldShowPostTocTop: shouldShowPostTocTop
  };
}
