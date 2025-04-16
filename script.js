// script.js: Handles meme generation functionality

document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const topTextInput = document.getElementById('top-text');
    const bottomTextInput = document.getElementById('bottom-text');
    const templateSelect = document.getElementById('template-select');

    if (!generateBtn || !topTextInput || !bottomTextInput || !templateSelect) {
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

    async function generateMeme() {
        const topText = topTextInput.value.trim();
        const bottomText = bottomTextInput.value.trim();
        const template_id = templateSelect.value;

        if (!topText || !bottomText) {
            memeContainer.innerHTML = '<span style="color:red;">Please enter both top and bottom text.</span>';
            return;
        }

        // Remove any previous meme images or messages
        memeContainer.innerHTML = '';

        const username = 'MarioChicas';
        const password = 'Titusb@y2016';

        const params = new URLSearchParams();
        params.append('template_id', template_id);
        params.append('username', username);
        params.append('password', password);
        params.append('text0', topText);
        params.append('text1', bottomText);

        memeContainer.innerHTML = 'Generating meme...';

        try {
            const response = await fetch('https://api.imgflip.com/caption_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            const data = await response.json();
            if (data.success) {
                memeContainer.innerHTML = `<img src="${data.data.url}" alt="Generated Meme" style="max-width:100%;margin-top:20px;">`;
            } else {
                memeContainer.innerHTML = `<span style="color:red;">Error: ${data.error_message || 'Failed to generate meme.'}</span>`;
            }
        } catch (error) {
            memeContainer.innerHTML = '<span style="color:red;">Error: Could not reach Imgflip API.</span>';
        }
    }

    generateBtn.addEventListener('click', generateMeme);
});
