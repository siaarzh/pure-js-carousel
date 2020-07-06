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
  const threshold = 100;
  const slides = items.getElementsByClassName('slide');
  const slidesLength = slides.length;
  const slideSize = (items.getElementsByClassName('slide')[0] as HTMLElement)
    .offsetWidth;
  const firstSlide = slides[0];
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
    // e = e || window.event;

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

    itemsStyle.left = `${items.offsetLeft - posX2}px`;
  }

  function shiftSlide(dir: number, action?: string) {
    items.classList.add('shifting');

    if (allowShift) {
      if (!action) {
        posInitial = items.offsetLeft;
      }

      if (dir === 1) {
        itemsStyle.left = `${posInitial - slideSize}px`;
        index += 1;
      } else if (dir === -1) {
        itemsStyle.left = `${posInitial + slideSize}px`;
        index -= 1;
      }
    }

    allowShift = false;
  }

  function dragEnd() {
    posFinal = items.offsetLeft;

    console.log('initial position: ', posInitial);
    console.log('');

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
    const dragEvent = e || window.event;
    dragEvent.preventDefault();
    posInitial = items.offsetLeft;

    if (dragEvent instanceof TouchEvent) {
      // on touch device
      posX1 = dragEvent.touches[0].clientX;
    }

    if (dragEvent instanceof MouseEvent) {
      // on desktop
      posX1 = dragEvent.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function checkIndex() {
    items.classList.remove('shifting');

    if (index === -1) {
      itemsStyle.left = `${-(slidesLength * slideSize)}px`;
      index = slidesLength - 1;
    }

    if (index === slidesLength) {
      itemsStyle.left = `${-(1 * slideSize)}px`;
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
  // items.onmousedown = dragStart;

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
