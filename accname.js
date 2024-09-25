export function accName(element) {
  /**
   * Determines if an element is visible by checking its styles and aria-hidden attribute.
   * Uses recursion to check all parent elements.
   * @param {HTMLElement} element - The element to check.
   * @returns {boolean} - True if the element and its ancestors are visible.
   */
  const isVisible = (element) => {
    if (!element) return true;
    const computedStyle = getComputedStyle(element);
    if (computedStyle.visibility === 'hidden' || computedStyle.display === 'none' || element.closest('[aria-hidden="true"]')) {
      return false;
    }
    return isVisible(element.parentElement);
  };

  /**
   * Recursively collects visible text content from the element and its children.
   * @param {HTMLElement} element - The element to retrieve content from.
   * @returns {string} - The visible content as a trimmed string.
   */
  const getVisibleContent = (element) => {
    if (!isVisible(element)) return '';
    
    const textNodes = [...element.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .join(' ');

    const childrenContent = [...element.children]
      .map(getVisibleContent)
      .filter(Boolean)
      .join(' ');

    return [textNodes, childrenContent].join(' ').trim();
  };

  /**
   * Retrieves visible labels from a given selector.
   * @param {string} selector - The CSS selector to match labels.
   * @returns {string} - The concatenated visible label content.
   */
  const getVisibleLabels = (selector) => {
    return [...element.ownerDocument.querySelectorAll(selector)]
      .filter(isVisible)
      .map(label => label.textContent.trim())
      .join(', ');
  };

  // Collects accessible name sources
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

  // Return the first non-empty value in priority order
  return ariaLabels || ariaLabel || labelForElement || closestLabel || altText || figcaption || caption || legend || title || placeholder || textContent || '';
}
