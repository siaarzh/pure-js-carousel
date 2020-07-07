### How this works

The cards are places in horizontal adjacency to each other. Additional cards are
added before the first and after the last cards to make swiping smoother.

```js
const sliderItems = document.getElementById('items');
const slides = sliderItems.getElementsByClassName('slide');
const firstSlide = slides[0];
const lastSlide = slides[slides.length - 1];

const cloneFirst = firstSlide.cloneNode(true);
const cloneLast = lastSlide.cloneNode(true);

sliderItems.appendChild(cloneFirst);
sliderItems.insertBefore(cloneLast, firstSlide);
```

To create the illusion of infinite scroll, the cards get destroyed and rebuilt
depending on which card you are on right now:

- at card one: all cards to the left are loaded (plus left and right ends)
- at card five: all cards to the right are loaded (plus left and right ends)

```js
function checkIndex() {
  items.classList.remove('shifting');

  if (index === -1) {
    // index -1 is last slide but appended to the start
    // move all items left so you see last slide
    itemsStyle.left = `${-(slidesLength * (slideSize + margin))}px`; // - (5slides x 300px)
    index = slidesLength - 1;
  }

  if (index === slidesLength) {
    // index slideLength is first slide but appended to the end
    // reset position to -slideWidth px, which will show first slide
    itemsStyle.left = `${-(1 * (slideSize + margin))}px`;
    index = 0;
  }

  allowShift = true;
}
```

Initially, this card array starts at card five and is shifted using `left` as
relative position (`left: -$itemWidth;`) so that card one is displayed. All
proceeding swipes are therefore set by the `left` property.

Note, that by adding the `shifting` css class we change animation behavior:

```css
.items.shifting {
  transition: left .2s ease-out;
}
```

#### Button Actions

1. Clicking the navigation buttons simply executes a `shiftSlide()` function:

    ```js
    function shiftSlide(dir: number, action?: string) {
      items.classList.add('shifting');

      if (allowShift) {
        if (!action) {
          posInitial = items.offsetLeft;
        }

        if (dir === 1) {
          itemsStyle.left = `${posInitial - slideSize - margin}px`;
          index += 1;
        } else if (dir === -1) {
          itemsStyle.left = `${posInitial + slideSize + margin}px`;
          index -= 1;
        }
      }

      allowShift = false;
    }
    ```

    Depending on which button is pressed the corresponding shift in position and
    index are set. Note that, here, the `allowShift` property acts as a guard
    against changing position again before the animation finishes.

2. At the end of the `transition` animation the `checkIndex()` function is
executed which will shift the items again if needed:

    ```ts
    items.addEventListener('transitionend', checkIndex);
    ```

    As can be seen above, once executed, the `allowShift` property is again set
    to enable shifting.

#### Drag Actions

1. The `.items` element listens for clicks/touches and invokes a `dragStart()`
function that marks the starting horizontal (x axis) position:

    ```ts
    function dragStart(e: TouchEvent | MouseEvent) {
      // Handles starting position and pointer tracking for dragging cards.

      const startEvent = e || window.event;
      startEvent.preventDefault();
      posInitial = items.offsetLeft;

      if (startEvent instanceof TouchEvent) {
        // on touch device
        // dragging is handled by touchmove, which only exists if touchstart event
        // exists
        posX1 = startEvent.touches[0].clientX;
      }

      if (startEvent instanceof MouseEvent) {
        // on desktop
        // dragging is handled by onmousemove, which is always true, therefore
        // we listen to onmouseup inside a if(mousedown) clause
        posX1 = startEvent.clientX;
        document.onmouseup = dragEnd;
        document.onmousemove = dragAction;
      }
    }
    ```

    Here, we differentiate between mouse and touch events. A major reason for
    this is that `mousemove` and `touchmove` are not predicated in the same
    manner.

    `mousemove` - is always moving, therefore we should listen only when
    `mousedown` is applied to the `.items` element

    `touchmove` - is only active after a `touchstart` event.

    Therefore we only listen to 4 events instead of 6:

    ```ts
    // Mouse and Touch events
    items.addEventListener('mousedown', dragStart);
    // items.addEventListener('mouseup', dragEnd);       // don't do this
    // items.addEventListener('mousemove', dragAction);  // don't do this


    // Touch events
    items.addEventListener('touchstart', dragStart);
    items.addEventListener('touchend', dragEnd);
    items.addEventListener('touchmove', dragAction);
    ```

2. Once the mouse or finger start to move, the `dragAction()` function takes
over:

    ```ts
    function dragAction(e: TouchEvent | MouseEvent) {
      // moves cards at every drag or move event emission

      if (e instanceof TouchEvent) {
        // on touch device
        posX2 = posX1 - e.touches[0].clientX;
      }

      if (e instanceof MouseEvent) {
        // on desktop
        posX2 = posX1 - e.clientX;
      }

      itemsStyle.left = `${posInitial - posX2}px`;
    }
    ```

    For every movement/drag event (given the initial position of the `.items`
    element `left` attribute set in `posInitial` from step 1), a new position is
    set using the effective distance being travelled by the mouse/finger.

3. Once the dragging is done, the final positions are handled by `dragEnd()`:

    ```js
    function dragEnd() {
      // handles final position
      posFinal = items.offsetLeft;

      if (posFinal - posInitial < -threshold) {
        shiftSlide(1, 'drag');
      } else if (posFinal - posInitial > threshold) {
        shiftSlide(-1, 'drag');
      } else {
        itemsStyle.left = `${posInitial}px`;
      }

      document.onmouseup = null;
      document.onmousemove = null;
    }
    ```

4. Should the mouse/finger have travelled further than the threshold (e.g. half
of the distance), then the `shiftSlide()` function will set the new position
and current card index. Otherwise, the slide will return to the original
state.

Note that the sliding enables sliding of only one card at a time.