export function accName(element) {
  const isVisible = (element) => {
    if (!element) return true;
    return (getComputedStyle(element).visibility !== 'hidden' && getComputedStyle(element).display !== 'none' && !element.closest('[aria-hidden="true"]'))
    ? isVisible(element.parentElement)
    : false;
  };
  
  const getVisibleContent = (element) => {
    return isVisible(element)
    ? [[...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent.trim()).join(' '),[...element.children].map(getVisibleContent).filter(Boolean).join(' ')]
      .join(' ')
      .trim()
    : '';
  }

  const getVisibleLabels = (selector) => [...element.ownerDocument.querySelectorAll(selector)]
  .filter(label => label && isVisible(label))
  .map(label => label.textContent.trim())
  .join(', ');

  const ariaLabels = getVisibleLabels(`#${element.getAttribute('aria-labelledby')?.split(' ').join(', #')}`);
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  const labelForElement = getVisibleLabels(`label[for="${element.id}"]`);
  const closestLabel = element.closest('label')?.textContent.trim();
  const altText = element.hasAttribute('alt') ? element.getAttribute('alt')?.trim() : null;
  const figcaption = element.closest('figure')?.querySelector('figcaption')?.textContent.trim();
  const caption = element.closest('table')?.querySelector('caption')?.textContent.trim();
  const legend = element.closest('fieldset')?.querySelector('legend')?.textContent.trim();
  const title = element.getAttribute('title')?.trim();
  const placeholder = element.getAttribute('placeholder')?.trim();
  const textContent = getVisibleContent(element)?.trim();

  return ariaLabels || ariaLabel || labelForElement || closestLabel || altText || figcaption || caption || legend || title || placeholder || textContent || '';
}
