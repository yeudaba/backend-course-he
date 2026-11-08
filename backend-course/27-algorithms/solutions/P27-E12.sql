-- P27-E12
-- המשכורת השנייה בגובהה (בלי כפילויות). תת־שאילתה בתוך SELECT: אם אין שנייה — NULL ולא "אפס שורות"
SELECT (
  SELECT DISTINCT salary
  FROM employees
  ORDER BY salary DESC
  OFFSET 1 LIMIT 1
) AS second_salary;
