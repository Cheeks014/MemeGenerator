// script.js: Handles meme generation functionality

document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const topTextInput = document.getElementById('top-text');
    const bottomTextInput = document.getElementById('bottom-text');
    const templateSelects = [
        document.getElementById('template-select'),
        document.getElementById('template-select-2'),
        document.getElementById('template-select-3')
    ];
    const customImageInput = document.getElementById('custom-image');

    if (!generateBtn || !topTextInput || !bottomTextInput || !customImageInput) {
        console.error('Required elements not found in the DOM.');
        return;
    }

    // Create or select meme image container
    let memeContainer = document.getElementById('meme-container');
    if (!memeContainer) {
        memeContainer = document.createElement('div');
        memeContainer.id = 'meme-container';
        generateBtn.insertAdjacentElement('afterend', memeContainer);
    }

    function drawMemeOnCanvas(image, topText, bottomText) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        // Text settings with font fallback
        ctx.font = `${Math.floor(canvas.height/10)}px Impact, Arial, sans-serif`;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Helper for drawing text with max width
        function drawText(text, y, baseline) {
            ctx.save();
            ctx.textBaseline = baseline;
            ctx.translate(canvas.width / 2, y);
            // Shrink font if text is too wide
            let fontSize = Math.floor(canvas.height/10);
            while (ctx.measureText(text).width > canvas.width - 40 && fontSize > 10) {
                fontSize -= 2;
                ctx.font = `${fontSize}px Impact, Arial, sans-serif`;
            }
            ctx.strokeText(text, 0, 0);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }

        // Draw top text
        drawText(topText, 10, 'top');
        // Draw bottom text
        drawText(bottomText, canvas.height - 10, 'bottom');

        return canvas.toDataURL('image/png');
    }

    async function generateMeme() {
        const topText = topTextInput.value.trim();
        const bottomText = bottomTextInput.value.trim();
        let template_id = null;

        // Find the selected template from any of the template selects
        for (const select of templateSelects) {
            if (select && select.value) {
                template_id = select.value;
                break;
            }
        }

        const file = customImageInput.files[0];

        if (!topText || !bottomText) {
            memeContainer.innerHTML = '<span style="color:red;">Please enter both top and bottom text.</span>';
            return;
        }

        // Warn if text is very long
        if (topText.length > 80 || bottomText.length > 80) {
            memeContainer.innerHTML = '<span style="color:orange;">Warning: Your meme text is quite long and may not fit well.</span>';
        }

        memeContainer.innerHTML = '';

        // If user uploaded an image, use canvas to draw meme
        if (file) {
            if (!file.type.startsWith('image/')) {
                memeContainer.innerHTML = '<span style="color:red;">Please upload a valid image file.</span>';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const dataUrl = drawMemeOnCanvas(img, topText, bottomText);
                    memeContainer.innerHTML = `<img src="${dataUrl}" alt="Custom Meme: ${topText} | ${bottomText}" style="max-width:100%;margin-top:20px;">`;
                };
                img.onerror = function() {
                    memeContainer.innerHTML = '<span style="color:red;">Error loading the image file.</span>';
                };
                img.src = e.target.result;
            };
            reader.onerror = function() {
                memeContainer.innerHTML = '<span style="color:red;">Error reading the image file.</span>';
            };
            reader.readAsDataURL(file);
            return;
        }

        // Otherwise, use Netlify function to generate meme
        try {
            const response = await fetch('/.netlify/functions/generate-meme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: template_id, // Use the selected template ID from the dropdown
                    text0: topText,
                    text1: bottomText
                })
            });
            const data = await response.json();
            if (data.success) {
                memeContainer.innerHTML = `<img src="${data.data.url}" alt="Generated Meme: ${topText} | ${bottomText}" style="max-width:100%;margin-top:20px;">`;
            } else {
                memeContainer.innerHTML = `<span style="color:red;">Error: ${data.error_message || 'Failed to generate meme.'}</span>`;
            }
        } catch (error) {
            memeContainer.innerHTML = '<span style="color:red;">Error: Could not reach meme generator function.</span>';
        }
    }

    generateBtn.addEventListener('click', generateMeme);
});
