(function ($) {

    /**
     * ViewportDetector Class
     */
    function ViewportDetector (el, options) {
        this.$el = $(el);
        this.prev = null;
        this.activeClass = options.activeClass;
        this.selector = options.selector;
        this.activeSelector = this.selector+'.'+this.activeClass;
        this.cardHeight = +this.$el.find(this.selector).filter(':first-child').height();
        this.sensitivity = options.sensitivity;
        this.threshold = this.cardHeight * this.sensitivity;
        this.windowHeight = (window.innerHeight || document.documentElement.clientHeight);

        this.callback = {};
        this.callback.cardChange = options.callback.cardChange;
        this.callback.topCard = options.callback.topCard;
        this.callback.bottomCard = options.callback.bottomCard;

        this.$el.addClass('viewport-detector-enabled');
    };

    /**
     * Deactivates all active cards
     */
    ViewportDetector.prototype.resetAll = function () {
        this.$el.find(this.activeSelector).removeClass(this.activeClass);
    };

    /**
     * Activates the first card
     */
    ViewportDetector.prototype.activateFirst = function () {
        var card = this.$el.find(this.selector).filter(':first-child');
        var prev = this.$el.find(this.activeSelector);
        if (this.activate(card, prev)) {
            this.callback.cardChange(0, card[0], this.prev);
        }
    };

    /**
     * Activates the last card
     */
    ViewportDetector.prototype.activateLast = function () {
        var card = this.$el.find(this.selector).filter(':last-child');
        var prev = this.$el.find(this.activeSelector);
        var cardsLength = this.$el.find(this.selector).length;
        if (this.activate(card, prev)) {
            this.callback.cardChange(cardsLength, card[0], this.prev);
        }
    };

    /**
     * Activates a given card
     */
    ViewportDetector.prototype.activateCard = function (cardIndex, card) {
        var prev = this.$el.find(this.activeSelector);
        if (this.activate($(card), prev)) {
            this.callback.cardChange(cardIndex, card, this.prev);
        }
    };

    /**
     * Switches the active cards
     */
    ViewportDetector.prototype.activate = function (card, prev) {
        if (!card.is(prev)) {
            this.prev = prev.length ? prev[0] : null;
            this.resetAll();
            card.addClass(this.activeClass);
            return true;
        }
        return false;
    };

    /**
     * Detects if the given element is within the viewport tolerating specific threshold
     */
    ViewportDetector.prototype.isInViewport = function (el) {

        // Define the context of this class
        var detector = this;

        // Detect of this is a jQuery element
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }

        // Get the position of this element
        var rect = el.getBoundingClientRect();

        // Check if element is in viewport within the threshold
        return (
            rect.top + detector.threshold >= 0 &&
            rect.bottom - detector.threshold <= detector.windowHeight
        );
    };

    /**
     * Listens to DOM Events
     */
    ViewportDetector.prototype.listen = function () {

        // Define the context of this class
        var detector = this;

        // If we're at the top of the page, activate the first element
        if ($(window).scrollTop() <= 0) {
            detector.activateFirst();

        // If we're at the bottom of the page, activate the last element
        } else if (detector.windowHeight + $(window).scrollTop() >= $(document).height()) {
            detector.activateLast();

        // Otherwise, iterate over the given selector to determine states
        } else {
            detector.$el.find(detector.selector).each(function (cardIndex, card) {
                if (detector.isInViewport(card) && !$(card).hasClass(detector.activeClass)) {
                    detector.activateCard(cardIndex, card);
                }
            });
        }

        // Ensure that only the first element is the given collection has the active class
        if (detector.$el.find(detector.activeSelector).length > 1) {
            var firstCard = detector.$el.find(detector.selector).filter(':first-child');
            detector.resetAll();
            firstCard.addClass(detector.activeClass);
        }
    };

    // Export the jQuery Plugin method
    $.fn.viewportDetector = function (settings) {

        var options = $.extend({
            selector: 'li',
            sensitivity: 0.2,
            activeClass: 'active-card',
            callback: {
                cardChange: null
            }
        }, settings);

        return this.each(function() {
            var detector = new ViewportDetector(this, options);
            $(window).on('DOMContentLoaded load resize scroll', detector.listen.bind(detector));
        });
    };
}(jQuery));
