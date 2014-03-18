/*
 * Copyright (c) 2014, Jeshan G. BABOOA (j@code.jeshan.co)
 * All rights reserved.
 *
 * The Simplified BSD licence follows:
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted
 *  provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions
 * and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions
 * and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * User: jeshan
 * Date: 09/03/14
 * Time: 12:29
 */

var images = {};

var $ = jQuery; // so that JSLint doesn't bug me

debugger;

function createImage(img, caption) {
    var imgSrc = img.attr('src');
    return {
        src: imgSrc.indexOf('//') === 0 ? window.location.protocol + imgSrc : imgSrc,
        alt: img.attr('alt'),
        html: $(img).prop('outerHTML'),
        caption: caption,
        width: img.width(),
        height: img.height(),
        isLandscape: img.width() > img.height()
    };
}

function addImage(img, caption) {
    if (isIcon(img) || isDataImage(img)) {
        return;
    }
    var image = createImage(img, caption);
    images[window.location].push(image);
}

function hideSlideshow() {
    $('#overlay').hide();
}

function showSlideshow() {
    if (!$(document).find('#overlay').length) {
        createSlideshow();
    }
    $('#overlay').show();
}

function slidesHeight() {
    return 0.87 * $(window).height();
}

function slidesWidth() {
    return 0.87 * $(window).width();
}

/**
 *
 * @param img
 * @returns boolean image is deemed to small to put into the slideshow
 */
function isIcon(img) {
    return img.width() * img.height() <= 3600;
}

function isDataImage(img) {
    // likely to be a pixel tracker
    return img.attr('src').indexOf("data:image/gif") === 0;
}


function setImageDimensions() {
    $('#overlay').find('img').each(function (index) {
        var img = $(this);
        var image = images[window.location][index];
        var height, width;
        var maxWidth = slidesWidth();
        var maxHeight = slidesHeight();
        if (image.isLandscape) {
            width = slidesWidth();
            height = image.height * width / image.width;
            if (height > maxHeight) {
                width = width * maxHeight / height;
                height = maxHeight;
            }
        }
        else {
            height = slidesHeight();
            width = image.width * height / image.height;
            if (width > maxWidth) {
                height = height * maxWidth / width;
                width = maxWidth;
            }
        }
        img.css({
            'height': height + "px",
            'width': width + "px"
        });
    });
}

function setImage(number) {
    $('#position').text(number + '/' + images[window.location].length);
    var image = images[window.location][number - 1];
    $('.caption').text(image.caption || image.alt);
}


function createSlideshow() {
    var templateStart = '<div id="overlay"><div class="container"><div id="slides">';
    var templateEnd = '</div></div><a href="#" class="close">Close</a><p id="position"></p><p class="caption"></p></div>';
    var html = templateStart;
    $(images[window.location]).each(function () {
        html = html + this.html;
    });

    /*var buttons = '<a href="#" class="slidesjs-previous slidesjs-navigation"><i class="icon-chevron-left icon-large"></i></a><a href="#" class="slidesjs-next slidesjs-navigation"><i class="icon-chevron-right icon-large"></i></a>';*/

    var rendered = html + templateEnd;
    $(rendered).appendTo(document.body);

    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    $('#slides').slidesjs({
        width: windowWidth,
        height: slidesHeight(),
        'max-width': windowWidth,
        'max-height': windowHeight,
        callback: {
            loaded: function (number) {
                console.log('SlidesJS: Loaded with slide #' + number);
                setImage(number);
                setImageDimensions();
            },
            start: function (number) {
                console.log('SlidesJS: Start Animation on slide #' + number);
                setImage(number);
            },
            complete: function (number) {
                console.log('SlidesJS: Animation Complete. Current slide is #' + number);
                setImage(number);
            }
        }
    });

    $('.close').click(function (e) {
        e.preventDefault();
        hideSlideshow();
    });

    $('#overlay').bind('keyup', function (e) {
        console.log(e);
        alert(e);
    });

}

/**
 * Generic function to handle any other kinds of images
 * @param selector
 * @param defaultCaption
 */
function handleImagesInSelector(selector, defaultCaption) {
    $(selector).each(function (index, item) {
        var img = $(item);
        addImage(img, defaultCaption);
    });
}

/**
 * For various Google sites
 */
function initGoogle() {
    if (!window.location.host.match(/.+\.google\.+.+/)) {
        return false;
    }

    /**
     * The knowledge graph
     */
    function googleSearch() {
        // TODO: I think that it may not update images when google instant is too instant!

        var mainDescription = $("div.kno-fb-ctx").first().children(); // until I find a better solution, I know it's here somewhere
        images.defaultCaption = "";
        $.each(mainDescription, function () {
            var element = $(this);
            images.defaultCaption += element.text().trim() + " ";
        });
        handleImagesInSelector('#media_result_group img', images.defaultCaption.trim());

        //TODO: div.kno-card for related content in the knowledge graph box
    }

    googleSearch();
    return true;
}

/**
 * For sites running MediaWiki
 * @returns {boolean}
 */
function initMediaWiki() {
    if (!$(document.body).is('.mediawiki')) {
        return false;
    }
    var content = $('#bodyContent'), infoboxImages = content.find('.infobox img');
    if (infoboxImages.is('img')) {
        $.each(infoboxImages, function () {
            var infoboxImage = $(this);
            var caption = infoboxImage.parent().siblings("small").text().trim();
            if (caption.length === 0) {
                caption = infoboxImage.closest("tr").next().text().trim();
            }
            addImage(infoboxImage, caption);
        });
    }
    $('.thumbinner img').each(function () {
        var img = $(this);
        var caption = img.closest(".thumbimage").siblings(".thumbcaption").text().trim();
        if (caption.length === 0) {
            caption = img.closest(".thumbinner").find(".thumbcaption").text().trim();
        }
        addImage(img, caption.length !== 0 ? caption : img.text().trim());
    });
    return true;
}

/**
 * For any other sites
 */
function initGeneralSite() {
    if ($(document.body).is('.mediawiki')) {
        return;
    }
    handleImagesInSelector('img');
}

function toggleSlideshow() {
    if ($('#overlay:visible').length) {
        hideSlideshow();
    }
    else {
        showSlideshow();
    }
}

function initFunction() {
    if (!images[window.location]) {
        images[window.location] = [];
    }
    if (images[window.location].length === 0) {
        var ranScriptOnWikimedia = initMediaWiki();
        var ranScriptOnGoogle = initGoogle();
        if (!ranScriptOnWikimedia && !ranScriptOnGoogle) {
            initGeneralSite();
        }
    }
    $('.caption').text(images.defaultCaption);
    if (images[window.location].length !== 0) {
        toggleSlideshow();
    }
}


/**
 * Extension button click
 */
chrome.runtime.onMessage.addListener(
    function (response) {
        if (response.action === "initSlideshow") {
            initFunction();
        }
    }
);

