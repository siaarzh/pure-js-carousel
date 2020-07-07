const slider = document.getElementById('slider');
const sliderItems = document.getElementById('items');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

function slide(
  wrapper: HTMLElement,
  items: HTMLElement,
  prevBtn: HTMLElement,
  nextBtn: HTMLElement
) {
  const slides = items.getElementsByClassName('slide');
  const slidesLength = slides.length;
  const slideSize = (items.getElementsByClassName('slide')[0] as HTMLElement)
    .offsetWidth;
  const firstSlide = slides[0];
  const margin =
    parseInt(window.getComputedStyle(firstSlide, null).marginLeft, 10) * 2;
  const threshold =
    parseInt(window.getComputedStyle(firstSlide, null).width, 10) / 2;
  const lastSlide = slides[slidesLength - 1];
  const cloneFirst = firstSlide.cloneNode(true);
  const cloneLast = lastSlide.cloneNode(true);

  let index = 0;
  let allowShift = true;

  let posInitial: number;
  let posFinal: number;
  let posX1 = 0;
  let posX2 = 0;

  const itemsStyle = items.style;

  function dragAction(e: TouchEvent | MouseEvent) {
    console.log('executing dragAction()');
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

  function shiftSlide(dir: number, action?: string) {
    // moves items exactly one item left or right depending on direction
    console.log('executing shiftSlide()');
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

  function dragEnd() {
    console.log('executing dragEnd()');
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

  function dragStart(e: TouchEvent | MouseEvent) {
    // Handles starting position and pointer tracking for dragging cards.
    console.log('executing dragStart()');

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

  function checkIndex() {
    console.log('executing checkIndex()');
    items.classList.remove('shifting');

    if (index === -1) {
      // index -1 is last slide but appended to the start
      // move all items left so you see last slide
      itemsStyle.left = `${-(slidesLength * (slideSize + margin))}px`;
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

  // Clone first and last slide
  items.appendChild(cloneFirst);
  items.insertBefore(cloneLast, firstSlide);
  wrapper.classList.add('loaded');

  // Mouse and Touch events
  items.addEventListener('mousedown', dragStart);

  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);

  // Click events
  prevBtn.addEventListener('click', () => {
    shiftSlide(-1);
  });
  nextBtn.addEventListener('click', () => {
    shiftSlide(1);
  });

  // Transition events
  items.addEventListener('transitionend', checkIndex);
}

slide(
  <HTMLElement>slider,
  <HTMLElement>sliderItems,
  <HTMLElement>prev,
  <HTMLElement>next
);
