var sinon = require('sinon');
var Carousel = require('../src/carousel');
var CarouselArrows = require('../src/carousel-arrows');
var assert = require('assert');
var Module = require('module.js');
var TestUtils = require('test-utils');

describe('Carousel', function () {
    var fixture;

    it('should reflect correct index when transitioning through panels', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselEl = document.createElement('div');
        var activeClass = 'carousel-panel-active';
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';

        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var panelChangeSpy = sinon.spy();
        var carouselView = new Carousel({
            panels: panels,
            onPanelChange: panelChangeSpy
        });
        assert.equal(carouselView.getCurrentIndex(), 0, 'getCurrentIndex() returns 0 on initialize');
        assert.ok(panels[0].classList.contains(activeClass), 'active class has been applied to first panel');
        assert.equal(panelChangeSpy.callCount, 1, 'onPanelChange callback was fired since init auto-navigates to first panel');
        carouselView.goTo(2); // go to second index
        assert.equal(carouselView.getCurrentIndex(), 2, 'after transitioning to second panel, getCurrentIndex() returns 2');
        assert.ok(panels[2].classList.contains(activeClass), 'active class has been applied to second panel');
        assert.ok(!panels[0].classList.contains(activeClass), 'active class has been removed from first panel');
        assert.deepEqual(panelChangeSpy.args[1], [2], 'onPanelChange callback was fired with the second index as its first argument');
        carouselView.destroy();
    });

    it('should call goTo() with the initialIndex option that is passed into constructor', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselEl = document.createElement('div');
        var activeClass = 'carousel-panel-active';
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';

        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var carouselGoToSpy = sinon.spy(Carousel.prototype, 'goTo');
        var initialPanelNum = 2;
        var carouselView = new Carousel({
            panels: panels,
            initialIndex: initialPanelNum
        });
        assert.equal(carouselGoToSpy.args[0][0], initialPanelNum, 'goTo() was called with initialIndex option passed in');
        carouselView.destroy();
        carouselGoToSpy.restore();
    });

    it('should not cause unexpected behavior when trying to transition to a panel that is already showing', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselEl = document.createElement('div');
        var activeClass = 'carousel-panel-active';
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';

        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var panelChangeSpy = sinon.spy();
        var panelChangeCallCount = 0;
        var carouselView = new Carousel({
            panels: panels,
            onPanelChange: panelChangeSpy
        });
        panelChangeCallCount++;
        carouselView.goTo(2);
        panelChangeCallCount++;
        assert.deepEqual(panelChangeSpy.args[panelChangeCallCount - 1], [2], 'after transitioning to second panel, onPanelChange callback was fired with the second index as its first argument');
        assert.equal(carouselView.getCurrentIndex(), 2, 'getCurrentIndex() returns 2');
        assert.ok(panels[2].classList.contains(activeClass), 'active class has been applied to second panel');
        carouselView.goTo(2);
        assert.equal(panelChangeSpy.callCount, panelChangeCallCount, 'after going to the second panel again, onPanelChange callback was NOT fired twice');
        assert.equal(carouselView.getCurrentIndex(), 2, 'getCurrentIndex() still returns 2');
        assert.ok(panels[2].classList.contains(activeClass), 'second panel still has active class');
        carouselView.destroy();
    });

    it('should not crash when showing a panel that doesn\'t exists', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselEl = document.createElement('div');
        var activeClass = 'carousel-panel-active';
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';

        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var panelChangeSpy = sinon.spy();
        var panelChangeCallCount = 0;
        var carouselView = new Carousel({
            panels: panels,
            onPanelChange: panelChangeSpy
        });
        panelChangeCallCount++;
        carouselView.goTo(2); // go to third panel
        panelChangeCallCount++;
        assert.equal(carouselView.getCurrentIndex(), 2, 'after transitioning to third panel, getCurrentIndex() returns index of third panel');
        assert.ok(panels[2].classList.contains(activeClass), 'active class has been applied to third panel');
        assert.deepEqual(panelChangeSpy.args[panelChangeCallCount - 1], [2], 'onPanelChange callback was fired with the third panel index as its first argument');
        carouselView.goTo(10); // go to panel of a index that is too high
        panelChangeCallCount++;
        var firstPanelIndex = 0;
        assert.equal(carouselView.getCurrentIndex(), firstPanelIndex, 'after transitioning to a panel with an index that is too high, getCurrentIndex() returns index of first panel');
        assert.ok(panels[firstPanelIndex].classList.contains(activeClass), 'active class has been applied to first panel');
        assert.deepEqual(panelChangeSpy.args[panelChangeCallCount - 1], [firstPanelIndex], 'onPanelChange callback was fired with the first panel index as its first argument');
        carouselView.goTo(-3); // go to panel of a index that is too low
        panelChangeCallCount++;
        var lastPanelIndex = panels.length - 1;
        assert.equal(carouselView.getCurrentIndex(), lastPanelIndex, 'after transitioning to a panel with an index that is too low, getCurrentIndex() returns index of last panel');
        assert.ok(panels[lastPanelIndex].classList.contains(activeClass), 'active class has been applied to last panel');
        assert.deepEqual(panelChangeSpy.args[panelChangeCallCount - 1], [lastPanelIndex], 'onPanelChange callback was fired with the last panel index as its first argument');
        carouselView.destroy();
    });

    it('next() should call goTo() with correct parameters', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselEl = document.createElement('div');
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';

        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var carouselView = new Carousel({panels: panels});
        carouselView.goTo(1); // go to second index
        var goToSpy = sinon.spy(carouselView, 'goTo');
        carouselView.next();
        assert.equal(goToSpy.args[0][0], 2, 'next() calls goTo with third panel index when on second one');
        carouselView.prev();
        assert.equal(goToSpy.args[1][0], 1, 'prev() calls goTo with second panel index when on third one');
        goToSpy.restore();
        carouselView.destroy();
    });

    it('should NOT instantiate CarouselArrows if no left or right arrow is declared in initialize options', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselArrowsInitializeStub = sinon.stub(CarouselArrows.prototype, 'initialize');
        var carouselArrowsDestroyStub = sinon.stub(CarouselArrows.prototype, 'destroy');
        var carouselEl = document.createElement('div');
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';
        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var carouselView = new Carousel({
            panels: panels
        });
        assert.equal(carouselArrowsInitializeStub.callCount, 0);
        carouselArrowsInitializeStub.restore();
        carouselArrowsDestroyStub.restore();
        carouselView.destroy();
    });

    it('should pass arrows and panels in initialize options to CarouselArrows', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselArrowsInitializeSpy = sinon.spy(CarouselArrows.prototype, 'initialize');
        var carouselArrowsDestroySpy = sinon.spy(CarouselArrows.prototype, 'destroy');
        var carouselEl = document.createElement('div');
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';
        var leftArrow = document.createElement('div');
        var rightArrow = document.createElement('div');
        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var carouselView = new Carousel({
            panels: panels,
            leftArrow: leftArrow,
            rightArrow: rightArrow
        });
        assert.deepEqual(carouselArrowsInitializeSpy.args[0][0].panels, panels, 'panels were passed to carousel arrows');
        assert.deepEqual(carouselArrowsInitializeSpy.args[0][0].leftArrow, leftArrow, 'left arrow is passed to carousel arrows');
        assert.deepEqual(carouselArrowsInitializeSpy.args[0][0].rightArrow, rightArrow, 'right arrow was passed to carousel arrows');
        carouselArrowsInitializeSpy.restore();
        carouselArrowsDestroySpy.restore();
        carouselView.destroy();
    });

    it('should call destroy on CarouselArrows when destroy() is called', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselArrowsInitializeSpy = sinon.spy(CarouselArrows.prototype, 'initialize');
        var carouselArrowsDestroySpy = sinon.spy(CarouselArrows.prototype, 'destroy');
        var carouselEl = document.createElement('div');
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';
        var leftArrow = document.createElement('div');
        var rightArrow = document.createElement('div');
        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var carouselView = new Carousel({
            panels: panels,
            leftArrow: leftArrow,
            rightArrow: rightArrow
        });
        carouselView.destroy();
        assert.equal(carouselArrowsDestroySpy.callCount, 1);
        carouselArrowsInitializeSpy.restore();
        carouselArrowsDestroySpy.restore();
    });

    it('should call onLeftArrowClick when left arrow is clicked', function () {
        var fixture = document.getElementById('qunit-fixture');
        var carouselArrowsInitializeSpy = sinon.spy(CarouselArrows.prototype, 'initialize');
        var carouselArrowsDestroySpy = sinon.spy(CarouselArrows.prototype, 'destroy');
        var carouselEl = document.createElement('div');
        carouselEl.innerHTML =
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>' +
            '<div class="carousel-panel"></div>';
        var leftArrow = document.createElement('div');
        var leftArrowClickSpy = sinon.spy();
        var panels = carouselEl.getElementsByClassName('carousel-panel');
        var carouselView = new Carousel({
            panels: panels,
            leftArrow: leftArrow,
            onLeftArrowClick: leftArrowClickSpy
        });
        // go to second panel so that left arrow is enabled
        carouselView.goTo(1);
        var clickEvent = TestUtils.createEvent('click');
        leftArrow.dispatchEvent(clickEvent);
        assert.equal(leftArrowClickSpy.args[0][0], clickEvent, 'click callback was called and passed click event');
        carouselArrowsInitializeSpy.restore();
        carouselArrowsDestroySpy.restore();
        carouselView.destroy();
    });

});