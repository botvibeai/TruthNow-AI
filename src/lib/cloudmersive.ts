export const callCloudmersive = async (endpoint: string, payload: any) => {
  const response = await fetch('/api/cloudmersive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ endpoint, payload })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to call Cloudmersive API');
  }

  return response.json();
};
