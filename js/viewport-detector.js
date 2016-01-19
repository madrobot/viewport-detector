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
        this.cardHeight = +this.$el.find(this.selector).filter(':first').height();
        this.sensitivity = options.sensitivity;
        this.threshold = this.cardHeight * this.sensitivity;
        this.windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        this.carousel = options.carousel;

        this.callback = {};
        this.callback.beforeChange = options.callback.beforeChange;
        this.callback.afterChange = options.callback.afterChange;

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
        var card = this.$el.find(this.selector).filter(':first');
        var prev = this.$el.find(this.activeSelector);
        if (this.activate(card, prev)) {
            this.callback.afterChange(0, card[0], this.prev);
        }
    };

    /**
     * Activates the last card
     */
    ViewportDetector.prototype.activateLast = function () {
        var card = this.$el.find(this.selector).filter(':last');
        var prev = this.$el.find(this.activeSelector);
        var cardsLength = this.$el.find(this.selector).length;
        if (this.activate(card, prev)) {
            this.callback.afterChange(cardsLength - 1, card[0], this.prev);
        }
    };

    /**
     * Activates a given card
     */
    ViewportDetector.prototype.activateCard = function (cardIndex, card) {
        var prev = this.$el.find(this.activeSelector);
        if (this.activate($(card), prev)) {
            this.callback.afterChange(cardIndex, card, this.prev);
        }
    };

    /**
     * Switches the active cards
     */
    ViewportDetector.prototype.activate = function (card, prev) {
        if (!card.is(prev)) {
            var cardIndex = this.$el.find(this.selector).index(card);
            this.prev = prev.length ? prev[0] : null;
            var beforeChangeStatus = this.callback.beforeChange(cardIndex, card, this.prev);

            if (beforeChangeStatus !== false) {
                this.resetAll();
                card.addClass(this.activeClass);
                return true;
            }
        }
        return false;
    };

    /**
     * Detects if the given element is within the viewport tolerating specific threshold
     */
    ViewportDetector.prototype.isInViewport = function (el) {

        try {
            var $el = $(el);
            var viewTop = $(window).scrollTop();
            var viewBottom = viewTop + $(window).height();
            var elTop = $el.offset().top;
            var elBottom = elTop + $el.height();

            return ((viewTop < (elTop + this.threshold)) && (viewBottom > (elBottom - this.threshold)));
        } catch (error) { return false; }
    };

    /**
     * Listens to DOM Events
     */
    ViewportDetector.prototype.listen = function () {

        // Define the context of this class
        var detector = this, changedCards = 0;

        // If we're at the top of the page, activate the first element
        if ($(window).scrollTop() <= 0) {
            detector.activateFirst();

        // If we're at the bottom of the page, activate the last element
        } else if (detector.windowHeight + $(window).scrollTop() >= $(document).height()) {
            detector.activateLast();

        // Otherwise, iterate over the given selector to determine states
        } else if (!detector.isInViewport(detector.$el.find(detector.activeSelector).get(0))) {
            detector.$el.find(detector.selector).each(function (cardIndex, card) {
                if (detector.isInViewport(card) && !$(card).hasClass(detector.activeClass) && !changedCards) {
                    detector.activateCard(cardIndex, card);
                    changedCards++;
                    return false;
                }
            });
        }

        // Ensure that only the first element is the given collection has the active class
        if (detector.$el.find(detector.activeSelector).length > 1) {
            var firstCard = null;
            if (typeof detector.carousel == 'object' &&
                typeof detector.carousel.selector == 'string' &&
                detector.carousel.selector.length) {

                firstCard = detector.$el.find(detector.selector).filter(detector.carousel.selector);
            } else {
                firstCard = detector.$el.find(detector.selector).filter(':first');
            }
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
            carousel: null,
            callback: {
                beforeChange: null,
                afterChange: null
            }
        }, settings);

        return this.each(function() {
            var detector = new ViewportDetector(this, options);
            $(window).on('DOMContentLoaded load resize scroll', detector.listen.bind(detector));
        });
    };
}(jQuery));
