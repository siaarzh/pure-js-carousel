const slider = document.getElementById('slider');
const sliderItems = document.getElementById('items');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

slide(
  <HTMLElement>slider,
  <HTMLElement>sliderItems,
  <HTMLElement>prev,
  <HTMLElement>next
);

function slide(
  wrapper: HTMLElement,
  items: HTMLElement,
  prev: HTMLElement,
  next: HTMLElement
) {
  let threshold = 100,
    slides = items.getElementsByClassName('slide'),
    slidesLength = slides.length,
    slideSize = (items.getElementsByClassName('slide')[0] as HTMLElement)
      .offsetWidth,
    firstSlide = slides[0],
    lastSlide = slides[slidesLength - 1],
    cloneFirst = firstSlide.cloneNode(true),
    cloneLast = lastSlide.cloneNode(true),
    index = 0,
    allowShift = true;

  let posInitial: number,
    posFinal: number,
    posX1 = 0,
    posX2 = 0;

  // Clone first and last slide
  items.appendChild(cloneFirst);
  items.insertBefore(cloneLast, firstSlide);
  wrapper.classList.add('loaded');

  // Mouse and Touch events
  items.onmousedown = dragStart;

  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);

  // Click events
  prev.addEventListener('click', function () {
    shiftSlide(-1);
  });
  next.addEventListener('click', function () {
    shiftSlide(1);
  });

  // Transition events
  items.addEventListener('transitionend', checkIndex);

  function dragStart(e: TouchEvent | MouseEvent) {
    e = e || window.event;
    e.preventDefault();
    posInitial = items.offsetLeft;

    if (e instanceof TouchEvent) {
      // on touch device
      posX1 = e.touches[0].clientX;
    }

    if (e instanceof MouseEvent) {
      // on desktop
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction(e: TouchEvent | MouseEvent) {
    e = e || window.event;

    if (e instanceof TouchEvent) {
      // on touch device
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    }

    if (e instanceof MouseEvent) {
      // on desktop
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }

    items.style.left = items.offsetLeft - posX2 + 'px';
  }

  function dragEnd(e: TouchEvent | MouseEvent) {
    posFinal = items.offsetLeft;
    console.log('initial position: ', posInitial);
    console.log('');
    
    
    if (posFinal - posInitial < -threshold) {
      shiftSlide(1, 'drag');
    } else if (posFinal - posInitial > threshold) {
      shiftSlide(-1, 'drag');
    } else {
      items.style.left = posInitial + 'px';
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

  function shiftSlide(dir: number, action?: string) {
    items.classList.add('shifting');

    if (allowShift) {
      if (!action) {
        posInitial = items.offsetLeft;
      }

      if (dir == 1) {
        items.style.left = posInitial - slideSize + 'px';
        index++;
      } else if (dir == -1) {
        items.style.left = posInitial + slideSize + 'px';
        index--;
      }
    }

    allowShift = false;
  }

  function checkIndex() {
    items.classList.remove('shifting');

    if (index == -1) {
      items.style.left = -(slidesLength * slideSize) + 'px';
      index = slidesLength - 1;
    }

    if (index == slidesLength) {
      items.style.left = -(1 * slideSize) + 'px';
      index = 0;
    }

    allowShift = true;
  }
}
