export const SendFcmToBackend = async (fcm_id, deviceInfo) => {
  const userData = {
    fcm_id,
    ...deviceInfo,
  };

  console.log('Sending FCM token:', userData);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  };
  try {
    const response = await fetch('https://pratibhaapp.eenadu.net/pratibhamobileapp/pushnotifications/app_device_details.php', options);
    const responseData = await response.text();
  
    console.log('Response status:', response.status); // 🔍 Print HTTP status
    console.log('Response data:', responseData);       // 🔍 See what backend returned
  
    if (response.ok) {
      console.log('✅ userData sent successfully');
      return { success: 'userData sent successfully' };
    } else {
      console.log('❌ Server responded with error');
      return { error: `Status ${response.status}`, responseData };
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return { error: 'Something went wrong' };
  }
  
  
};
