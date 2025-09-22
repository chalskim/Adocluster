// Resource Service for managing library resources
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ResourceItem {
  itemID: string;
  libID: string;
  itemType: 'file' | 'image' | 'table' | 'website' | 'latex' | 'video' | 'audio' | 'quote';
  itemTitle: string;
  itemAuthor?: string;
  itemPublisher?: string;
  itemYear?: string;
  itemURL?: string;
  itemDOI?: string;
  itemISBN?: string;
  itemISSN?: string;
  itemVolume?: string;
  itemIssue?: string;
  itemPages?: string;
  itemAbstract?: string;
  itemKeywords?: string;
  itemNotes?: string;
  content?: any;
  itemCreated: string;
  itemUpdated: string;
}

// Get authentication token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const headers = {
    ...defaultHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const config: RequestInit = {
    ...options,
    headers,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch all resources
export const fetchResources = async (): Promise<ResourceItem[]> => {
  try {
    const data = await apiCall('/api/resources');
    return data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Create a new resource
export const createResource = async (resourceData: Omit<ResourceItem, 'itemID' | 'itemCreated' | 'itemUpdated'>): Promise<ResourceItem> => {
  try {
    // Map frontend field names to backend field names
    const backendData = {
      item_type: resourceData.itemType,
      title: resourceData.itemTitle,
      url: resourceData.itemURL,
      content: JSON.stringify({
        author: resourceData.itemAuthor,
        publisher: resourceData.itemPublisher,
        year: resourceData.itemYear,
        doi: resourceData.itemDOI,
        isbn: resourceData.itemISBN,
        issn: resourceData.itemISSN,
        volume: resourceData.itemVolume,
        issue: resourceData.itemIssue,
        pages: resourceData.itemPages,
        abstract: resourceData.itemAbstract,
        keywords: resourceData.itemKeywords,
        notes: resourceData.itemNotes
      })
    };
    
    const data = await apiCall('/api/resources', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    
    // Map backend response to frontend field names
    return {
      itemID: data.item_id,
      libID: data.mlid,
      itemType: data.item_type,
      itemTitle: data.title,
      itemURL: data.url,
      itemAuthor: data.content?.author,
      itemPublisher: data.content?.publisher,
      itemYear: data.content?.year,
      itemDOI: data.content?.doi,
      itemISBN: data.content?.isbn,
      itemISSN: data.content?.issn,
      itemVolume: data.content?.volume,
      itemIssue: data.content?.issue,
      itemPages: data.content?.pages,
      itemAbstract: data.content?.abstract,
      itemKeywords: data.content?.keywords,
      itemNotes: data.content?.notes,
      content: data.content,
      itemCreated: data.created_at,
      itemUpdated: data.updated_at
    };
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

// Update an existing resource
export const updateResource = async (id: string, resourceData: Partial<Omit<ResourceItem, 'itemID' | 'itemCreated' | 'itemUpdated'>>): Promise<ResourceItem> => {
  try {
    // Map frontend field names to backend field names
    const backendData: any = {};
    
    if (resourceData.itemType !== undefined) backendData.item_type = resourceData.itemType;
    if (resourceData.itemTitle !== undefined) backendData.title = resourceData.itemTitle;
    if (resourceData.itemURL !== undefined) backendData.url = resourceData.itemURL;
    
    if (resourceData.itemAuthor !== undefined || 
        resourceData.itemPublisher !== undefined || 
        resourceData.itemYear !== undefined || 
        resourceData.itemDOI !== undefined || 
        resourceData.itemISBN !== undefined || 
        resourceData.itemISSN !== undefined || 
        resourceData.itemVolume !== undefined || 
        resourceData.itemIssue !== undefined || 
        resourceData.itemPages !== undefined || 
        resourceData.itemAbstract !== undefined || 
        resourceData.itemKeywords !== undefined || 
        resourceData.itemNotes !== undefined) {
      
      // Get existing content if any
      let content: any = {};
      try {
        // This would need to fetch the existing resource to get current content
        // For now, we'll create a new content object
        content = {
          author: resourceData.itemAuthor,
          publisher: resourceData.itemPublisher,
          year: resourceData.itemYear,
          doi: resourceData.itemDOI,
          isbn: resourceData.itemISBN,
          issn: resourceData.itemISSN,
          volume: resourceData.itemVolume,
          issue: resourceData.itemIssue,
          pages: resourceData.itemPages,
          abstract: resourceData.itemAbstract,
          keywords: resourceData.itemKeywords,
          notes: resourceData.itemNotes
        };
      } catch (e) {
        content = {};
      }
      
      backendData.content = JSON.stringify(content);
    }
    
    const data = await apiCall(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    
    // Map backend response to frontend field names
    return {
      itemID: data.item_id,
      libID: data.mlid,
      itemType: data.item_type,
      itemTitle: data.title,
      itemURL: data.url,
      itemAuthor: data.content?.author,
      itemPublisher: data.content?.publisher,
      itemYear: data.content?.year,
      itemDOI: data.content?.doi,
      itemISBN: data.content?.isbn,
      itemISSN: data.content?.issn,
      itemVolume: data.content?.volume,
      itemIssue: data.content?.issue,
      itemPages: data.content?.pages,
      itemAbstract: data.content?.abstract,
      itemKeywords: data.content?.keywords,
      itemNotes: data.content?.notes,
      content: data.content,
      itemCreated: data.created_at,
      itemUpdated: data.updated_at
    };
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

// Delete a resource
export const deleteResource = async (id: string): Promise<void> => {
  try {
    await apiCall(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

// Download a resource
export const downloadResource = async (id: string): Promise<void> => {
  try {
    // In a real implementation, this would call the backend API to download the resource
    // For now, we'll simulate the download
    console.log(`Downloading resource with ID: ${id}`);
    
    // In a real implementation, this would trigger a file download
    alert('자료 다운로드가 시작됩니다.');
    
    return;
  } catch (error) {
    console.error('Error downloading resource:', error);
    throw error;
  }
};