// ==UserScript==
// @name         ADPL For BM
// @namespace    https://adpl.sblzd.cn/
// @version      2025-09-08
// @description  The ADPL plugin for BlueMarble
// @author       You
// @match        *://wplace.live/*
// @icon         https://adpl.sblzd.cn/icons/adpl-icon64.png
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    const usw = unsafeWindow || window;

    usw.patches_orig = {};

    // BM compat
    usw.fetchIsPatched = true;
    window.fetchIsPatched = true;

    usw.patches_orig.Promise = usw.Promise;
    let patchedPromise = class PawsomePromise extends Promise {
        constructor(exec) {
            super(exec);
            if (exec.toString().includes("maps.wplace.live")) {
                console.log("caught map promise >:3c");
                this.then((map) => {
                    console.log("map exposed !! >:3");
                    usw._map = map;
                    usw.Promise = usw.patches_orig.Promise;
                });
            }
        }
    }
    usw.Promise = patchedPromise;
  
    // Wait for the Blue Marble container to be available
    function waitForElement(selector, callback, maxWaitTime = 10000) {
        const startTime = Date.now();
        
        function check() {
            const element = document.querySelector(selector);
            if (element) {
                callback(element);
                return;
            }
            
            if (Date.now() - startTime > maxWaitTime) {
                console.log('Blue Marble container not found within timeout');
                return;
            }
            
            requestAnimationFrame(check);
        }
        
        check();
      }
  
    // Make container resizable
    function makeResizable(container) {
        if (container.dataset.resizable === 'true') {
            return; // Already made resizable
        }
  
        container.dataset.resizable = 'true';
        container.style.resize = 'vertical';
        container.style.maxHeight = 'unset';
        container.style.height="140px";
        container.style.overflow = 'auto';
  
        console.log('Blue Marble container #bm-9 is now resizable!');
    }
  
    // Create paint request picker button
    function createPaintRequestButton() {
        const buttonContainer = document.querySelector('#bm-6 > div');
        if (!buttonContainer || document.querySelector('#adpl-paint-request-btn')) {
            return;
        }
  
        const paintRequestBtn = document.createElement('button');
        paintRequestBtn.id = 'adpl-paint-request-btn';
        paintRequestBtn.className = 'bm-D';
        paintRequestBtn.title = 'Paint Request Picker';
        paintRequestBtn.innerHTML = '<img src="https://adpl.sblzd.cn/icons/adpl-icon.png" style="width: 16px; height: 16px;margin-left: 3px;">';
        paintRequestBtn.style.marginLeft = '4px';
        
        paintRequestBtn.addEventListener('click', showPaintRequestDialog);
        buttonContainer.appendChild(paintRequestBtn);
    }
  
    // Show paint request dialog
    function showPaintRequestDialog() {
        // Remove existing dialog if any
        const existingDialog = document.querySelector('#adpl-paint-request-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
  
        // Create dialog
        const dialog = document.createElement('div');
        dialog.id = 'adpl-paint-request-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-height: 80vh;
            background: #2a2a2a;
            border: 2px solid #4a4a4a;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            color: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
  
        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #4a4a4a;
            cursor: move;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Paint Request Picker';
        title.style.margin = '0';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.addEventListener('click', () => dialog.remove());
        
        header.appendChild(title);
        header.appendChild(closeBtn);
  
        // Create content area
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 16px;
            max-height: 60vh;
            overflow-y: auto;
        `;
  
        // Loading state
        content.innerHTML = '<div style="text-align: center; padding: 20px;">Loading paint requests...</div>';
  
        // Add to page
        dialog.appendChild(header);
        dialog.appendChild(content);
        document.body.appendChild(dialog);
  
        // Make dialog draggable
        makeDraggable(dialog, header);
  
        // Fetch paint requests
        fetchPaintRequests(content);
    }
  
      function makeDraggable(elmnt) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      if (document.getElementById(elmnt.id + "header")) {
          // if present, the header is where you move the DIV from:
          document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
      } else {
          // otherwise, move the DIV from anywhere inside the DIV:
          elmnt.onmousedown = dragMouseDown;
      }
  
      function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
      }
  
      function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
          elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }
  
      function closeDragElement() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
      }
      }
      
function convertCoordinatesToLatLng(tlX, tlY, pxX, pxY, zoom) {
    const TILE_SIZE = 1000;
    const totalTiles = Math.pow(2, zoom);
    const totalPixels = totalTiles * TILE_SIZE;

    // 1. Calculate the total pixel position from the world's top-left corner (0,0)
    const totalPxX = (tlX * TILE_SIZE) + pxX;
    const totalPxY = (tlY * TILE_SIZE) + pxY;

    // 2. Normalize the pixel coordinates to a value between 0 and 1
    const normalizedX = totalPxX / totalPixels;
    const normalizedY = totalPxY / totalPixels;

    // 3. Convert normalized coordinates back to lat/lng using inverse Mercator projection
    // Longitude is a linear mapping from normalized X
    const lng = (normalizedX * 360) - 180;

    // Latitude requires the inverse Mercator projection formula
    // The formula is derived from: y_norm = 0.5 - atanh(sin(lat_rad)) / (2 * PI)
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * normalizedY)));
    const lat = latRad * (180 / Math.PI);

    return { lat, lng };
}
  
    // Fetch paint requests from API
    async function fetchPaintRequests(content) {
        try {
            const response = await fetch('https://adpl.sblzd.cn/api/paint-requests');
            const data = await response.json();
            
            if (data.success && data.data) {
                displayPaintRequests(content, data.data);
            } else {
                content.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">Failed to load paint requests</div>';
            }
        } catch (error) {
            console.error('Error fetching paint requests:', error);
            content.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">Error loading paint requests</div>';
        }
    }
  
    // Display paint requests as cards
    function displayPaintRequests(content, requests) {
        if (requests.length === 0) {
            content.innerHTML = '<div style="text-align: center; padding: 20px;">No paint requests found</div>';
            return;
        }
  
        const requestsContainer = document.createElement('div');
        requestsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        `;
  
        requests.forEach(request => {
            const card = createRequestCard(request);
            requestsContainer.appendChild(card);
        });
  
        content.innerHTML = '';
        content.appendChild(requestsContainer);
    }
  
    // Create individual request card
    function createRequestCard(request) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: #3a3a3a;
            border: 1px solid #4a4a4a;
            border-radius: 6px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
  
        card.addEventListener('mouseenter', () => {
            card.style.background = '#4a4a4a';
            card.style.borderColor = '#5a5a5a';
        });
  
        card.addEventListener('mouseleave', () => {
            card.style.background = '#3a3a3a';
            card.style.borderColor = '#4a4a4a';
        });
  
        card.addEventListener('click', () => applyRequestToBlueMarble(request));
  
        // Image preview
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            text-align: center;
            margin-bottom: 12px;
        `;
        
        const img = document.createElement('img');
        img.id = request._id;
        img.src = request.image.url;
        img.style.cssText = `
            max-width: 100%;
            max-height: 120px;
            border-radius: 4px;
            border: 1px solid #5a5a5a;
        `;
        imgContainer.appendChild(img);
  
        // Request info
        const info = document.createElement('div');
        info.style.cssText = `
            font-size: 12px;
            line-height: 1.4;
        `;
  
        const title = document.createElement('div');
        title.textContent = request.title || 'Untitled';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 4px;
            color: #ffffff;
        `;
  
        const owner = document.createElement('div');
        owner.textContent = `By: ${request.owner.name}`;
        owner.style.cssText = `
            color: #cccccc;
            margin-bottom: 4px;
        `;
  
        const coordinates = document.createElement('div');
        coordinates.textContent = `TlX: ${request.coordinates.TlX}, TlY: ${request.coordinates.TlY}, Px: ${request.coordinates.Px}, Py: ${request.coordinates.Py}`;
        coordinates.style.cssText = `
            color: #aaaaaa;
            font-family: monospace;
            font-size: 11px;
            margin-bottom: 4px;
        `;
  
        info.appendChild(title);
        info.appendChild(owner);
        info.appendChild(coordinates);
  
        card.appendChild(imgContainer);
        card.appendChild(info);
  
        return card;
    }
  
    // Apply request to Blue Marble
    async function applyRequestToBlueMarble(request) {
        try {
            // Close the dialog
            const dialog = document.querySelector('#adpl-paint-request-dialog');
            if (dialog) {
                dialog.remove();
            }
  
            // Fill in coordinates
            const tlXInput = document.querySelector('#bm-v');
            const tlYInput = document.querySelector('#bm-w');
            const pxInput = document.querySelector('#bm-x');
            const pyInput = document.querySelector('#bm-y');
  
            if (tlXInput && tlYInput && pxInput && pyInput) {
                tlXInput.value = request.coordinates.TlX;
                tlYInput.value = request.coordinates.TlY;
                pxInput.value = request.coordinates.Px;
                pyInput.value = request.coordinates.Py;
  
                // Trigger input events to ensure Blue Marble recognizes the changes
                [tlXInput, tlYInput, pxInput, pyInput].forEach(input => {
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
  
            // Click Enable button
            const enableBtn = document.querySelector('#bm-s');
            if (enableBtn) {
                enableBtn.click();
            }
  
            // Upload the image
            await uploadImageToBlueMarble(request.image.url);
  
            // Wait a bit then click Create button
            setTimeout(() => {
                const createBtn = document.querySelector('#bm-r');
                if (createBtn) {
                    createBtn.click();
                }
                const {lng, lat} = convertCoordinatesToLatLng(
                    request.coordinates.TlX, request.coordinates.TlY, 
                    Math.round(request.coordinates.Px + request.image.width/2), 
                    Math.round(request.coordinates.Py + request.image.height/2),
                    11);
                // fly to the position via hooked map instance
                if(usw._map) {
                    usw._map.flyTo({
                        center: {
                            lat, lng
                        },
                        zoom: 14,
                        offset: [0, 0]
                    })
                }
            }, 500);
  
  
        } catch (error) {
            console.error('Error applying request to Blue Marble:', error);
        }
    }

    function getImageBlob(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "blob"; // ensure blob response

            xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response); // xhr.response is a Blob
            } else {
                reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
            };

            xhr.onerror = () => reject(new Error("Network error"));
            xhr.send();
        });
    }
  
    // Upload image to Blue Marble
    async function uploadImageToBlueMarble(imageUrl) {
        try {
            console.log('1111' + imageUrl);
            // Fetch the image and convert to blob
            const blob = await getImageBlob(imageUrl);
  
            // Create a File object
            const file = new File([blob], 'paint-request.png', { type: 'image/png' });
            console.log(file);
  
            // Get the file input
            const fileInput = document.querySelector('#bm-a');
            if (!fileInput) {
                console.error('File input not found');
                return;
            }
  
            // Create a DataTransfer object and set the file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
  
            // Set the file input's files
            fileInput.files = dataTransfer.files;
            console.log('2222');
  
            // Trigger change event
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  
            console.log('Image uploaded to Blue Marble successfully');
  
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }
  
    // Initialize when page loads
    waitForElement('#bm-9', makeResizable);
    waitForElement('#bm-6 > div', createPaintRequestButton);
  
    // Also check for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const container = node.querySelector('#bm-9') || (node.id === 'bm-9' ? node : null);
                    if (container) {
                        makeResizable(container);
                    }
  
                    const buttonContainer = node.querySelector('#bm-6 > div') || (node.id === 'bm-6' ? node : null);
                    if (buttonContainer) {
                        createPaintRequestButton();
                    }
                }
            });
        });
    });
  
    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        observer.observe(document.body, { childList: true, subtree: true });
    }
  })();
  
  