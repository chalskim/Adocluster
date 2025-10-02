const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// 모든 트리노드 조회 (계층 구조로)
router.get('/', async (req, res) => {
  try {
    const query = `
      WITH RECURSIVE tree AS (
        SELECT id, name, parent_id, position, created_at, updated_at, 0 as level
        FROM tree_nodes 
        WHERE parent_id IS NULL
        UNION ALL
        SELECT tn.id, tn.name, tn.parent_id, tn.position, tn.created_at, tn.updated_at, t.level + 1
        FROM tree_nodes tn
        JOIN tree t ON tn.parent_id = t.id
      )
      SELECT * FROM tree ORDER BY level, parent_id, position, id;
    `;
    
    const result = await pool.query(query);
    
    // 계층 구조로 변환
    const buildTree = (nodes, parentId = null) => {
      return nodes
        .filter(node => node.parent_id === parentId)
        .sort((a, b) => a.position - b.position) // position 기준으로 정렬
        .map(node => ({
          ...node,
          children: buildTree(nodes, node.id)
        }));
    };
    
    const treeStructure = buildTree(result.rows);
    res.json(treeStructure);
  } catch (error) {
    console.error('트리노드 조회 오류:', error);
    res.status(500).json({ error: '트리노드 조회에 실패했습니다.' });
  }
});

// 특정 트리노드 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM tree_nodes WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '트리노드를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('트리노드 조회 오류:', error);
    res.status(500).json({ error: '트리노드 조회에 실패했습니다.' });
  }
});

// 새 트리노드 생성
router.post('/', async (req, res) => {
  try {
    const { name, parent_id, position = 0 } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '노드 이름은 필수입니다.' });
    }
    
    // 같은 부모를 가진 노드들의 position 값을 업데이트하여 새 노드를 위한 공간 만들기
    if (position !== undefined) {
      const updatePositionQuery = `
        UPDATE tree_nodes 
        SET position = position + 1 
        WHERE parent_id IS NOT DISTINCT FROM $1 AND position >= $2
      `;
      await pool.query(updatePositionQuery, [parent_id || null, position]);
    }
    
    const query = `
      INSERT INTO tree_nodes (name, parent_id, position) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, parent_id || null, position]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('트리노드 생성 오류:', error);
    res.status(500).json({ error: '트리노드 생성에 실패했습니다.' });
  }
});

// 트리노드 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, position } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '노드 이름은 필수입니다.' });
    }
    
    // position이 변경된 경우, 같은 부모를 가진 다른 노드들의 position 업데이트
    if (position !== undefined) {
      // 현재 노드의 정보를 가져옴
      const currentQuery = 'SELECT parent_id, position FROM tree_nodes WHERE id = $1';
      const currentResult = await pool.query(currentQuery, [id]);
      
      if (currentResult.rows.length > 0) {
        const currentNode = currentResult.rows[0];
        const currentParentId = currentNode.parent_id;
        const currentPosition = currentNode.position;
        const newParentId = parent_id !== undefined ? parent_id : currentParentId;
        const newPosition = position;
        
        // 부모가 변경되었거나 position이 변경된 경우
        if (currentParentId !== newParentId || currentPosition !== newPosition) {
          // 기존 위치의 노드들 position 조정
          const updateOldPositionQuery = `
            UPDATE tree_nodes 
            SET position = position - 1 
            WHERE parent_id IS NOT DISTINCT FROM $1 AND position > $2
          `;
          await pool.query(updateOldPositionQuery, [currentParentId, currentPosition]);
          
          // 새 위치의 노드들 position 조정
          const updateNewPositionQuery = `
            UPDATE tree_nodes 
            SET position = position + 1 
            WHERE parent_id IS NOT DISTINCT FROM $1 AND position >= $2
          `;
          await pool.query(updateNewPositionQuery, [newParentId, newPosition]);
        }
      }
    }
    
    const query = `
      UPDATE tree_nodes 
      SET name = $1, parent_id = $2, position = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, parent_id || null, position !== undefined ? position : null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '트리노드를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('트리노드 수정 오류:', error);
    res.status(500).json({ error: '트리노드 수정에 실패했습니다.' });
  }
});

// 트리노드 삭제 (자식 노드도 함께 삭제)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 삭제할 노드 확인
    const checkQuery = 'SELECT parent_id, position FROM tree_nodes WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: '트리노드를 찾을 수 없습니다.' });
    }
    
    const { parent_id, position } = checkResult.rows[0];
    
    // CASCADE로 자식 노드들도 함께 삭제됨
    const deleteQuery = 'DELETE FROM tree_nodes WHERE id = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [id]);
    
    // 같은 부모를 가진 다른 노드들의 position 업데이트
    const updatePositionQuery = `
      UPDATE tree_nodes 
      SET position = position - 1 
      WHERE parent_id IS NOT DISTINCT FROM $1 AND position > $2
    `;
    await pool.query(updatePositionQuery, [parent_id, position]);
    
    res.json({ 
      message: '트리노드가 성공적으로 삭제되었습니다.',
      deletedNode: result.rows[0]
    });
  } catch (error) {
    console.error('트리노드 삭제 오류:', error);
    res.status(500).json({ error: '트리노드 삭제에 실패했습니다.' });
  }
});

