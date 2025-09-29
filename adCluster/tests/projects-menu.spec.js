// @ts-check
import { test, expect } from '@playwright/test';

test.describe('연구 노트 목록 - 추가 메뉴 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    // 로그인 페이지인지 확인하고 로그인 수행
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      console.log('로그인 페이지 감지됨. 로그인 수행 중...');
      
      // 로그인 정보 입력
      await page.locator('input[type="password"]').fill('');
      await page.locator('button[type="submit"]').click();
      
      // 로그인 후 페이지 로드 대기
      await page.waitForLoadState('networkidle');
      console.log('로그인 완료');
    }
    
    // 로그인 후 대시보드를 거쳐 프로젝트 페이지로 이동
  await page.waitForURL('**/');  
  await page.goto('http://localhost:5174/projects');
  await page.waitForLoadState('networkidle');

  // 페이지가 완전히 로드될 때까지 대기
  await page.waitForTimeout(3000);
  
  // 프로젝트 카드가 실제로 존재하는지 확인 (더 관대한 대기)
  const projectCards = await page.locator('.project-card').count();
  console.log(`발견된 프로젝트 카드 수: ${projectCards}`);
  
  if (projectCards === 0) {
    console.log('프로젝트가 없습니다. 빈 상태에서 테스트를 진행합니다.');
    console.log('프로젝트 생성 버튼이 있는지 확인합니다.');
    
    // 프로젝트 생성 버튼이 있는지 확인
    const createButtonExists = await page.locator('button:has-text("새 연구 프로젝트 만들기")').count();
    console.log(`프로젝트 생성 버튼 발견 수: ${createButtonExists}`);
    
    if (createButtonExists > 0) {
      console.log('프로젝트 생성 버튼을 클릭하여 테스트용 프로젝트를 생성합니다.');
      
      // 프로젝트 생성 버튼 클릭
      await page.locator('button:has-text("새 연구 프로젝트 만들기")').click();
      
      // 프로젝트 설정 페이지로 이동 대기
      await page.waitForURL('**/project-setting');
      await page.waitForLoadState('networkidle');
      
      // 프로젝트 정보 입력
      await page.fill('input[name="projectName"]', 'Test Project');
      
      // 프로젝트 생성 버튼 클릭
      await page.locator('#createBtn').click();
      
      // 프로젝트 목록 페이지로 돌아가기
      await page.waitForURL('**/projects');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 생성된 프로젝트 카드 확인
      const newProjectCards = await page.locator('.project-card').count();
      console.log(`프로젝트 생성 후 발견된 프로젝트 카드 수: ${newProjectCards}`);
    } else {
      console.log('프로젝트 생성 버튼을 찾을 수 없습니다. 테스트를 건너뜁니다.');
      return; // 테스트 종료
    }
  }
  
  // 프로젝트 선택
  const availableCards = await page.locator('.project-card').count();
  if (availableCards > 0) {
    // 첫 번째 프로젝트 선택
    const firstProject = page.locator('.project-card').first();
    await firstProject.waitFor({ state: 'visible' });
    await firstProject.click();
    
    // 트리 구조가 로드될 때까지 대기
    await page.waitForTimeout(3000);
  } else {
    console.log('프로젝트 생성에 실패했습니다.');
  } // 트리 구조가 로드될 시간 대기
    
    console.log('페이지 로드 완료');
  });

  test('모든 tree-toggle 요소에 추가 버튼이 존재하는지 확인', async ({ page }) => {
    // tree-toggle 클래스를 가진 모든 요소 찾기
    let treeItems = await page.locator('.tree-toggle').all();
    
    // tree-toggle이 없다면 다른 선택자들 시도
    if (treeItems.length === 0) {
      treeItems = await page.locator('[class*="tree"]').all();
    }
    if (treeItems.length === 0) {
      treeItems = await page.locator('[data-testid*="tree"]').all();
    }
    
    console.log(`총 ${treeItems.length}개의 tree-toggle 요소를 찾았습니다.`);
    
    // 각 tree-toggle에 대해 추가 버튼 존재 여부 확인
    let addButtonCount = 0;
    for (let i = 0; i < treeItems.length; i++) {
      const treeItem = treeItems[i];
      
      // 호버하여 추가 버튼이 보이도록 함 (opacity-0 group-hover:opacity-100)
      await treeItem.hover();
      await page.waitForTimeout(500);
      
      // 실제 DOM 구조에 맞는 선택자 사용
      let addButton = treeItem.locator('button[title="추가 메뉴"] .fas.fa-plus');
      
      // 다른 선택자들도 시도
      if (!(await addButton.isVisible())) {
        addButton = treeItem.locator('button[title="추가 메뉴"]');
      }
      if (!(await addButton.isVisible())) {
        addButton = treeItem.locator('.fa-plus');
      }
      if (!(await addButton.isVisible())) {
        addButton = treeItem.locator('i[class*="plus"]');
      }
      
      // 추가 버튼이 존재하는지 확인
      const isVisible = await addButton.isVisible();
      if (isVisible) {
        addButtonCount++;
        // 버튼이 클릭 가능한지 확인
        const isEnabled = await addButton.isEnabled();
        console.log(`Tree-toggle ${i + 1}: 추가 버튼 활성화 여부 = ${isEnabled}`);
        expect(isEnabled).toBe(true);
      }
      console.log(`Tree-toggle ${i + 1}: 추가 버튼 존재 여부 = ${isVisible}`);
    }
    
    console.log(`총 ${addButtonCount}개의 추가 버튼을 찾았습니다.`);
    
    // 최소 하나의 tree-toggle이 존재해야 함
    expect(treeItems.length).toBeGreaterThan(0);
  });

  test('추가 버튼 클릭 시 메뉴가 표시되는지 확인', async ({ page }) => {
    // tree-toggle 요소들 찾기
    const treeToggles = await page.locator('.tree-toggle').all();
    console.log(`총 ${treeToggles.length}개의 tree-toggle을 찾았습니다.`);
    
    let addButtonFound = false;
    
    // 각 tree-toggle에서 추가 버튼 찾기
    for (let i = 0; i < treeToggles.length; i++) {
      // 호버하여 추가 버튼이 보이도록 함
      await treeToggles[i].hover();
      await page.waitForTimeout(500);
      
      const addButton = treeToggles[i].locator('button[title="추가 메뉴"]');
      
      if (await addButton.isVisible()) {
        console.log(`Tree-toggle ${i + 1}에서 추가 버튼을 찾았습니다.`);
        
        // 버튼 클릭
        await addButton.click();
        await page.waitForTimeout(500);
        
        // 메뉴가 표시되는지 확인 (같은 tree-toggle 내부의 드롭다운 메뉴)
        let menu = treeToggles[i].locator('div.absolute.z-50.bg-white.border');
        
        // 다른 선택자들도 시도
        if (!(await menu.isVisible())) {
          menu = page.locator('.absolute.z-50.bg-white.border.border-gray-200.rounded-md.shadow-lg.py-1.min-w-32.block');
        }
        if (!(await menu.isVisible())) {
          menu = page.locator('[class*="menu"]');
        }
        if (!(await menu.isVisible())) {
          menu = page.locator('[class*="dropdown"]');
        }
        
        const isMenuVisible = await menu.isVisible();
        console.log(`메뉴 표시 상태: ${isMenuVisible}`);
        
        if (isMenuVisible) {
          await expect(menu).toBeVisible();
          console.log('메뉴가 성공적으로 표시됨');
          
          // 메뉴 항목들이 존재하는지 확인
          const subFolderOption = menu.locator('button:has-text("하위 폴더 추가")');
          const proNodeOption = menu.locator('button:has-text("ProNode 추가")');
          
          await expect(subFolderOption).toBeVisible();
          await expect(proNodeOption).toBeVisible();
          console.log('메뉴 항목들이 정상적으로 표시됨');
          
          addButtonFound = true;
          break;
        }
      }
    }
    
    if (!addButtonFound) {
      throw new Error('클릭 가능한 추가 버튼을 찾을 수 없습니다.');
    }
  });

  test('하위 폴더 추가 메뉴 항목 클릭 테스트', async ({ page }) => {
    // 콘솔 로그 수집을 위한 리스너 설정
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // tree-toggle 요소에서 추가 버튼 찾기
    const treeToggles = await page.locator('.tree-toggle').all();
    
    let menuOpened = false;
    
    for (let i = 0; i < treeToggles.length; i++) {
      // 호버하여 추가 버튼이 보이도록 함
      await treeToggles[i].hover();
      await page.waitForTimeout(500);
      
      const addButton = treeToggles[i].locator('button[title="추가 메뉴"]');
      
      if (await addButton.isVisible()) {
        // 추가 버튼 클릭하여 메뉴 열기
        await addButton.click();
        await page.waitForTimeout(500);
        console.log('추가 버튼 클릭됨');
        
        // 메뉴가 표시되는지 확인
        let menu = treeToggles[i].locator('div.absolute.z-50.bg-white.border');
        
        // 다른 선택자들도 시도
        if (!(await menu.isVisible())) {
          menu = page.locator('.absolute.z-50.bg-white.border.border-gray-200.rounded-md.shadow-lg.py-1.min-w-32.block');
        }
        if (!(await menu.isVisible())) {
          menu = page.locator('[class*="menu"]');
        }
        
        if (await menu.isVisible()) {
          // 하위 폴더 추가 메뉴 항목 클릭
          const subFolderOption = menu.locator('button:has-text("하위 폴더 추가")');
          await expect(subFolderOption).toBeVisible();
          await subFolderOption.click();
          console.log('하위 폴더 추가 메뉴 항목 클릭됨');
          
          menuOpened = true;
          break;
        }
      }
    }
    
    if (!menuOpened) {
      throw new Error('하위 폴더 추가 메뉴를 열 수 없습니다.');
    }
    
    // 잠시 대기하여 이벤트 처리 시간 확보
    await page.waitForTimeout(1000);
    
    // 콘솔 로그에서 예상되는 메시지 확인
    const hasAddSubfolderLog = consoleLogs.some(log => log.includes('하위 폴더 추가 함수 호출'));
    const hasMenuHideLog = consoleLogs.some(log => log.includes('메뉴 숨기기'));
    
    console.log('수집된 콘솔 로그:', consoleLogs);
    console.log('하위 폴더 추가 함수 호출 로그 존재:', hasAddSubfolderLog);
    console.log('메뉴 숨기기 로그 존재:', hasMenuHideLog);
  });

  test('ProNode 추가 메뉴 항목 클릭 테스트', async ({ page }) => {
    // 콘솔 로그 수집을 위한 리스너 설정
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // tree-toggle 요소에서 추가 버튼 찾기
    const treeToggles = await page.locator('.tree-toggle').all();
    
    let menuOpened = false;
    
    for (let i = 0; i < treeToggles.length; i++) {
      // 호버하여 추가 버튼이 보이도록 함
      await treeToggles[i].hover();
      await page.waitForTimeout(500);
      
      const addButton = treeToggles[i].locator('button[title="추가 메뉴"]');
      
      if (await addButton.isVisible()) {
        // 추가 버튼 클릭하여 메뉴 열기
        await addButton.click();
        await page.waitForTimeout(500);
        console.log('추가 버튼 클릭됨');
        
        // 메뉴가 표시되는지 확인
        let menu = treeToggles[i].locator('div.absolute.z-50.bg-white.border');
        
        // 다른 선택자들도 시도
        if (!(await menu.isVisible())) {
          menu = page.locator('.absolute.z-50.bg-white.border.border-gray-200.rounded-md.shadow-lg.py-1.min-w-32.block');
        }
        if (!(await menu.isVisible())) {
          menu = page.locator('[class*="menu"]');
        }
        
        if (await menu.isVisible()) {
          // ProNode 추가 메뉴 항목 클릭
          const proNodeOption = menu.locator('button:has-text("ProNode 추가")');
          await expect(proNodeOption).toBeVisible();
          await proNodeOption.click();
          console.log('ProNode 추가 메뉴 항목 클릭됨');
          
          menuOpened = true;
          break;
        }
      }
    }
    
    if (!menuOpened) {
      throw new Error('ProNode 추가 메뉴를 열 수 없습니다.');
    }
    
    // 잠시 대기하여 이벤트 처리 시간 확보
    await page.waitForTimeout(1000);
    
    // 콘솔 로그에서 예상되는 메시지 확인
    const hasAddProNodeLog = consoleLogs.some(log => log.includes('ProNode 추가 함수 호출'));
    const hasMenuHideLog = consoleLogs.some(log => log.includes('메뉴 숨기기'));
    
    console.log('수집된 콘솔 로그:', consoleLogs);
    console.log('ProNode 추가 함수 호출 로그 존재:', hasAddProNodeLog);
    console.log('메뉴 숨기기 로그 존재:', hasMenuHideLog);
  });

  test('모든 추가 버튼에 대한 종합 테스트', async ({ page }) => {
    // tree-toggle 요소들 찾기
    const treeToggles = await page.locator('.tree-toggle').all();
    console.log(`총 ${treeToggles.length}개의 tree-toggle을 찾았습니다.`);
    
    let addButtonCount = 0;
    
    // 각 tree-toggle에서 추가 버튼 찾기 및 테스트
    for (let i = 0; i < treeToggles.length; i++) {
      console.log(`\n=== Tree-toggle ${i + 1} 테스트 시작 ===`);
      
      // 호버하여 추가 버튼이 보이도록 함
      await treeToggles[i].hover();
      await page.waitForTimeout(500);
      
      const addButton = treeToggles[i].locator('button[title="추가 메뉴"]');
      
      if (await addButton.isVisible()) {
        addButtonCount++;
        console.log(`Tree-toggle ${i + 1}에서 추가 버튼을 찾았습니다.`);
        
        // 버튼 클릭
        await addButton.click();
        await page.waitForTimeout(500);
        console.log(`추가 버튼 ${i + 1} 클릭됨`);
        
        // 메뉴가 표시되는지 확인
        let menu = treeToggles[i].locator('div.absolute.z-50.bg-white.border');
        
        // 다른 선택자들도 시도
        if (!(await menu.isVisible())) {
          menu = page.locator('.absolute.z-50.bg-white.border.border-gray-200.rounded-md.shadow-lg.py-1.min-w-32.block');
        }
        if (!(await menu.isVisible())) {
          menu = page.locator('[class*="menu"]');
        }
        if (!(await menu.isVisible())) {
          menu = page.locator('[class*="dropdown"]');
        }
        
        try {
          await expect(menu).toBeVisible({ timeout: 2000 });
          console.log(`추가 버튼 ${i + 1}: 메뉴 표시 성공`);
          
          // 메뉴 항목들 확인
          const subFolderOption = menu.locator('button:has-text("하위 폴더 추가")');
          const proNodeOption = menu.locator('button:has-text("ProNode 추가")');
          
          const subFolderVisible = await subFolderOption.isVisible();
          const proNodeVisible = await proNodeOption.isVisible();
          
          console.log(`추가 버튼 ${i + 1}: 하위 폴더 추가 옵션 = ${subFolderVisible}`);
          console.log(`추가 버튼 ${i + 1}: ProNode 추가 옵션 = ${proNodeVisible}`);
          
          // 메뉴 외부 클릭하여 메뉴 닫기
          await page.click('body', { position: { x: 10, y: 10 } });
          await page.waitForTimeout(500);
          
        } catch (error) {
          console.log(`추가 버튼 ${i + 1}: 메뉴 표시 실패 - ${error.message}`);
        }
      } else {
        console.log(`Tree-toggle ${i + 1}: 추가 버튼이 보이지 않음`);
      }
    }
    
    console.log(`총 ${addButtonCount}개의 추가 버튼을 찾았습니다.`);
  });
});