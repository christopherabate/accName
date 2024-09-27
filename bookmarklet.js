// Immediately-invoked function expression (IIFE) to encapsulate the code
(function() {
  // Function to compute the accessible name for a given element
  function accName(element) {
    const result = {};

    // Check if the element is visible
    if (!element || 
        getComputedStyle(element).visibility === 'hidden' || 
        getComputedStyle(element).display === 'none' || 
        element.closest('[aria-hidden="true"]')) {
      return result; // The element is not visible, return an empty object
    }

    // Check for the 'aria-labelledby' attribute
    if (element.getAttribute('aria-labelledby')) {
      const ids = element.getAttribute('aria-labelledby').split(' '); // Split the IDs
      const labelledBy = ids.reduce((acc, id) => {
        const labelElement = element.ownerDocument.getElementById(id); // Get the label element by ID
        if (labelElement) {
          const key = labelElement.id ? `${labelElement.tagName.toLowerCase()}#${labelElement.id}` : `${labelElement.tagName.toLowerCase()}`; // Format the key
          const labelAccName = accName(labelElement); // Recursively get the accessible name for the label
          if (Object.keys(labelAccName).length > 0) {
            acc[key] = labelAccName; // Only add if labelAccName is not empty
          }
        }
        return acc; // Return accumulated results
      }, {});

      if (Object.keys(labelledBy).length > 0) {
        result['aria-labelledby'] = labelledBy; // Add labelledBy results to the result object
      }
    }

    // Check for the 'aria-label' attribute
    const ariaLabel = element.getAttribute('aria-label')?.trim();
    if (ariaLabel) {
      result['aria-label'] = ariaLabel; // Add aria-label if it exists
    }

    // Check for an associated label
    if (element.id) {
      const labelElement = element.ownerDocument.querySelector(`label[for="${element.id}"]`); // Select the label for the element
      if (labelElement) {
        const labelAccName = accName(labelElement); // Get accessible name for the label
        if (Object.keys(labelAccName).length > 0) {
          result['label[for]'] = labelAccName; // Treat the label as an object
        }
      }
    }

    // Get text from the closest label
    const closestLabel = element.closest('label')?.textContent.trim();
    if (closestLabel) {
      result['closest-label'] = closestLabel; // Add closest label text if it exists
    }

    // Check for 'alt' attribute (typically for images)
    const alt = element.getAttribute('alt')?.trim();
    if (alt) {
      result['alt'] = alt; // Add alt text if it exists
    }

    // Get the text from the closest <figcaption> element
    const figcaption = element.closest('figure')?.querySelector('figcaption')?.textContent.trim();
    if (figcaption) {
      result['figcaption'] = figcaption; // Add figcaption text if it exists
    }

    // Get the text from the closest <caption> element in a table
    const tableCaption = element.closest('table')?.querySelector('caption')?.textContent.trim();
    if (tableCaption) {
      result['caption'] = tableCaption; // Add caption text if it exists
    }

    // Get the text from the closest <legend> element in a fieldset
    const fieldsetLegend = element.closest('fieldset')?.querySelector('legend')?.textContent.trim();
    if (fieldsetLegend) {
      result['legend'] = fieldsetLegend; // Add legend text if it exists
    }

    // Check for 'title' attribute
    const title = element.getAttribute('title')?.trim();
    if (title) {
      result['title'] = title; // Add title text if it exists
    }

    // Check for 'placeholder' attribute
    const placeholder = element.getAttribute('placeholder')?.trim();
    if (placeholder) {
      result['placeholder'] = placeholder; // Add placeholder text if it exists
    }

    // Get accessible names of child nodes
    const children = Array.from(element.childNodes).reduce((acc, child, index) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const textContent = child.textContent.trim(); // Get the text content of text nodes
        if (textContent) {
          acc['text'] = textContent; // Add text node as a key with an empty object as its value
        }
      } else {
        const childAccName = accName(child); // Get accessible name for the child
        if (Object.keys(childAccName).length > 0) {
          // Use tag name as a key and append index for uniqueness if necessary
          const key = child.id ? `${child.tagName.toLowerCase()}#${child.id}` : `${child.tagName.toLowerCase()}_${index}`;
          acc[key] = childAccName; // Ensure the key is unique
        }
      }
      return acc; // Return the accumulated object
    }, {});

    if (Object.keys(children).length > 0) {
      result['children'] = children; // Store all children in the result object
    }

    // Return the result object only if it has keys
    return Object.keys(result).length > 0 ? result : {}; // Return the complete result object only if it's not empty
  }

  // Function to truncate text to a specified length
  function truncateText(text, maxLength = 120) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text; // Truncate and append '...' if necessary
  }

  // Function to create HTML recursively from an object
  function createAccNameHTML(obj) {
    let html = '<ul>'; // Initialize an unordered list
    for (const [key, value] of Object.entries(obj)) { // Iterate over each key-value pair in the object
      if (typeof value === 'object' && value !== null) {
        html += `<li><strong>${key}:</strong> ${createAccNameHTML(value)}</li>`; // Recursive call for nested objects
      } else {
        html += `<li><strong>${key}:</strong> ${truncateText(value)}</li>`; // Truncate and format non-object values
      }
    }
    html += '</ul>'; // Close the unordered list
    return html; // Return the generated HTML
  }

  // Create a root div to encapsulate the tooltip
  const tooltipContainer = document.createElement('div');
  document.body.appendChild(tooltipContainer); // Append the tooltip container to the body

  // Use Shadow DOM to encapsulate the tooltip's styles
  const shadowRoot = tooltipContainer.attachShadow({ mode: 'open' });
  
  // Create a draggable tooltip
  const tooltip = document.createElement('div');
  tooltip.style.position = 'fixed'; // Position tooltip fixed on the screen
  tooltip.style.top = '10px'; // Set top position
  tooltip.style.left = '10px'; // Set left position
  tooltip.style.width = '400px'; // Set tooltip width
  tooltip.style.backgroundColor = 'yellow'; // Set background color
  tooltip.style.border = '1px solid black'; // Set border
  tooltip.style.padding = '10px'; // Set padding
  tooltip.style.zIndex = '10000'; // Ensure it is on top
  tooltip.style.cursor = 'move'; // Change cursor to indicate dragging
  tooltip.style.userSelect = 'none'; // Disable text selection while dragging
  tooltip.style.boxShadow = '2px 2px 10px rgba(0,0,0,0.5)'; // Add shadow for better visibility
  shadowRoot.appendChild(tooltip); // Append tooltip to shadow root
  
  // Add close button (X)
  const closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;'; // Set close button to 'X'
  closeButton.style.position = 'absolute'; // Position the button absolutely within the tooltip
  closeButton.style.top = '5px'; // Set top position
  closeButton.style.right = '10px'; // Set right position
  closeButton.style.cursor = 'pointer'; // Change cursor to pointer
  closeButton.style.fontSize = '16px'; // Set font size
  closeButton.style.fontWeight = 'bold'; // Set font weight
  closeButton.style.color = '#333'; // Set text color
  tooltip.appendChild(closeButton); // Append close button to tooltip

  // Function to close the tooltip
  closeButton.addEventListener('click', function() {
    tooltip.style.display = 'none'; // Hide the tooltip on close
  });

  // Add draggable functionality
  let isDragging = false; // State to track dragging
  let offsetX, offsetY; // Variables to store offset values

  tooltip.addEventListener('mousedown', function(e) {
    isDragging = true; // Set dragging state to true
    offsetX = e.clientX - tooltip.offsetLeft; // Calculate x offset
    offsetY = e.clientY - tooltip.offsetTop; // Calculate y offset
  });

  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      tooltip.style.left = (e.clientX - offsetX) + 'px'; // Update tooltip position on x-axis
      tooltip.style.top = (e.clientY - offsetY) + 'px'; // Update tooltip position on y-axis
    }
  });

  document.addEventListener('mouseup', function() {
    isDragging = false; // Reset dragging state on mouse up
  });

  // Add mouseover event listener to show accessible name on hover
  document.addEventListener('mouseover', function(event) {
    const element = event.target; // Get the element under the mouse
    
    // Prevent action if the mouse is over the tooltip or its descendants
    if (tooltip.contains(element)) return;

    // Ignore specified element types
    if (['div', 'html', 'body'].includes(element.tagName.toLowerCase())) return;

    const name = accName(element); // Get accessible name for the hovered element

    // Retrieve the tagName, ID, and class of the element
    const tagName = element.tagName.toLowerCase(); // Get the tag name
    const elementID = element.id ? `#${element.id}` : ''; // Get ID if it exists
    const elementClass = element.className ? `.${[...element.classList].join('.')}` : ''; // Get classes if they exist

    // Format the results in a readable manner
    tooltip.innerHTML = `
      <strong>${tagName}${elementID}${elementClass}:</strong><br/>
      ${createAccNameHTML(name)}  <!-- Call the function to create HTML -->
    `;
    tooltip.appendChild(closeButton); // Re-append the close button after modifying content
  });

  // Hide the tooltip when no element is hovered over
  document.addEventListener('mouseout', function() {
    tooltip.innerHTML = '<strong>Hover over an element to see its accessible name</strong>'; // Reset tooltip content
    tooltip.appendChild(closeButton); // Re-append the close button after modifying content
  });

  // Initial message in the tooltip
  tooltip.innerHTML = '<strong>Hover over an element to see its accessible name</strong>'; // Set default message
  tooltip.appendChild(closeButton); // Re-append the close button after modifying content
  
  // Add basic styles inside the Shadow DOM to ensure isolation
  const style = document.createElement('style');
  style.textContent = `
    div {
      font-family: Arial, sans-serif; /* Set font family */
      color: black; /* Set text color */
      font-size: 14px; /* Set font size */
      line-height: 1.5; /* Set line height */
      overflow: auto; /* Allow scrolling if content overflows */
    }
    strong {
      font-weight: bold; /* Set strong text to bold */
    }
  `;
  shadowRoot.appendChild(style); // Append styles to shadow root
})();
