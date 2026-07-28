export const NAV_SECTION_THRESHOLD = 8;
export const SCROLL_EDGE_THRESHOLD = 4;

export interface NavMenuScrollState {
  canScroll: boolean;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

export function getNavMenuScrollState(
  nav: HTMLElement | null,
  disabled = false,
): NavMenuScrollState {
  if (!nav || disabled) {
    return { canScroll: false, canScrollUp: false, canScrollDown: false };
  }

  const { scrollTop, scrollHeight, clientHeight } = nav;
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
  const canScroll = maxScrollTop > SCROLL_EDGE_THRESHOLD;

  return {
    canScroll,
    canScrollUp: canScroll && scrollTop > SCROLL_EDGE_THRESHOLD,
    canScrollDown: canScroll && scrollTop < maxScrollTop - SCROLL_EDGE_THRESHOLD,
  };
}

function afterNavScroll(nav: HTMLElement, onComplete: () => void) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onComplete();
  };

  nav.addEventListener('scrollend', finish, { once: true });
  window.setTimeout(finish, 450);
}

export function scrollNavMenuSection(
  nav: HTMLElement,
  direction: 'up' | 'down',
  onComplete?: () => void,
) {
  const sections = Array.from(nav.querySelectorAll<HTMLElement>('[data-nav-section]'));
  if (!sections.length) return;

  const navTop = nav.getBoundingClientRect().top;
  const maxScrollTop = Math.max(0, nav.scrollHeight - nav.clientHeight);

  const scrollTo = (top: number) => {
    const nextTop = Math.max(0, Math.min(top, maxScrollTop));
    nav.scrollTo({ top: nextTop, behavior: 'smooth' });
    if (onComplete) afterNavScroll(nav, onComplete);
  };

  if (direction === 'down') {
    const next = sections.find(
      (section) => section.getBoundingClientRect().top > navTop + NAV_SECTION_THRESHOLD,
    );

    if (next) {
      const top =
        nav.scrollTop + next.getBoundingClientRect().top - nav.getBoundingClientRect().top;
      scrollTo(top);
      return;
    }

    scrollTo(maxScrollTop);
    return;
  }

  const previous = [...sections]
    .reverse()
    .find((section) => section.getBoundingClientRect().top < navTop - NAV_SECTION_THRESHOLD);

  if (!previous || previous === sections[0]) {
    scrollTo(0);
    return;
  }

  const top =
    nav.scrollTop + previous.getBoundingClientRect().top - nav.getBoundingClientRect().top;
  scrollTo(top);
}
