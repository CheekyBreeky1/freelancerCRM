-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priorityWeight" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "statusWeight" INTEGER NOT NULL DEFAULT 0;

UPDATE "Task" SET "statusWeight" = CASE "status"
  WHEN 'progress' THEN 0
  WHEN 'review'   THEN 1
  WHEN 'done'     THEN 2
  WHEN 'paid'     THEN 3
  ELSE 0
END;

UPDATE "Task" SET "priorityWeight" = CASE "priority"
  WHEN 'low'    THEN 0
  WHEN 'medium' THEN 1
  WHEN 'high'   THEN 2
  ELSE 1
END;