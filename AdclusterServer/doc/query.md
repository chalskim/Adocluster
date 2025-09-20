## 데쉬보드


## 연구 프로젝트 
SELECT 
    p.prjid,
    p.crtid,
    mn.uname,
    p.title,
    p.description,
    p.start_date,
    COALESCE(p.status, 'begin') AS status,
    COUNT(n.*) AS notes,
    COUNT(u.*) AS users
FROM public.projects p
JOIN user_names mn
   ON p.crtid = mn.uid
LEFT JOIN public.pronote n 
    ON n.prjid = p.prjid
LEFT JOIN public.prjuser u
    ON u.prjid = p.prjid
WHERE (p.end_date IS NULL OR p.end_date < CURRENT_DATE)
GROUP BY p.prjid, p.crtid, mn.uname, p.title, p.description, p.start_date, COALESCE(p.status, 'begin')
