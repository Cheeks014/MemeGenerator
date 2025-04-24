const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    const { template_id, text0, text1 } = JSON.parse(event.body);
    const username = process.env.IMGFLIP_USERNAME;
    const password = process.env.IMGFLIP_PASSWORD;

    if (!username || !password) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error_message: 'Server credentials not set.' })
      };
    }

    const params = new URLSearchParams();
    params.append('template_id', template_id);
    params.append('username', username);
    params.append('password', password);
    params.append('text0', text0);
    params.append('text1', text1);

    const response = await fetch('https://api.imgflip.com/caption_image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error_message: error.message })
    };
  }
};
