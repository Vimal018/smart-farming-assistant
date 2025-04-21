import axios from "axios";

// Updated to use the correct Gradio API structure
const HF_API_URL = "https://vimal18-crop-disease-detection.hf.space";

async function predictImage(imageData: string) {
  try {
    console.log("Starting prediction request...");
    
    // Extract base64 data without MIME prefix if present
    const base64WithoutPrefix = imageData.includes('base64,')
      ? imageData.split('base64,')[1]
      : imageData;
    
    // Step 1: Make the POST request with the proper Gradio API format
    // Based on the documentation, we should use /call/predict not /gradio_api/call/predict
    const postResponse = await axios.post(
      `${HF_API_URL}/predict`,  // Use the proper endpoint path
      {
        data: [
          // Format according to Gradio API docs for file input
          { 
            "data": base64WithoutPrefix,
            "mime_type": "image/jpeg"
          }
        ]
      },
      {
        headers: { 
          "Content-Type": "application/json" 
        },
        timeout: 30000 // 30 second timeout for initial request
      }
    );
    
    console.log("POST response status:", postResponse.status);
    
    if (!postResponse.data || !postResponse.data.event_id) {
      throw new Error("No event ID received from Hugging Face API.");
    }
    
    const eventId = postResponse.data.event_id;
    console.log("Event ID:", eventId);
    
    // Step 2: Poll for the result with the correct GET endpoint
    const getUrl = `${HF_API_URL}/predict/${eventId}`;
    
    let attempts = 0;
    const maxAttempts = 15;  // Increased attempts
    const pollingInterval = 3000;  
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
      
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      
      try {
        const getResponse = await axios.get(getUrl, { 
          responseType: 'text',
          timeout: 10000 // 10 second timeout for polling requests
        });
        
        console.log("GET response status:", getResponse.status);
        
        if (getResponse.data && getResponse.data.length > 0) {
          // Parse SSE format response
          const lines = getResponse.data.split('\n');
          let lastEventType = '';
          let lastDataContent = '';
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('event:')) {
              lastEventType = line.substring(7).trim();
            } else if (line.startsWith('data:')) {
              lastDataContent = line.substring(5).trim();
              
              // If we have a complete event, check if it's done
              if (lastEventType === 'complete' && lastDataContent && lastDataContent !== 'null') {
                try {
                  return JSON.parse(lastDataContent);
                } catch (e) {
                  console.log("Error parsing JSON:", e);
                  return lastDataContent;
                }
              }
            }
          }
          
          // If we found data but it's still generating, continue polling
          if (lastEventType === 'generating') {
            console.log("Still generating, continuing to poll...");
          }
        }
        
        console.log(`No valid data yet, retrying... (${attempts}/${maxAttempts})`);
      } catch (pollError) {
        console.log(`Polling error (attempt ${attempts}/${maxAttempts}):`, pollError.message);
        // Continue to next attempt despite errors
      }
    }
    
    throw new Error(`Failed to get prediction after ${maxAttempts} attempts`);
  } catch (error) {
    console.error("Error in prediction:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    
    return { error: "Failed to retrieve prediction.", details: error.message };
  }
}

// Alternative implementation using URL for file input
async function predictImageFromUrl(imageUrl: string) {
  try {
    console.log("Starting prediction request with image URL...");
    
    // Step 1: Make the POST request with the proper Gradio API format for URL
    const postResponse = await axios.post(
      `${HF_API_URL}/predict`,
      {
        data: [
          {
            path: imageUrl
          }
        ]
      },
      {
        headers: { 
          "Content-Type": "application/json" 
        },
        timeout: 30000
      }
    );
    
    console.log("POST response status:", postResponse.status);
    
    if (!postResponse.data || !postResponse.data.event_id) {
      throw new Error("No event ID received from Hugging Face API.");
    }
    
    const eventId = postResponse.data.event_id;
    console.log("Event ID:", eventId);
    
    // Step 2: Poll for the result with the correct GET endpoint
    return await pollForResults(`${HF_API_URL}/predict/${eventId}`);
  } catch (error) {
    console.error("Error in prediction:", error);
    return { error: "Failed to retrieve prediction.", details: error.message };
  }
}

// Helper function to poll for results
async function pollForResults(getUrl: string) {
  let attempts = 0;
  const maxAttempts = 15;
  const pollingInterval = 3000;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
    
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    
    try {
      const getResponse = await axios.get(getUrl, { 
        responseType: 'text',
        timeout: 10000
      });
      
      console.log("GET response status:", getResponse.status);
      
      if (getResponse.data && getResponse.data.length > 0) {
        const lines = getResponse.data.split('\n');
        let lastEventType = '';
        let lastDataContent = '';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('event:')) {
            lastEventType = line.substring(7).trim();
          } else if (line.startsWith('data:')) {
            lastDataContent = line.substring(5).trim();
            
            if (lastEventType === 'complete' && lastDataContent && lastDataContent !== 'null') {
              try {
                return JSON.parse(lastDataContent);
              } catch (e) {
                console.log("Error parsing JSON:", e);
                return lastDataContent;
              }
            }
          }
        }
      }
      
      console.log(`No valid data yet, retrying... (${attempts}/${maxAttempts})`);
    } catch (pollError) {
      console.log(`Polling error (attempt ${attempts}/${maxAttempts}):`, pollError.message);
    }
  }
  
  throw new Error(`Failed to get prediction after ${maxAttempts} attempts`);
}

export { predictImage, predictImageFromUrl };