// 노드 이동 (부모 변경 및 위치 변경)
router.patch('/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_parent_id, position = 0 } = req.body;
    
    // 순환 참조 방지 검사
    if (new_parent_id) {
      const checkCircularQuery = `
        WITH RECURSIVE ancestors AS (
          SELECT id, parent_id FROM tree_nodes WHERE id = $1
          UNION ALL
          SELECT tn.id, tn.parent_id 
          FROM tree_nodes tn
          JOIN ancestors a ON tn.id = a.parent_id
        )
        SELECT COUNT(*) as count FROM ancestors WHERE id = $2
      `;
      
      const circularCheck = await pool.query(checkCircularQuery, [new_parent_id, id]);
      if (circularCheck.rows[0].count > 0) {
        return res.status(400).json({ error: '순환 참조가 발생할 수 있습니다.' });
      }
    }
    
    // 현재 노드의 정보를 가져옴
    const currentQuery = 'SELECT parent_id, position FROM tree_nodes WHERE id = $1';
    const currentResult = await pool.query(currentQuery, [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: '트리노드를 찾을 수 없습니다.' });
    }
    
    const currentNode = currentResult.rows[0];
    const currentParentId = currentNode.parent_id;
    const currentPosition = currentNode.position;
    const newParentId = new_parent_id !== undefined ? new_parent_id : currentParentId;
    
    // 부모가 변경되었거나 position이 변경된 경우
    if (currentParentId !== newParentId || currentPosition !== position) {
      // 기존 위치의 노드들 position 조정
      const updateOldPositionQuery = `
        UPDATE tree_nodes 
        SET position = position - 1 
        WHERE parent_id IS NOT DISTINCT FROM $1 AND position > $2
      `;
      await pool.query(updateOldPositionQuery, [currentParentId, currentPosition]);
      
      // 새 위치의 노드들 position 조정
      const updateNewPositionQuery = `
        UPDATE tree_nodes 
        SET position = position + 1 
        WHERE parent_id IS NOT DISTINCT FROM $1 AND position >= $2
      `;
      await pool.query(updateNewPositionQuery, [newParentId, position]);
    }
    
    const query = `
      UPDATE tree_nodes 
      SET parent_id = $1, position = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 
      RETURNING *
    `;
    
    const result = await pool.query(query, [newParentId || null, position, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '트리노드를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('트리노드 이동 오류:', error);
    res.status(500).json({ error: '트리노드 이동에 실패했습니다.' });
  }
});

// 노드 위치 변경 (같은 부모 내에서 위치만 변경)
router.patch('/:id/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_position } = req.body;
    
    if (new_position === undefined) {
      return res.status(400).json({ error: '새로운 위치(new_position)가 필요합니다.' });
    }
    
    // 현재 노드의 정보를 가져옴
    const currentQuery = 'SELECT parent_id, position FROM tree_nodes WHERE id = $1';
    const currentResult = await pool.query(currentQuery, [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: '트리노드를 찾을 수 없습니다.' });
    }
    
    const currentNode = currentResult.rows[0];
    const parentId = currentNode.parent_id;
    const currentPosition = currentNode.position;
    const newPosition = new_position;
    
    // 같은 부모를 가진 노드들의 position 업데이트
    if (currentPosition !== newPosition) {
      if (newPosition > currentPosition) {
        // 아래로 이동하는 경우
        const updateQuery = `
          UPDATE tree_nodes 
          SET position = position - 1 
          WHERE parent_id IS NOT DISTINCT FROM $1 AND position > $2 AND position <= $3
        `;
        await pool.query(updateQuery, [parentId, currentPosition, newPosition]);
      } else {
        // 위로 이동하는 경우
        const updateQuery = `
          UPDATE tree_nodes 
          SET position = position + 1 
          WHERE parent_id IS NOT DISTINCT FROM $1 AND position >= $2 AND position < $3
        `;
        await pool.query(updateQuery, [parentId, newPosition, currentPosition]);
      }
      
      // 현재 노드의 position 업데이트
      const updateCurrentQuery = `
        UPDATE tree_nodes 
        SET position = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      await pool.query(updateCurrentQuery, [newPosition, id]);
    }
    
    // 업데이트된 노드 정보 반환
    const updatedQuery = 'SELECT * FROM tree_nodes WHERE id = $1';
    const updatedResult = await pool.query(updatedQuery, [id]);
    
    res.json(updatedResult.rows[0]);
  } catch (error) {
    console.error('트리노드 위치 변경 오류:', error);
    res.status(500).json({ error: '트리노드 위치 변경에 실패했습니다.' });
  }
});

module.exports = router;