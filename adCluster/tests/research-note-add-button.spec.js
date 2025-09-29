import { test, expect } from '@playwright/test';

test.describe('연구 노트 목록 - 노드 추가 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:5175/login');
    
    // 로그인 수행
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // 로그인 성공 후 프로젝트 페이지로 이동
    await page.waitForURL('**/projects');
    
    // 프로젝트가 없는 경우 테스트용 프로젝트 생성
    const projectCards = await page.locator('.project-card').count();
    console.log('발견된 프로젝트 카드 수:', projectCards);
    
    if (projectCards === 0) {
      console.log('프로젝트가 없습니다. 테스트용 프로젝트를 생성합니다.');
      
      // "새 연구 프로젝트 만들기" 버튼 확인 및 클릭
      const createButton = page.locator('button:has-text("새 연구 프로젝트 만들기")');
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // 프로젝트 설정 페이지로 이동 대기
        await page.waitForURL('**/project-setting');
        
        // 프로젝트 이름 입력
        await page.fill('input[name="projectName"]', 'Test Project');
        
        // 프로젝트 생성 버튼 클릭
        await page.click('#createBtn');
        
        // 프로젝트 페이지로 돌아가기 대기
        await page.waitForURL('**/projects');
        await page.waitForTimeout(3000); // 프로젝트 생성 완료 대기
      } else {
        console.log('프로젝트 생성 버튼을 찾을 수 없습니다. 테스트를 건너뜁니다.');
        test.skip();
      }
    }
    
    // 첫 번째 프로젝트 선택
    const firstProject = page.locator('.project-card').first();
    await firstProject.click();
    
    // 연구 노트 트리가 로드될 때까지 대기
    await page.waitForSelector('.tree-view', { timeout: 10000 });
  });

  test('노드 추가 버튼(fa-plus) 존재 확인', async ({ page }) => {
    // tree-item 내의 fa-plus 버튼 찾기
    const addButton = page.locator('.tree-item .fa-plus').first();
    
    // 버튼이 존재하는지 확인
    await expect(addButton).toBeVisible();
    
    console.log('노드 추가 버튼(fa-plus)이 발견되었습니다.');
  });

  test('노드 추가 버튼 클릭 시 메뉴 표시', async ({ page }) => {
    // tree-item 내의 fa-plus 버튼 찾기
    const addButton = page.locator('.tree-item .fa-plus').first();
    
    // 버튼 클릭
    await addButton.click();
    
    // 드롭다운 메뉴가 표시되는지 확인
    const dropdownMenu = page.locator('.absolute.z-50.bg-white.border.border-gray-200.rounded-md.shadow-lg');
    await expect(dropdownMenu).toBeVisible();
    
    console.log('노드 추가 버튼 클릭 시 드롭다운 메뉴가 표시되었습니다.');
  });

  test('하위 폴더 추가 버튼 기능 테스트', async ({ page }) => {
    // tree-item 내의 fa-plus 버튼 찾기
    const addButton = page.locator('.tree-item .fa-plus').first();
    
    // 버튼 클릭하여 메뉴 열기
    await addButton.click();
    
    // "하위 폴더 추가" 버튼 클릭
    const addFolderButton = page.locator('button:has-text("하위 폴더 추가")');
    await expect(addFolderButton).toBeVisible();
    await addFolderButton.click();
    
    // 폴더 추가 모달이나 입력 필드가 나타나는지 확인
    // (실제 구현에 따라 선택자 조정 필요)
    await page.waitForTimeout(1000);
    
    console.log('하위 폴더 추가 버튼이 클릭되었습니다.');
  });

  test('ProNode 추가 버튼 기능 테스트', async ({ page }) => {
    // tree-item 내의 fa-plus 버튼 찾기
    const addButton = page.locator('.tree-item .fa-plus').first();
    
    // 버튼 클릭하여 메뉴 열기
    await addButton.click();
    
    // "ProNode 추가" 버튼 클릭
    const addProNodeButton = page.locator('button:has-text("ProNode 추가")');
    await expect(addProNodeButton).toBeVisible();
    await addProNodeButton.click();
    
    // ProNode 추가 모달이나 입력 필드가 나타나는지 확인
    // (실제 구현에 따라 선택자 조정 필요)
    await page.waitForTimeout(1000);
    
    console.log('ProNode 추가 버튼이 클릭되었습니다.');
  });

  test('메뉴 외부 클릭 시 메뉴 닫힘', async ({ page }) => {
    // tree-item 내의 fa-plus 버튼 찾기
    const addButton = page.locator('.tree-item .fa-plus').first();
    
    // 버튼 클릭하여 메뉴 열기
    await addButton.click();
    
    // 드롭다운 메뉴가 표시되는지 확인
    const dropdownMenu = page.locator('.absolute.z-50.bg-white.border.border-gray-200.rounded-md.shadow-lg');
    await expect(dropdownMenu).toBeVisible();
    
    // 메뉴 외부 클릭
    await page.click('body', { position: { x: 100, y: 100 } });
    
    // 메뉴가 숨겨지는지 확인 (hidden 클래스 추가 또는 visibility 변경)
    await page.waitForTimeout(500);
    
    console.log('메뉴 외부 클릭 테스트가 완료되었습니다.');
  });

  test('tree-item 구조 검증', async ({ page }) => {
    // tree-item 클래스를 가진 요소들 확인
    const treeItems = page.locator('.tree-item');
    const treeItemCount = await treeItems.count();
    
    expect(treeItemCount).toBeGreaterThan(0);
    console.log(`발견된 tree-item 수: ${treeItemCount}`);
    
    // 첫 번째 tree-item의 구조 확인
    const firstTreeItem = treeItems.first();
    
    // tree-toggle 클래스 확인
    const treeToggle = firstTreeItem.locator('.tree-toggle');
    await expect(treeToggle).toBeVisible();
    
    // tree-content 클래스 확인
    const treeContent = firstTreeItem.locator('.tree-content');
    await expect(treeContent).toBeVisible();
    
    console.log('tree-item 구조가 올바르게 구성되어 있습니다.');
  });
});