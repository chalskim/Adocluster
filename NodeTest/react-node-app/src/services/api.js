import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 트리노드 API 함수들
export const treeNodeAPI = {
  // 모든 트리노드 조회
  getAll: async () => {
    const response = await api.get('/tree-nodes');
    return response.data;
  },

  // 특정 트리노드 조회
  getById: async (id) => {
    const response = await api.get(`/tree-nodes/${id}`);
    return response.data;
  },

  // 새 트리노드 생성
  create: async (nodeData) => {
    const response = await api.post('/tree-nodes', nodeData);
    return response.data;
  },

  // 트리노드 수정
  update: async (id, nodeData) => {
    const response = await api.put(`/tree-nodes/${id}`, nodeData);
    return response.data;
  },

  // 트리노드 삭제
  delete: async (id) => {
    const response = await api.delete(`/tree-nodes/${id}`);
    return response.data;
  },

  // 노드 이동 (부모 변경)
  move: async (id, moveData) => {
    const response = await api.patch(`/tree-nodes/${id}/move`, moveData);
    return response.data;
  },

  // 노드 위치 변경 (같은 부모 내에서 위치만 변경)
  reorder: async (id, newPosition) => {
    const response = await api.patch(`/tree-nodes/${id}/reorder`, { new_position: newPosition });
    return response.data;
  },
};

export default api;