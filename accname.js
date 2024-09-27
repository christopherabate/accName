/**
 * Retrieves the accessible name of an HTML element, taking into account ARIA 
 * attributes and other properties, and returns an object with tested properties.
 * @param {HTMLElement} element - The element for which to obtain the accessible name.
 * @returns {Object} - An object containing keys for each property tested and their values.
 */
function accName(element) {
  // Initialize the result object
  const result = {
    isVisible: true,
    accessibleName: ''
  };

  // Visibility check: returns an empty object if the element or any of its parents is not visible
  if (!element || 
      getComputedStyle(element).visibility === 'hidden' || 
      getComputedStyle(element).display === 'none' || 
      element.closest('[aria-hidden="true"]')) {
    result.isVisible = false;
    return result; // The element is not visible
  }

  // Check if the element has the 'aria-labelledby' attribute
  const ariaLabelledby = element.getAttribute('aria-labelledby');
  if (ariaLabelledby) {
    result.ariaLabelledby = ariaLabelledby.split(' ')
      .map(id => accName(element.ownerDocument.getElementById(id)).accessibleName)
      .filter(Boolean)
      .join(', ');
    if (result.ariaLabelledby) {
      result.accessibleName = result.ariaLabelledby;
    }
  }

  // Check the 'aria-label' attribute
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) {
    result.ariaLabel = ariaLabel;
    result.accessibleName = result.accessibleName || ariaLabel;
  }

  // Check if the element has an ID and get the accessible name of the associated label
  const associatedLabel = element.id && accName(element.ownerDocument.querySelector(`label[for="${element.id}"]`));
  if (associatedLabel && associatedLabel.accessibleName) {
    result.associatedLabel = associatedLabel.accessibleName;
    result.accessibleName = result.accessibleName || associatedLabel.accessibleName;
  }

  // Get the text from the closest label if present
  const closestLabelText = element.closest('label')?.textContent.trim();
  if (closestLabelText) {
    result.closestLabelText = closestLabelText;
    result.accessibleName = result.accessibleName || closestLabelText;
  }

  // Check the 'alt' attribute
  const altText = element.hasAttribute('alt') ? element.getAttribute('alt')?.trim() : '';
  if (altText) {
    result.altText = altText;
    result.accessibleName = result.accessibleName || altText;
  }

  // Get the text from the closest figcaption of a figure
  const figcaptionText = element.closest('figure')?.querySelector('figcaption')?.textContent.trim();
  if (figcaptionText) {
    result.figcaptionText = figcaptionText;
    result.accessibleName = result.accessibleName || figcaptionText;
  }

  // Get the text from the closest caption of a table
  const captionText = element.closest('table')?.querySelector('caption')?.textContent.trim();
  if (captionText) {
    result.captionText = captionText;
    result.accessibleName = result.accessibleName || captionText;
  }

  // Get the text from the closest legend of a fieldset
  const legendText = element.closest('fieldset')?.querySelector('legend')?.textContent.trim();
  if (legendText) {
    result.legendText = legendText;
    result.accessibleName = result.accessibleName || legendText;
  }

  // Check the 'title' attribute
  const titleText = element.getAttribute('title')?.trim();
  if (titleText) {
    result.titleText = titleText;
    result.accessibleName = result.accessibleName || titleText;
  }

  // Check the 'placeholder' attribute
  const placeholderText = element.getAttribute('placeholder')?.trim();
  if (placeholderText) {
    result.placeholderText = placeholderText;
    result.accessibleName = result.accessibleName || placeholderText;
  }

  // Retrieve the visible text content of the element's children
  const childrenText = Array.from(element.childNodes)
    .map(child => child.nodeType === Node.TEXT_NODE ? child.textContent.trim() : accName(child).accessibleName)
    .filter(Boolean)
    .join(' ');

  if (childrenText) {
    result.childrenText = childrenText;
    result.accessibleName = result.accessibleName || childrenText;
  }

  // Set the final accessible name in the result
  result.accessibleName = result.accessibleName || '';

  return result; // Return the result object with all collected data
}
